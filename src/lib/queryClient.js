import { QueryClient } from '@tanstack/react-query';

/**
 * Configuration globale du QueryClient TanStack Query.
 *
 * Stratégie :
 *   - staleTime 30s  : les données sont considérées fraîches 30s → zéro re-fetch inutile
 *   - gcTime 5min    : les données inactives restent en cache 5 min (navigation rapide)
 *   - retry 1        : une seule relance en cas d'erreur réseau (3G/4G instable)
 *   - refetchOnWindowFocus false : évite les rafraîchissements intempestifs en admin
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,           // 30 secondes
      gcTime: 5 * 60 * 1000,          // 5 minutes en cache inactif
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,        // Rafraîchir au retour de la connexion
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Clés de cache — utilisées pour cibler les invalidations.
 *
 * Usage :
 *   queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
 *   useQuery({ queryKey: queryKeys.products.list(filters), queryFn: ... })
 */
export const queryKeys = {
  products: {
    all:    ['products'],
    list:   (filters) => ['products', 'list', filters],
    detail: (id)      => ['products', 'detail', id],
  },
  orders: {
    all:    ['orders'],
    list:   (filters) => ['orders', 'list', filters],
    detail: (id)      => ['orders', 'detail', id],
    stats:  ()        => ['orders', 'stats'],
  },
  coupons: {
    all:    ['coupons'],
    list:   ()        => ['coupons', 'list'],
    detail: (id)      => ['coupons', 'detail', id],
  },
  categories: {
    all:    ['categories'],
    list:   ()        => ['categories', 'list'],
  },
  testimonials: {
    all:    ['testimonials'],
    list:   ()        => ['testimonials', 'list'],
  },
  analytics: {
    kpis:           () => ['analytics', 'kpis'],
    sales:          (period) => ['analytics', 'sales', period],
    salesByCategory: ()      => ['analytics', 'salesByCategory'],
  },
};
