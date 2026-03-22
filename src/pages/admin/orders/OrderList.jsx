import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import StatusBadge, { getStatusOptions } from '@/components/admin/StatusBadge';
import { getOrders } from '@/services/orderService';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const statusOptions = getStatusOptions();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const result = await getOrders({
        search,
        status: statusFilter || null,
        page,
        limit: 15,
      });
      setOrders(result.orders);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [search, statusFilter, page]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif text-gray-900 dark:text-white">Commandes</h1>
        <p className="text-gray-500 dark:text-white/60">{total} commandes au total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
          <input
            type="text"
            placeholder="Rechercher par n° commande, nom, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-bronze/30 rounded-lg pl-12 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-bronze/30 rounded-lg pl-12 pr-8 py-3 text-gray-900 dark:text-white focus:border-gold outline-none appearance-none min-w-[180px]"
          >
            <option value="">Tous les statuts</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 dark:text-white/40 text-sm border-b border-bronze/10">
                <th className="px-6 py-4 font-medium">Commande</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Paiement</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bronze/10">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-bronze/10 rounded w-28" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-bronze/10 rounded w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-bronze/10 rounded w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-bronze/10 rounded w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-bronze/10 rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-bronze/10 rounded w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 bg-bronze/10 rounded w-8" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-white/40">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-gold hover:underline font-medium"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-gray-500 dark:text-white/40 text-sm">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-white/60 text-sm">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {parseFloat(order.total).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-white/60 text-sm capitalize">
                      {order.payment_method}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="p-2 bg-gold/20 text-gold rounded-lg hover:bg-gold/30 transition-colors inline-flex"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-bronze/30 rounded-lg text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-gold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-gray-900 dark:text-white">
            Page {page} sur {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-bronze/30 rounded-lg text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-gold transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderList;
