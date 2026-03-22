import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Save, X, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/productService';
import { useToast } from '@/components/ui/use-toast';

const EMPTY = { name: '', code: '', emoji: '', sort_order: 0, is_active: true };

const CategoryForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || EMPTY);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code) return;
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  const autoCode = (name) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0f0f0f] border border-[#D4AF37]/30 p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-[10px] text-gray-500 dark:text-white/40 uppercase tracking-widest mb-1.5">Nom *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value, code: form.code || autoCode(e.target.value) })}
            placeholder="ex: Mode & Vêtements"
            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]/50"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 dark:text-white/40 uppercase tracking-widest mb-1.5">Code * (unique)</label>
          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="ex: mode"
            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]/50"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 dark:text-white/40 uppercase tracking-widest mb-1.5">Emoji</label>
          <input
            value={form.emoji}
            onChange={(e) => setForm({ ...form, emoji: e.target.value })}
            placeholder="ex: 👗"
            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]/50"
            maxLength={4}
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div>
          <label className="block text-[10px] text-gray-500 dark:text-white/40 uppercase tracking-widest mb-1.5">Ordre</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
            className="w-20 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]/50"
            min="0"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-4">
          <div
            onClick={() => setForm({ ...form, is_active: !form.is_active })}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form.is_active ? 'bg-[#D4AF37]' : 'bg-white/20'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm text-gray-500 dark:text-white/60">Active</span>
        </label>
      </div>
      <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-white/10">
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#D4AF37] text-black px-5 py-2 text-xs uppercase tracking-widest hover:bg-[#D4AF37]/90 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer
        </button>
        <button type="button" onClick={onCancel} className="flex items-center gap-2 border border-gray-300 dark:border-white/20 text-gray-500 dark:text-white/50 px-5 py-2 text-xs uppercase tracking-widest hover:border-gray-400 dark:hover:border-white/40">
          <X className="w-4 h-4" /> Annuler
        </button>
      </div>
    </form>
  );
};

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      toast({ title: 'Erreur chargement', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form) => {
    try {
      await createCategory(form);
      setShowCreate(false);
      await load();
      toast({ title: 'Catégorie créée', description: form.name });
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      await updateCategory(id, form);
      setEditingId(null);
      await load();
      toast({ title: 'Catégorie mise à jour' });
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer "${name}" ? Les produits liés seront affectés.`)) return;
    setDeletingId(id);
    try {
      await deleteCategory(id);
      await load();
      toast({ title: 'Catégorie supprimée' });
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (cat) => {
    try {
      await updateCategory(cat.id, { ...cat, is_active: !cat.is_active });
      await load();
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
    </div>
  );

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-serif text-gray-900 dark:text-white tracking-wide">Catégories</h2>
          <p className="text-gray-500 dark:text-white/40 text-xs mt-1">{categories.length} catégorie{categories.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setEditingId(null); }}
          className="flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2.5 text-xs uppercase tracking-widest hover:bg-[#D4AF37]/90"
        >
          <Plus className="w-4 h-4" /> Nouvelle catégorie
        </button>
      </div>

      {showCreate && (
        <div className="mb-4">
          <CategoryForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
        </div>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
            {editingId === cat.id ? (
              <CategoryForm
                initial={cat}
                onSave={(form) => handleUpdate(cat.id, form)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-2xl w-8 shrink-0">{cat.emoji || '📦'}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-900 dark:text-white text-sm font-medium">{cat.name}</span>
                      <span className="text-gray-400 dark:text-white/30 text-xs border border-gray-200 dark:border-white/10 px-1.5 py-0.5 font-mono">{cat.code}</span>
                      {!cat.is_active && (
                        <span className="text-gray-400 dark:text-white/30 text-[10px] border border-gray-200 dark:border-white/10 px-1.5 py-0.5 line-through">Inactive</span>
                      )}
                    </div>
                    <p className="text-gray-400 dark:text-white/30 text-xs mt-0.5">Ordre : {cat.sort_order}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleToggle(cat)} className="p-2 text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white transition-colors" title={cat.is_active ? 'Désactiver' : 'Activer'}>
                    {cat.is_active ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => { setEditingId(cat.id); setShowCreate(false); }} className="p-2 text-gray-400 dark:text-white/30 hover:text-[#D4AF37] transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat.id, cat.name)} disabled={deletingId === cat.id} className="p-2 text-gray-400 dark:text-white/30 hover:text-red-400 transition-colors disabled:opacity-50">
                    {deletingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && !showCreate && (
        <div className="text-center py-16 border border-dashed border-gray-200 dark:border-white/10">
          <p className="text-gray-400 dark:text-white/30 text-sm mb-4">Aucune catégorie</p>
          <button onClick={() => setShowCreate(true)} className="text-[#D4AF37] text-xs underline">Créer la première</button>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
