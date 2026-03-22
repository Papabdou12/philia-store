import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Skeleton loader avec effet shimmer doré Philia'Store
 * Utilisé pour les états de chargement - meilleur UX que "Loading..."
 */
const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'skeleton-gold rounded-md',
        className
      )}
      {...props}
    />
  );
};

/**
 * Skeleton pour carte produit
 */
const ProductCardSkeleton = () => {
  return (
    <div className="bg-black rounded-xl overflow-hidden border border-bronze/20 animate-pulse">
      {/* Image placeholder */}
      <Skeleton className="aspect-square w-full" />

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Category */}
        <Skeleton className="h-3 w-20" />

        {/* Title */}
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />

        {/* Rating */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton pour grille de produits
 */
const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Skeleton pour texte (lignes)
 */
const TextSkeleton = ({ lines = 3, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton pour image hero
 */
const HeroSkeleton = () => {
  return (
    <div className="relative h-[60vh] md:h-[80vh] overflow-hidden">
      <Skeleton className="absolute inset-0" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-12 w-64 md:w-96 mb-4" />
        <Skeleton className="h-6 w-48 md:w-72 mb-8" />
        <Skeleton className="h-12 w-40 rounded-none" />
      </div>
    </div>
  );
};

export {
  Skeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  TextSkeleton,
  HeroSkeleton,
};
