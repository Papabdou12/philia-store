import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Save, X, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';
import {
  getAllDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
  toggleDeliveryZone,
  getAllSettings,
  updateManySettings,
  SENEGAL_REGIONS_LIST,
} from '@/services/settingsService';
import { useToast } from '@/components/ui/use-toast';

// ─── ZONE FORM ───────────────────────────────────────────────────────────────
const EMPTY_ZONE = { name: '', price: '', delay: '', regions: [], is_active: true, sort_order: 0 };

const ZoneForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || EMPTY_ZONE);
  const [saving, setSaving] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');

  const toggleRegion = (r) => {
    setForm((prev) => ({
      ...prev,
      regions: prev.regions.includes(r)
        ? prev.regions.filter((x) => x !== r)
        : [...prev.regions, r],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.delay) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const filtered = SENEGAL_REGIONS_LIST.filter((r) =>
    r.toLowerCase().includes(regionSearch.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0f0f0f] border border-[#D4AF37]/30 p-6 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-500 dark:text-white/50 uppercase tracking-widest mb-2">Nom de la zone *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="ex: Dakar Express"
            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37]/50"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-white/50 uppercase tracking-widest mb-2">Prix (FCFA) *</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="ex: 2500"
            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37]/50"
            min="0"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-white/50 uppercase tracking-widest mb-2">Délai *</label>
          <input
            value={form.delay}
            onChange={(e) => setForm({ ...form, delay: e.target.value })}
            placeholder="ex: 24h ou 48-72h"
            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37]/50"
            required
          />
        </div>
      </div>

      {/* Régions */}
      <div>
        <label className="block text-xs text-gray-500 dark:text-white/50 uppercase tracking-widest mb-2">
          Régions couvertes ({form.regions.length} sélectionnées)
        </label>
        <input
          value={regionSearch}
          onChange={(e) => setRegionSearch(e.target.value)}
          placeholder="Rechercher une région..."
          className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#D4AF37]/50"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
          {filtered.map((region) => (
            <label
              key={region}
              className={`flex items-center gap-2 px-3 py-2 border cursor-pointer transition-colors text-xs ${
                form.regions.includes(region)
                  ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/30'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={form.regions.includes(region)}
                onChange={() => toggleRegion(region)}
              />
              {region}
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, regions: [...SENEGAL_REGIONS_LIST] })}
            className="text-xs text-[#D4AF37] hover:underline"
          >
            Tout sélectionner
          </button>
          <span className="text-gray-300 dark:text-white/20">|</span>
          <button
            type="button"
            onClick={() => setForm({ ...form, regions: [] })}
            className="text-xs text-gray-400 dark:text-white/40 hover:underline"
          >
            Tout désélectionner
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="hidden"
          />
          <div className={`w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-[#D4AF37]' : 'bg-white/20'} relative`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm text-gray-500 dark:text-white/70">Zone active</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-white/10">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-[#D4AF37] text-black px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-[#D4AF37]/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 border border-gray-300 dark:border-white/20 text-gray-500 dark:text-white/60 px-5 py-2.5 text-xs uppercase tracking-widest hover:border-gray-400 dark:hover:border-white/40 transition-colors"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
      </div>
    </form>
  );
};

// ─── ONGLET LIVRAISON ────────────────────────────────────────────────────────
const DeliveryTab = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { toast } = useToast();

  const loadZones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllDeliveryZones();
      setZones(data);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger les zones', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadZones(); }, [loadZones]);

  const handleCreate = async (form) => {
    try {
      await createDeliveryZone({ ...form, sort_order: zones.length });
      setShowCreate(false);
      await loadZones();
      toast({ title: 'Zone créée', description: `"${form.name}" ajoutée avec succès` });
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      await updateDeliveryZone(id, form);
      setEditingId(null);
      await loadZones();
      toast({ title: 'Zone mise à jour', description: `"${form.name}" modifiée` });
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer la zone "${name}" ?`)) return;
    setDeletingId(id);
    try {
      await deleteDeliveryZone(id);
      await loadZones();
      toast({ title: 'Zone supprimée' });
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id, current) => {
    try {
      await toggleDeliveryZone(id, !current);
      await loadZones();
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-serif text-gray-900 dark:text-white tracking-wide">Zones de livraison</h3>
          <p className="text-gray-500 dark:text-white/40 text-xs mt-1">{zones.length} zone{zones.length > 1 ? 's' : ''} configurée{zones.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setEditingId(null); }}
          className="flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2.5 text-xs uppercase tracking-widest hover:bg-[#D4AF37]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle zone
        </button>
      </div>

      {showCreate && (
        <ZoneForm
          onSave={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <div className="space-y-3">
        {zones.map((zone) => (
          <div key={zone.id} className="border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
            {editingId === zone.id ? (
              <ZoneForm
                initial={zone}
                onSave={(form) => handleUpdate(zone.id, form)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h4 className="text-gray-900 dark:text-white font-medium text-sm">{zone.name}</h4>
                      <span className="text-[#D4AF37] text-xs border border-[#D4AF37]/30 px-2 py-0.5">
                        {zone.price?.toLocaleString()} FCFA
                      </span>
                      <span className="text-gray-500 dark:text-white/40 text-xs border border-gray-200 dark:border-white/10 px-2 py-0.5">
                        {zone.delay}
                      </span>
                      <span className={`text-xs px-2 py-0.5 ${zone.is_active ? 'text-green-400 border border-green-400/30' : 'text-gray-400 dark:text-white/30 border border-gray-200 dark:border-white/10 line-through'}`}>
                        {zone.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-white/40 text-xs leading-relaxed">
                      <span className="text-gray-400 dark:text-white/30 uppercase tracking-widest mr-1 text-[10px]">Régions:</span>
                      {zone.regions?.length > 0
                        ? zone.regions.slice(0, 6).join(' · ') + (zone.regions.length > 6 ? ` +${zone.regions.length - 6}` : '')
                        : <span className="italic">Aucune région sélectionnée</span>
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggle(zone.id, zone.is_active)}
                      className="p-2 text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors"
                      title={zone.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {zone.is_active
                        ? <ToggleRight className="w-5 h-5 text-green-400" />
                        : <ToggleLeft className="w-5 h-5" />
                      }
                    </button>
                    <button
                      onClick={() => { setEditingId(zone.id); setShowCreate(false); }}
                      className="p-2 text-gray-400 dark:text-white/40 hover:text-[#D4AF37] transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(zone.id, zone.name)}
                      disabled={deletingId === zone.id}
                      className="p-2 text-gray-400 dark:text-white/40 hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      {deletingId === zone.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {zones.length === 0 && !showCreate && (
        <div className="text-center py-16 border border-dashed border-gray-200 dark:border-white/10">
          <p className="text-gray-400 dark:text-white/30 text-sm mb-4">Aucune zone configurée</p>
          <button
            onClick={() => setShowCreate(true)}
            className="text-[#D4AF37] text-xs underline"
          >
            Créer la première zone
          </button>
        </div>
      )}
    </div>
  );
};

// ─── ONGLET BOUTIQUE ─────────────────────────────────────────────────────────
const StoreTab = () => {
  const [settings, setSettings] = useState({});
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const EDITABLE_KEYS = [
    { key: 'announcement_bar', label: 'Texte barre d\'annonce', type: 'text', desc: 'Affiché en haut du site' },
    { key: 'store_phone', label: 'Téléphone', type: 'text', desc: 'Format: +221 XX XXX XX XX' },
    { key: 'store_email', label: 'Email', type: 'email', desc: 'Email de contact public' },
    { key: 'store_address', label: 'Adresse', type: 'text', desc: 'Ville, Pays' },
    { key: 'store_whatsapp', label: 'Lien WhatsApp', type: 'text', desc: 'Format: https://wa.me/221...' },
    { key: 'returns_delay_days', label: 'Délai de retour (jours)', type: 'number', desc: 'Nombre de jours pour retourner un article' },
    { key: 'returns_policy', label: 'Résumé politique de retour', type: 'textarea', desc: 'Affiché sur la page Retours' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllSettings();
        setSettings(data);
        const initial = {};
        EDITABLE_KEYS.forEach(({ key }) => {
          initial[key] = data[key]?.value ?? '';
        });
        setForm(initial);
      } catch {
        toast({ title: 'Erreur chargement', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateManySettings(form);
      toast({ title: 'Paramètres sauvegardés', description: 'Les modifications sont en ligne' });
    } catch (err) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
      <div>
        <h3 className="text-base font-serif text-gray-900 dark:text-white tracking-wide mb-1">Informations boutique</h3>
        <p className="text-gray-500 dark:text-white/40 text-xs">Ces données sont affichées sur le site (footer, pages contact, etc.)</p>
      </div>

      {EDITABLE_KEYS.map(({ key, label, type, desc }) => (
        <div key={key}>
          <label className="block text-xs text-gray-500 dark:text-white/50 uppercase tracking-widest mb-1.5">{label}</label>
          {desc && <p className="text-gray-400 dark:text-white/30 text-xs mb-2">{desc}</p>}
          {type === 'textarea' ? (
            <textarea
              value={form[key] ?? ''}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              rows={3}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37]/50 resize-none"
            />
          ) : (
            <input
              type={type}
              value={form[key] ?? ''}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37]/50"
            />
          )}
          {settings[key]?.updated_at && (
            <p className="text-gray-300 dark:text-white/20 text-[10px] mt-1">
              Mis à jour : {new Date(settings[key].updated_at).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      ))}

      <div className="pt-4 border-t border-gray-200 dark:border-white/10">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-[#D4AF37] text-black px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#D4AF37]/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Sauvegarder
        </button>
      </div>
    </form>
  );
};

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'delivery', label: 'Livraison', icon: '🚚' },
  { id: 'store', label: 'Boutique', icon: '🏪' },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('delivery');

  return (
    <div className="max-w-5xl">
      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-200 dark:border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm transition-colors border-b-2 -mb-px cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'delivery' && <DeliveryTab />}
      {activeTab === 'store' && <StoreTab />}
    </div>
  );
};

export default Settings;
