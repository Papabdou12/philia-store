import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getProducts, deleteProduct, getCategories } from '@/services/productService';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await getProducts({
        search,
        category: categoryFilter || null,
        page,
        limit: 12,
      });
      setProducts(result.products);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, categoryFilter, page]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;

    try {
      await deleteProduct(id);
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 dark:text-white">Produits</h1>
          <p className="text-gray-500 dark:text-white/60">{total} produits au total</p>
        </div>
        <Link
          to="/admin/products/new"
          className="btn-gold-premium px-6 py-3 rounded-lg flex items-center gap-2 w-fit"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau produit</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-bronze/30 rounded-lg pl-12 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:border-gold outline-none"
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/40" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-bronze/30 rounded-lg pl-12 pr-8 py-3 text-gray-900 dark:text-white focus:border-gold outline-none appearance-none min-w-[200px]"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.code || cat.id} value={cat.code || cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-bronze/10" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-bronze/10 rounded w-3/4" />
                <div className="h-3 bg-bronze/10 rounded w-1/2" />
                <div className="h-5 bg-bronze/10 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-white/60">Aucun produit trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl overflow-hidden hover:border-gold/50 transition-colors group"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-50 dark:bg-black">
                <img
                  src={product.image_url || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => navigate(`/admin/products/${product.id}`)}
                    className="p-3 bg-gold rounded-lg text-black hover:bg-gold/80 transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <Link
                    to={`/produit/${product.id}`}
                    target="_blank"
                    className="p-3 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
                    title="Voir sur le site"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="p-3 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.is_new && (
                    <span className="px-2 py-1 bg-gold text-black text-xs font-bold rounded">
                      NOUVEAU
                    </span>
                  )}
                  {product.discount > 0 && (
                    <span className="px-2 py-1 bg-bronze text-white text-xs font-bold rounded">
                      -{product.discount}%
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">
                      VEDETTE
                    </span>
                  )}
                  {product.is_bestseller && (
                    <span className="px-2 py-1 bg-emerald-600 text-white text-xs font-bold rounded">
                      BESTSELLER
                    </span>
                  )}
                </div>

                {/* Stock indicator */}
                {!product.in_stock && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="block text-center py-1 bg-red-500/80 text-white text-xs rounded">
                      Rupture de stock
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-bronze text-xs uppercase tracking-wider mb-1">
                  {product.category?.name || product.category}
                </p>
                <h3 className="text-gray-900 dark:text-white font-medium truncate">{product.name}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm mb-1">SKU: {product.sku}</p>
                {(product.brand || product.weight) && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {product.brand && (
                      <span className="text-gray-500 dark:text-white/50 text-xs">
                        {product.brand}
                      </span>
                    )}
                    {product.brand && product.weight && (
                      <span className="text-gray-400 dark:text-white/30 text-xs">·</span>
                    )}
                    {product.weight && (
                      <span className="text-gray-500 dark:text-white/50 text-xs">
                        {product.weight} g
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-gold font-bold">
                    {product.price?.toLocaleString('fr-FR')} FCFA
                  </span>
                  {product.old_price && (
                    <span className="text-gray-400 dark:text-white/40 text-sm line-through">
                      {product.old_price?.toLocaleString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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

export default ProductList;
