import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  Percent,
  DollarSign,
} from 'lucide-react';
import { getCoupons, deleteCoupon, toggleCouponStatus } from '@/services/couponService';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const result = await getCoupons({
        search,
        page,
        limit: 15,
      });
      setCoupons(result.coupons);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [search, page]);

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleCouponStatus(id, !currentStatus);
      loadCoupons();
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Supprimer le coupon "${code}" ?`)) return;

    try {
      await deleteCoupon(id);
      loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 dark:text-white">Coupons</h1>
          <p className="text-gray-500 dark:text-white/60">{total} coupons au total</p>
        </div>
        <Link
          to="/admin/coupons/new"
          className="btn-gold-premium px-6 py-3 rounded-lg flex items-center gap-2 w-fit"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau coupon</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
        <input
          type="text"
          placeholder="Rechercher un code..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-bronze/30 rounded-lg pl-12 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
        />
      </div>

      {/* Coupons table */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 dark:text-white/40 text-sm border-b border-bronze/10">
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Réduction</th>
                <th className="px-6 py-4 font-medium">Utilisations</th>
                <th className="px-6 py-4 font-medium">Validité</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bronze/10">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
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
                      <div className="h-4 bg-bronze/10 rounded w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-bronze/10 rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 bg-bronze/10 rounded w-24" />
                    </td>
                  </tr>
                ))
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-white/40">
                    Aucun coupon trouvé
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <motion.tr
                    key={coupon.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gold/20 text-gold font-mono font-bold rounded">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {coupon.discount_type === 'percentage' ? (
                          <Percent className="w-4 h-4 text-gold" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-gold" />
                        )}
                        <span>
                          {coupon.discount_type === 'percentage'
                            ? `${coupon.discount_value}%`
                            : `${parseFloat(coupon.discount_value).toLocaleString('fr-FR')} FCFA`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-white/60">
                      {coupon.current_uses}
                      {coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-white/60 text-sm">
                      {coupon.valid_from || coupon.valid_until ? (
                        <>
                          {formatDate(coupon.valid_from)} - {formatDate(coupon.valid_until)}
                        </>
                      ) : (
                        'Illimité'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(coupon.id, coupon.is_active)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          coupon.is_active
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {coupon.is_active ? (
                          <>
                            <ToggleRight className="w-4 h-4" />
                            Actif
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4" />
                            Inactif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/coupons/${coupon.id}`)}
                          className="p-2 bg-gold/20 text-gold rounded-lg hover:bg-gold/30 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id, coupon.code)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

export default CouponList;
