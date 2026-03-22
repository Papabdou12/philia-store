import React from 'react';

const statusConfig = {
  pending: {
    label: 'En attente',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  },
  confirmed: {
    label: 'Confirmée',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  processing: {
    label: 'En préparation',
    className: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  shipped: {
    label: 'Expédiée',
    className: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  },
  delivered: {
    label: 'Livrée',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  cancelled: {
    label: 'Annulée',
    className: 'bg-red-500/10 text-red-400 border-red-500/30',
  },
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.className} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
};

export const getStatusOptions = () => {
  return Object.entries(statusConfig).map(([value, config]) => ({
    value,
    label: config.label,
  }));
};

export default StatusBadge;
