import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import {
  getProductById,
  createProduct,
  updateProduct,
  getCategories,
} from '@/services/productService';

const ProductForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    sku: '',
    price: '',
    old_price: '',
    discount: 0,
    stock_quantity: 0,
    is_new: false,
    in_stock: true,
    rating: 0,
    reviews_count: 0,
    weight: '',
    brand: '',
    is_featured: false,
    is_bestseller: false,
    min_order_quantity: 1,
    meta_title: '',
    meta_description: '',
  });

  const [images, setImages] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const cats = await getCategories();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  // Load product if editing
  useEffect(() => {
    const loadProduct = async () => {
      if (!isEditing) return;

      setLoading(true);
      try {
        const product = await getProductById(id);
        if (product) {
          setFormData({
            name: product.name || '',
            category_id: product.category_id || '',
            description: product.description || '',
            sku: product.sku || '',
            price: product.price || '',
            old_price: product.old_price || '',
            discount: product.discount || 0,
            stock_quantity: product.stock_quantity || 0,
            is_new: product.is_new || false,
            in_stock: product.in_stock ?? true,
            rating: product.rating || 0,
            reviews_count: product.reviews_count || 0,
            weight: product.weight || '',
            brand: product.brand || '',
            is_featured: product.is_featured || false,
            is_bestseller: product.is_bestseller || false,
            min_order_quantity: product.min_order_quantity || 1,
            meta_title: product.meta_title || '',
            meta_description: product.meta_description || '',
          });

          // Tags
          if (product.tags && Array.isArray(product.tags)) {
            setTags(product.tags);
          }

          // Images
          if (product.images) {
            setImages(product.images.map((img) => ({ url: img.image_url })));
          } else if (product.image_url) {
            setImages([{ url: product.image_url }]);
          }

          // Variants
          if (product.variants) {
            setColors(
              product.variants
                .filter((v) => v.variant_type === 'color')
                .map((v) => v.variant_value)
            );
            setSizes(
              product.variants
                .filter((v) => v.variant_type === 'size')
                .map((v) => v.variant_value)
            );
          }
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors([...colors, newColor.trim()]);
      setNewColor('');
    }
  };

  const handleAddSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      setSizes([...sizes, newSize.trim()]);
      setNewSize('');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        old_price: formData.old_price ? parseFloat(formData.old_price) : null,
        discount: parseInt(formData.discount) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        category_id: parseInt(formData.category_id) || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        min_order_quantity: parseInt(formData.min_order_quantity) || 1,
        tags,
        image_url: images[0]?.url || null,
        images,
        variants: {
          colors,
          sizes,
        },
      };

      if (isEditing) {
        await updateProduct(id, productData);
      } else {
        await createProduct(productData);
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-bronze/30 rounded-lg text-gray-900 dark:text-white hover:border-gold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-serif text-gray-900 dark:text-white">
            {isEditing ? 'Modifier le produit' : 'Nouveau produit'}
          </h1>
          <p className="text-gray-500 dark:text-white/60">
            {isEditing ? `SKU: ${formData.sku}` : 'Créer un nouveau produit'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Images */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Images</h2>
          <ImageUploader images={images} onChange={setImages} maxImages={5} />
        </div>

        {/* Basic info */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Informations générales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Nom du produit *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
                placeholder="Ex: Robe Wax Élégante"
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Catégorie *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:border-gold outline-none"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">SKU *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
                placeholder="Ex: MODE-001"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none resize-none"
                placeholder="Description du produit..."
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Prix et stock</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Prix (FCFA) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
                placeholder="25000"
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Ancien prix
              </label>
              <input
                type="number"
                name="old_price"
                value={formData.old_price}
                onChange={handleChange}
                min="0"
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
                placeholder="30000"
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Réduction (%)
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
                placeholder="15"
              />
            </div>

            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Stock
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                min="0"
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
                placeholder="50"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="in_stock"
                checked={formData.in_stock}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 dark:border-bronze/30 bg-gray-50 dark:bg-black text-gold focus:ring-gold"
              />
              <span className="text-gray-900 dark:text-white">En stock</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_new"
                checked={formData.is_new}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 dark:border-bronze/30 bg-gray-50 dark:bg-black text-gold focus:ring-gold"
              />
              <span className="text-gray-900 dark:text-white">Nouveau produit</span>
            </label>
          </div>
        </div>

        {/* Product details */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Détails produit</h2>

          <div className="space-y-6">
            {/* Poids & Marque */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Poids (grammes)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#333] rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
                  placeholder="ex: 500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Marque
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#333] rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
                  placeholder="ex: Nike"
                />
              </div>
            </div>

            {/* Qté min commande */}
            <div className="md:w-1/2">
              <label className="block text-sm text-gray-400 mb-1">
                Quantité minimum par commande
              </label>
              <input
                type="number"
                name="min_order_quantity"
                value={formData.min_order_quantity}
                onChange={handleChange}
                min="1"
                className="w-full bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#333] rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
              />
            </div>
          </div>
        </div>

        {/* Badges & Mise en avant */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Badges & Mise en avant</h2>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 dark:border-bronze/30 bg-gray-50 dark:bg-black text-gold focus:ring-gold"
              />
              <span className="text-gray-900 dark:text-white">Produit vedette</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_bestseller"
                checked={formData.is_bestseller}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 dark:border-bronze/30 bg-gray-50 dark:bg-black text-gold focus:ring-gold"
              />
              <span className="text-gray-900 dark:text-white">Bestseller</span>
            </label>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Variantes</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colors */}
            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Couleurs
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                  className="flex-1 bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
                  placeholder="Ex: Or"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="p-2 bg-gold/20 text-gold rounded-lg hover:bg-gold/30"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <span
                    key={color}
                    className="px-3 py-1 bg-bronze/20 text-gray-900 dark:text-white rounded-full flex items-center gap-2"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => setColors(colors.filter((c) => c !== color))}
                      className="text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-gray-900 dark:text-white/80 text-sm mb-2">
                Tailles
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                  className="flex-1 bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
                  placeholder="Ex: M"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="p-2 bg-gold/20 text-gold rounded-lg hover:bg-gold/30"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <span
                    key={size}
                    className="px-3 py-1 bg-bronze/20 text-gray-900 dark:text-white rounded-full flex items-center gap-2"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => setSizes(sizes.filter((s) => s !== size))}
                      className="text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tags de recherche</h2>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
              placeholder="Ex: wax, tendance, été..."
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="p-2 bg-gold/20 text-gold rounded-lg hover:bg-gold/30"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-bronze/20 text-white rounded-full flex items-center gap-2"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                  className="text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">SEO</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Meta Title (SEO)
              </label>
              <input
                type="text"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleChange}
                maxLength={255}
                className="w-full bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#333] rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
                placeholder="Titre optimisé pour les moteurs de recherche"
              />
              <p className="text-gray-400 dark:text-white/30 text-xs mt-1">
                {formData.meta_title.length}/255 caractères
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Meta Description (SEO)
              </label>
              <textarea
                name="meta_description"
                value={formData.meta_description}
                onChange={handleChange}
                rows={2}
                className="w-full bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#333] rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none resize-none"
                placeholder="Description courte pour les résultats de recherche (150-160 caractères recommandés)"
              />
              <p className="text-gray-400 dark:text-white/30 text-xs mt-1">
                {formData.meta_description.length} caractères
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
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
            <span>{isEditing ? 'Enregistrer' : 'Créer le produit'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
