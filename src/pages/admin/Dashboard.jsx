import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { getProducts } from '@/services/productService';
import { getSalesStats, getSalesByCategory, getKPIs } from '@/services/analyticsService';
import { isSupabaseConfigured } from '@/lib/supabase';

// Palette de couleurs pour les graphiques
const CHART_COLORS = ['#D4AF37', '#8B7355', '#2D7D6F', '#C4622D', '#1B2B4B', '#E8E0D4'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les données de graphiques (fonctionne en mode démo aussi)
        const [salesStatsData, categoryStatsData, kpisData] = await Promise.all([
          getSalesStats('week'),
          getSalesByCategory(),
          getKPIs(),
        ]);

        // Formater les données de ventes pour le graphique
        const formattedSalesData = Object.entries(salesStatsData.data).map(([day, values]) => ({
          name: day,
          revenue: values.revenue,
          orders: values.orders,
        }));
        setSalesData(formattedSalesData);
        setCategoryData(categoryStatsData);
        setKpis(kpisData);

        if (isSupabaseConfigured()) {
          const [statsData, topProductsData, productsData] = await Promise.all([
            getOrderStats(),
            getTopProducts(5),
            getProducts({ limit: 100 }),
          ]);

          setStats(statsData);
          setTopProducts(topProductsData);

          // Filtrer les produits avec stock faible
          const lowStock = productsData.products.filter(
            (p) => p.stock_quantity > 0 && p.stock_quantity <= 5
          );
          setLowStockProducts(lowStock);
        } else {
          // Mode démo
          setStats({
            totalOrders: 156,
            todayOrders: 12,
            monthOrders: 89,
            totalRevenue: 4850000,
            todayRevenue: 350000,
            monthRevenue: 2100000,
            ordersByStatus: {
              pending: 8,
              confirmed: 12,
              processing: 5,
              shipped: 15,
              delivered: 110,
              cancelled: 6,
            },
            recentOrders: [
              {
                id: 1,
                order_number: 'PH250322-0001',
                customer_name: 'Aminata Diallo',
                total: 125000,
                status: 'pending',
                created_at: new Date().toISOString(),
              },
              {
                id: 2,
                order_number: 'PH250322-0002',
                customer_name: 'Moussa Ndiaye',
                total: 89000,
                status: 'confirmed',
                created_at: new Date().toISOString(),
              },
            ],
          });
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration warning */}
      {!isSupabaseConfigured() && (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Chiffre d'affaires"
          value={stats?.totalRevenue || 0}
          suffix=" FCFA"
          icon={DollarSign}
          color="gold"
          trend="up"
          trendValue={`+${((stats?.monthRevenue / stats?.totalRevenue) * 100 || 0).toFixed(1)}% ce mois`}
        />
        <StatsCard
          title="Commandes totales"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          color="blue"
          trend="up"
          trendValue={`${stats?.todayOrders || 0} aujourd'hui`}
        />
        <StatsCard
          title="CA du mois"
          value={stats?.monthRevenue || 0}
          suffix=" FCFA"
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="En attente"
          value={stats?.ordersByStatus?.pending || 0}
          icon={Package}
          color="orange"
          trendValue="commandes à traiter"
        />
      </div>

      {/* KPIs avancés */}
      {kpis && (
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

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gold" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ventes des 7 derniers jours</h3>
          </div>

          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0A',
                    border: '1px solid #8B7355',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [`${value.toLocaleString('fr-FR')} FCFA`, 'Chiffre d\'affaires']}
                />
                <Bar
                  dataKey="revenue"
                  fill="#D4AF37"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-white/40">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Category pie chart */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-gold" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ventes par catégorie</h3>
          </div>

          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RechartPie>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="revenue"
                  nameKey="name"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0A',
                    border: '1px solid #8B7355',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [`${value.toLocaleString('fr-FR')} FCFA`]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#9CA3AF' }}
                  formatter={(value) => <span style={{ color: '#9CA3AF' }}>{value}</span>}
                />
              </RechartPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-white/40">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Commandes récentes</h3>
            <Link
              to="/admin/orders"
              className="text-gold text-sm hover:underline flex items-center gap-1"
            >
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
                {stats?.recentOrders?.map((order) => (
                  <tr key={order.id} className="text-gray-900 dark:text-white">
                    <td className="py-4">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-gold hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-4">{order.customer_name}</td>
                    <td className="py-4">
                      {parseFloat(order.total).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}

                {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-white/40">
                      Aucune commande récente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Statuts des commandes
          </h3>

          <div className="space-y-4">
            {Object.entries(stats?.ordersByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="text-gray-900 dark:text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top products & Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Produits les plus vendus
          </h3>

          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"
              >
                <span className="text-gold font-bold text-lg w-6">
                  #{index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white truncate">{product.name}</p>
                  <p className="text-gray-500 dark:text-white/40 text-sm">
                    {product.totalSold} vendus
                  </p>
                </div>
              </div>
            ))}

            {topProducts.length === 0 && (
              <p className="text-gray-500 dark:text-white/40 text-center py-4">
                Aucune vente enregistrée
              </p>
            )}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Alertes stock faible
            </h3>
          </div>

          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg"
              >
                <div className="min-w-0">
                  <p className="text-gray-900 dark:text-white truncate">{product.name}</p>
                  <p className="text-orange-400 text-sm">
                    SKU: {product.sku}
                  </p>
                </div>
                <span className="text-orange-400 font-bold">
                  {product.stock_quantity} restants
                </span>
              </div>
            ))}

            {lowStockProducts.length === 0 && (
              <p className="text-gray-500 dark:text-white/40 text-center py-4">
                Aucune alerte de stock
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
