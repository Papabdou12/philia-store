import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Save, X, Loader2, ToggleLeft, ToggleRight, Star } from 'lucide-react';
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonial,
} from '@/services/testimonialsService';
import { useToast } from '@/components/ui/use-toast';

const EMPTY = { name: '', role: '', text: '', rating: 5, is_active: true, sort_order: 0 };

// ─── Star Picker ─────────────────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="cursor-pointer"
      >
        <Star
          className={`w-5 h-5 transition-colors ${n <= value ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300 dark:text-white/20'}`}
        />
      </button>
    ))}
  </div>
);

// ─── Form ─────────────────────────────────────────────────────────────────────
const TestimonialForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || EMPTY);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.text) return;
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-[#D4AF37]/30 p-5 space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-widest mb-1.5">Nom *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="ex: Aïssatou D."
            className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]/50"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-widest mb-1.5">Rôle / Ville</label>
          <input
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="ex: Cliente fidèle, Dakar"
            className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-widest mb-1.5">Témoignage *</label>
        <textarea
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          placeholder="Ce que la cliente a dit..."
          rows={3}
          className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]/50 resize-none"
          required
        />
      </div>

      <div className="flex items-center gap-8 flex-wrap">
        <div>
          <label className="block text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-widest mb-2">Note</label>
          <StarPicker value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} />
        </div>
        <div>
          <label className="block text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-widest mb-1.5">Ordre</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
            className="w-20 bg-gray-50 dark:bg-black border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]/50"
            min="0"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-4">
          <div
            onClick={() => setForm({ ...form, is_active: !form.is_active })}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form.is_active ? 'bg-[#D4AF37]' : 'bg-gray-300 dark:bg-white/20'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm text-gray-500 dark:text-white/60">Visible</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-white/10">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-[#D4AF37] text-black px-5 py-2 text-xs uppercase tracking-widest hover:bg-[#D4AF37]/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 border border-gray-300 dark:border-white/20 text-gray-500 dark:text-white/50 px-5 py-2 text-xs uppercase tracking-widest hover:border-gray-400 dark:hover:border-white/40"
        >
          <X className="w-4 h-4" /> Annuler
        </button>
      </div>
    </form>
  );
};

// ─── List ─────────────────────────────────────────────────────────────────────
const TestimonialList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getAllTestimonials());
    } catch {
      toast({ title: 'Erreur chargement', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form) => {
    try {
      await createTestimonial(form);
      setShowCreate(false);
      await load();
      toast({ title: 'Témoignage ajouté', description: form.name });
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      await updateTestimonial(id, form);
      setEditingId(null);
      await load();
      toast({ title: 'Témoignage mis à jour' });
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer le témoignage de "${name}" ?`)) return;
    setDeletingId(id);
    try {
      await deleteTestimonial(id);
      await load();
      toast({ title: 'Témoignage supprimé' });
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleTestimonial(item.id, !item.is_active);
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
          <h2 className="text-base font-serif text-gray-900 dark:text-white tracking-wide">Témoignages</h2>
          <p className="text-gray-400 dark:text-white/40 text-xs mt-1">
            {items.length} témoignage{items.length > 1 ? 's' : ''} · {items.filter(t => t.is_active).length} visible{items.filter(t => t.is_active).length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setEditingId(null); }}
          className="flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2.5 text-xs uppercase tracking-widest hover:bg-[#D4AF37]/90"
        >
          <Plus className="w-4 h-4" /> Nouveau
        </button>
      </div>

      {showCreate && (
        <div className="mb-4">
          <TestimonialForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
            {editingId === item.id ? (
              <TestimonialForm
                initial={item}
                onSave={(form) => handleUpdate(item.id, form)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-start justify-between px-5 py-4 gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-9 h-9 shrink-0 bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-serif text-sm font-bold">
                    {item.avatar_letter || item.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-gray-900 dark:text-white text-sm font-medium">{item.name}</span>
                      {item.role && <span className="text-gray-400 dark:text-white/40 text-xs">{item.role}</span>}
                      <div className="flex gap-0.5">
                        {Array.from({ length: item.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                        ))}
                      </div>
                      {!item.is_active && (
                        <span className="text-[10px] border border-gray-300 dark:border-white/10 text-gray-400 dark:text-white/30 px-1.5 py-0.5">Masqué</span>
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-white/50 text-xs leading-relaxed line-clamp-2">"{item.text}"</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggle(item)}
                    className="p-2 text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
                    title={item.is_active ? 'Masquer' : 'Afficher'}
                  >
                    {item.is_active
                      ? <ToggleRight className="w-5 h-5 text-green-500" />
                      : <ToggleLeft className="w-5 h-5" />
                    }
                  </button>
                  <button
                    onClick={() => { setEditingId(item.id); setShowCreate(false); }}
                    className="p-2 text-gray-400 dark:text-white/30 hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    disabled={deletingId === item.id}
                    className="p-2 text-gray-400 dark:text-white/30 hover:text-red-500 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {deletingId === item.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && !showCreate && (
        <div className="text-center py-16 border border-dashed border-gray-300 dark:border-white/10">
          <p className="text-gray-400 dark:text-white/30 text-sm mb-4">Aucun témoignage</p>
          <button
            onClick={() => setShowCreate(true)}
            className="text-[#D4AF37] text-xs underline"
          >
            Ajouter le premier
          </button>
        </div>
      )}
    </div>
  );
};

export default TestimonialList;
