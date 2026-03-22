import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { queryClient, queryKeys } from '@/lib/queryClient';

const NotificationContext = createContext(null);

const STORAGE_KEY = 'philia_admin_notifications';
const MAX_NOTIFICATIONS = 50;

const loadStored = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveStored = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)));
  } catch { /* quota exceeded */ }
};

const STATUS_LABELS = {
  pending:    { label: 'En attente',   color: 'text-yellow-500' },
  confirmed:  { label: 'Confirmée',    color: 'text-blue-500'   },
  processing: { label: 'En préparation', color: 'text-purple-500' },
  shipped:    { label: 'Expédiée',     color: 'text-indigo-500' },
  delivered:  { label: 'Livrée',       color: 'text-green-500'  },
  cancelled:  { label: 'Annulée',      color: 'text-red-500'    },
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(loadStored);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef(null);

  // Dériver les non-lus depuis la liste
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Persister à chaque changement ──────────────────────────────────────
  useEffect(() => {
    saveStored(notifications);
  }, [notifications]);

  // ── Ajouter une notification ────────────────────────────────────────────
  const addNotification = useCallback((payload) => {
    const notif = {
      id: `${payload.type}-${payload.id || Date.now()}`,
      type: payload.type,                 // 'new_order' | 'order_updated'
      orderId: payload.orderId,
      orderNumber: payload.orderNumber,
      customerName: payload.customerName,
      total: payload.total,
      status: payload.status || 'pending',
      message: payload.message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => {
      // Dédupliquer par id
      const exists = prev.some((n) => n.id === notif.id);
      if (exists) return prev;
      return [notif, ...prev].slice(0, MAX_NOTIFICATIONS);
    });
  }, []);

  // ── Marquer une notification comme lue ─────────────────────────────────
  const markAsRead = useCallback((notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)),
    );
  }, []);

  // ── Marquer toutes comme lues ───────────────────────────────────────────
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // ── Vider l'historique ──────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // ── Supabase Realtime : écoute les nouvelles commandes ─────────────────
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new;
          addNotification({
            type: 'new_order',
            id: order.id,
            orderId: order.id,
            orderNumber: order.order_number,
            customerName: order.customer_name,
            total: order.total,
            status: order.status,
            message: `Nouvelle commande de ${order.customer_name} — ${order.total?.toLocaleString()} FCFA`,
          });

          // Invalider le cache TanStack Query pour rafraîchir les listes admin
          queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
          queryClient.invalidateQueries({ queryKey: queryKeys.analytics.kpis() });
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new;
          const old   = payload.old;

          // Notifier uniquement si le statut a changé
          if (order.status === old.status) return;

          const statusInfo = STATUS_LABELS[order.status] || { label: order.status };
          addNotification({
            type: 'order_updated',
            id: `${order.id}-${order.status}-${Date.now()}`,
            orderId: order.id,
            orderNumber: order.order_number,
            customerName: order.customer_name,
            total: order.total,
            status: order.status,
            message: `Commande ${order.order_number} → ${statusInfo.label}`,
          });

          queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(order.id) });
          queryClient.invalidateQueries({ queryKey: queryKeys.orders.list({}) });
        },
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [addNotification]);

  const value = {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification,
    STATUS_LABELS,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

export default NotificationContext;
