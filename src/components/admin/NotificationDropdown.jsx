import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, ShoppingCart, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

const timeAgo = (isoDate) => {
  const diff = Math.floor((Date.now() - new Date(isoDate)) / 1000);
  if (diff < 60)   return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
};

const NotifIcon = ({ type, status }) => {
  if (type === 'new_order') return <ShoppingCart className="w-4 h-4 text-[#D4AF37]" />;
  return <RefreshCw className="w-4 h-4 text-blue-400" />;
};

const NotificationDropdown = () => {
  const { notifications, unreadCount, connected, markAsRead, markAllAsRead, clearAll } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Fermer en cliquant à l'extérieur
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNotifClick = (notif) => {
    markAsRead(notif.id);
    setOpen(false);
    if (notif.orderId) navigate(`/admin/orders/${notif.orderId}`);
  };

  const handleBellClick = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div ref={ref} className="relative">
      {/* ── Bouton Bell ── */}
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-lg text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Badge non-lus */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#D4AF37] text-black text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Point connexion Realtime */}
        <span
          className={`absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full ${
            unreadCount > 0 ? 'hidden' : connected ? 'bg-green-500' : 'bg-gray-400 dark:bg-white/20'
          }`}
        />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 shadow-xl z-50 rounded-lg overflow-hidden">
          {/* Header dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Notifications</span>
              {connected ? (
                <span className="flex items-center gap-1 text-[10px] text-green-500">
                  <Wifi className="w-3 h-3" /> Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-white/30">
                  <WifiOff className="w-3 h-3" /> Hors ligne
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Tout marquer comme lu"
                  className="p-1.5 text-gray-400 dark:text-white/30 hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Vider l'historique"
                  className="p-1.5 text-gray-400 dark:text-white/30 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-gray-200 dark:text-white/10 mx-auto mb-2" />
                <p className="text-gray-400 dark:text-white/30 text-xs">Aucune notification</p>
                {connected && (
                  <p className="text-gray-300 dark:text-white/20 text-[10px] mt-1">
                    En attente de nouvelles commandes…
                  </p>
                )}
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`
                    w-full text-left flex items-start gap-3 px-4 py-3
                    border-b border-gray-50 dark:border-white/5 last:border-0
                    hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer
                    ${!notif.read ? 'bg-[#D4AF37]/5' : ''}
                  `}
                >
                  {/* Icône */}
                  <div className={`
                    mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    ${!notif.read
                      ? 'bg-[#D4AF37]/15 dark:bg-[#D4AF37]/10'
                      : 'bg-gray-100 dark:bg-white/5'
                    }
                  `}>
                    <NotifIcon type={notif.type} status={notif.status} />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug truncate ${
                      !notif.read ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-white/60'
                    }`}>
                      {notif.message}
                    </p>
                    {notif.orderNumber && (
                      <p className="text-[10px] text-gray-400 dark:text-white/30 mt-0.5">
                        #{notif.orderNumber}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-300 dark:text-white/20 mt-0.5">
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>

                  {/* Point non-lu */}
                  {!notif.read && (
                    <div className="mt-2 w-2 h-2 bg-[#D4AF37] rounded-full shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-white/10">
              <button
                onClick={() => { setOpen(false); navigate('/admin/orders'); }}
                className="text-[11px] text-[#D4AF37] hover:underline cursor-pointer"
              >
                Voir toutes les commandes →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
