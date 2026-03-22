import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  prefix = '',
  suffix = '',
  color = 'gold',
}) => {
  const colorClasses = {
    gold: 'bg-gold/10 text-gold border-gold/30',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  };

  const iconColorClasses = {
    gold: 'bg-gold/20 text-gold',
    green: 'bg-emerald-500/20 text-emerald-400',
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    orange: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-[#0A0A0A] border rounded-xl p-6 ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 dark:text-white/60 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {prefix}
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
            {suffix}
          </p>

          {/* Trend */}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-red-400" />
              ) : null}
              <span
                className={`text-sm ${
                  trend === 'up'
                    ? 'text-emerald-400'
                    : trend === 'down'
                    ? 'text-red-400'
                    : 'text-gray-400 dark:text-white/40'
                }`}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className={`p-3 rounded-lg ${iconColorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
