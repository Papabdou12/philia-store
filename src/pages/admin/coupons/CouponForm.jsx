import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { getCouponById, createCoupon, updateCoupon } from '@/services/couponService';

const CouponForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
  });

  useEffect(() => {
    const loadCoupon = async () => {
      if (!isEditing) return;

      setLoading(true);
      try {
        const coupon = await getCouponById(id);
        if (coupon) {
          setFormData({
            code: coupon.code || '',
            discountType: coupon.discount_type || 'percentage',
            discountValue: coupon.discount_value || '',
            minOrderAmount: coupon.min_order_amount || '',
            maxUses: coupon.max_uses || '',
            validFrom: coupon.valid_from?.split('T')[0] || '',
            validUntil: coupon.valid_until?.split('T')[0] || '',
            isActive: coupon.is_active ?? true,
          });
        }
      } catch (error) {
        console.error('Error loading coupon:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCoupon();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const couponData = {
        code: formData.code,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        validFrom: formData.validFrom || null,
        validUntil: formData.validUntil || null,
        isActive: formData.isActive,
      };

      if (isEditing) {
        await updateCoupon(id, couponData);
      } else {
        await createCoupon(couponData);
      }

      navigate('/admin/coupons');
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/coupons')}
          className="p-2 bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-bronze/30 rounded-lg text-gray-900 dark:text-white hover:border-gold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-serif text-gray-900 dark:text-white">
            {isEditing ? 'Modifier le coupon' : 'Nouveau coupon'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white uppercase font-mono placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
              placeholder="BIENVENUE20"
            />
            <p className="text-gray-500 dark:text-white/40 text-sm mt-1">
              Le code sera automatiquement converti en majuscules
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Type de réduction *
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:border-gold outline-none"
              >
                <option value="percentage">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (FCFA)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Valeur de la réduction *
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                required
                min="0"
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
                placeholder={formData.discountType === 'percentage' ? '15' : '10000'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Montant minimum de commande (FCFA)
              </label>
              <input
                type="number"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleChange}
                min="0"
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Nombre max d'utilisations
              </label>
              <input
                type="number"
                name="maxUses"
                value={formData.maxUses}
                onChange={handleChange}
                min="1"
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
                placeholder="Illimité"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Date de début
              </label>
              <input
                type="date"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:border-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Date de fin
              </label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:border-gold outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-300 dark:border-bronze/30 bg-gray-50 dark:bg-black text-gold focus:ring-gold"
            />
            <span className="text-gray-900 dark:text-white">Coupon actif</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/coupons')}
            className="px-6 py-3 border border-gray-300 dark:border-bronze/30 rounded-lg text-gray-900 dark:text-white hover:border-gray-500 dark:hover:border-white/50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-gold-premium px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{isEditing ? 'Enregistrer' : 'Créer le coupon'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CouponForm;
