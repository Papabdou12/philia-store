import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  BarChart3,
  PieChart,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartPie,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import StatsCard from '@/components/admin/StatsCard';
import StatusBadge from '@/components/admin/StatusBadge';
import { getOrderStats, getTopProducts } from '@/services/orderService';
import { getSalesStats, getSalesByCategory, getKPIs } from '@/services/analyticsService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';

const CHART_COLORS = ['#D4AF37', '#8B7355', '#2D7D6F', '#C4622D', '#1B2B4B', '#E8E0D4'];

// Requête unique qui charge toutes les données du dashboard en parallèle
const fetchDashboardData = async () => {
  const configured = isSupabaseConfigured();

  const [salesStats, categoryStats, kpis, orderStats, topProducts, lowStock] = await Promise.all([
    getSalesStats('week'),
    getSalesByCategory(),
    getKPIs(),
    configured ? getOrderStats() : Promise.resolve(null),
    configured ? getTopProducts(5) : Promise.resolve([]),
    configured
      ? supabase
          .from('products')
          .select('id, name, sku, stock_quantity')
          .gt('stock_quantity', 0)
          .lte('stock_quantity', 5)
          .order('stock_quantity', { ascending: true })
          .limit(10)
          .then(({ data }) => data || [])
      : Promise.resolve([]),
  ]);

  const salesData = Object.entries(salesStats.data).map(([day, values]) => ({
    name: day,
    revenue: values.revenue,
    orders: values.orders,
  }));

  return { salesData, categoryStats, kpis, orderStats, topProducts, lowStock, configured };
};

// Skeleton pour les cartes stats
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/2 mb-3" />
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/3" />
      </div>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <div className="h-72 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-400 dark:text-white/20 text-sm">Chargement...</div>
  </div>
);

const Dashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.analytics.kpis(),
    queryFn: fetchDashboardData,
    staleTime: 60 * 1000, // 1 min — navigation instantanée si retour dans la minute
    gcTime: 5 * 60 * 1000,
  });

  const { salesData = [], categoryStats = [], kpis = null, orderStats = null, topProducts = [], lowStock = [], configured = false } = data || {};

  return (
    <div className="space-y-6">
      {/* Configuration warning */}
      {!configured && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 font-medium">Mode démonstration</p>
            <p className="text-yellow-400/70 text-sm">
              Configurez les variables Supabase dans .env.local pour activer toutes les fonctionnalités.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats cards */}
      {isLoading ? <StatsSkeleton /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Chiffre d'affaires"
            value={orderStats?.totalRevenue || 0}
            suffix=" FCFA"
            icon={DollarSign}
            color="gold"
            trend="up"
            trendValue={`+${((orderStats?.monthRevenue / orderStats?.totalRevenue) * 100 || 0).toFixed(1)}% ce mois`}
          />
          <StatsCard
            title="Commandes totales"
            value={orderStats?.totalOrders || 0}
            icon={ShoppingCart}
            color="blue"
            trend="up"
            trendValue={`${orderStats?.todayOrders || 0} aujourd'hui`}
          />
          <StatsCard
            title="CA du mois"
            value={orderStats?.monthRevenue || 0}
            suffix=" FCFA"
            icon={TrendingUp}
            color="green"
          />
          <StatsCard
            title="En attente"
            value={orderStats?.ordersByStatus?.pending || 0}
            icon={Package}
            color="orange"
            trendValue="commandes à traiter"
          />
        </div>
      )}

      {/* KPIs avancés */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-2/3 mb-2" />
              <div className="h-7 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-4">
            <p className="text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider mb-1">Panier moyen</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis.avgOrderValue?.toLocaleString('fr-FR')} <span className="text-sm text-gray-500 dark:text-white/60">FCFA</span></p>
          </div>
          <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-4">
            <p className="text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider mb-1">Taux conversion</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis.conversionRate}%</p>
          </div>
          <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-4">
            <p className="text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider mb-1">Produits vendus</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis.totalSold?.toLocaleString('fr-FR')}</p>
          </div>
          <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-4">
            <p className="text-gray-400 dark:text-white/40 text-xs uppercase tracking-wider mb-1">Croissance CA</p>
            <p className={`text-2xl font-bold ${parseFloat(kpis.revenueGrowth) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(kpis.revenueGrowth) >= 0 ? '+' : ''}{kpis.revenueGrowth}%
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gold" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ventes des 7 derniers jours</h3>
          </div>
          {isLoading ? <ChartSkeleton /> : salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #8B7355', borderRadius: '8px', color: '#fff' }}
                  formatter={(v) => [`${v.toLocaleString('fr-FR')} FCFA`, "Chiffre d'affaires"]}
                />
                <Bar dataKey="revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-white/40">Aucune donnée disponible</div>
          )}
        </div>

        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-gold" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ventes par catégorie</h3>
          </div>
          {isLoading ? <ChartSkeleton /> : categoryStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RechartPie>
                <Pie data={categoryStats} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="revenue" nameKey="name">
                  {categoryStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #8B7355', borderRadius: '8px', color: '#fff' }}
                  formatter={(v) => [`${v.toLocaleString('fr-FR')} FCFA`]}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(v) => <span style={{ color: '#9CA3AF' }}>{v}</span>} />
              </RechartPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-white/40">Aucune donnée disponible</div>
          )}
        </div>
      </div>

      {/* Recent orders + status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Commandes récentes</h3>
            <Link to="/admin/orders" className="text-gold text-sm hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 dark:text-white/40 text-sm border-b border-bronze/10">
                  <th className="pb-3 font-medium">Commande</th>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bronze/10">
                {isLoading
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(4)].map((_, j) => (
                          <td key={j} className="py-4"><div className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse" /></td>
                        ))}
                      </tr>
                    ))
                  : orderStats?.recentOrders?.length > 0
                    ? orderStats.recentOrders.map((order) => (
                        <tr key={order.id} className="text-gray-900 dark:text-white">
                          <td className="py-4">
                            <Link to={`/admin/orders/${order.id}`} className="text-gold hover:underline">{order.order_number}</Link>
                          </td>
                          <td className="py-4">{order.customer_name}</td>
                          <td className="py-4">{parseFloat(order.total).toLocaleString('fr-FR')} FCFA</td>
                          <td className="py-4"><StatusBadge status={order.status} /></td>
                        </tr>
                      ))
                    : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-white/40">Aucune commande récente</td>
                        </tr>
                      )
                }
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Statuts des commandes</h3>
          <div className="space-y-4">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between animate-pulse">
                    <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-24" />
                    <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-8" />
                  </div>
                ))
              : Object.entries(orderStats?.ordersByStatus || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <StatusBadge status={status} />
                    <span className="text-gray-900 dark:text-white font-medium">{count}</span>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      {/* Top products + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Produits les plus vendus</h3>
          <div className="space-y-4">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-white/10 rounded" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4 mb-1" />
                      <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/4" />
                    </div>
                  </div>
                ))
              : topProducts.length > 0
                ? topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">
                      <span className="text-gold font-bold text-lg w-6">#{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white truncate">{product.name}</p>
                        <p className="text-gray-500 dark:text-white/40 text-sm">{product.totalSold} vendus</p>
                      </div>
                    </div>
                  ))
                : <p className="text-gray-500 dark:text-white/40 text-center py-4">Aucune vente enregistrée</p>
            }
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Alertes stock faible</h3>
          </div>
          <div className="space-y-3">
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 border border-orange-500/20 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-2/3 mb-1" />
                    <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/3" />
                  </div>
                ))
              : lowStock.length > 0
                ? lowStock.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                      <div className="min-w-0">
                        <p className="text-gray-900 dark:text-white truncate">{product.name}</p>
                        <p className="text-orange-400 text-sm">SKU: {product.sku}</p>
                      </div>
                      <span className="text-orange-400 font-bold">{product.stock_quantity} restants</span>
                    </div>
                  ))
                : <p className="text-gray-500 dark:text-white/40 text-center py-4">Aucune alerte de stock</p>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
