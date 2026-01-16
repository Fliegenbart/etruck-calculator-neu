import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle2, AlertTriangle, Info, Zap, TrendingUp, TrendingDown, Leaf, Euro, Clock, Battery, Plug } from 'lucide-react';
import type { Recommendation } from '../../types';

const iconMap: Record<string, React.ElementType> = {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Battery,
  Plug,
  Zap,
  Leaf,
  Euro,
  Clock,
  CheckCircle2,
  Info,
  Lightbulb,
};

const typeStyles: Record<Recommendation['type'], { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
  tip: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600' },
};

interface RecommendationsProps {
  recommendations: Recommendation[];
  compact?: boolean;
}

export function Recommendations({ recommendations, compact = false }: RecommendationsProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      {!compact && (
        <h4 className="font-semibold text-slate-700 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Smart Empfehlungen
        </h4>
      )}
      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        {recommendations.map((rec, index) => {
          const Icon = iconMap[rec.icon] || Lightbulb;
          const styles = typeStyles[rec.type];

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`${styles.bg} ${styles.border} border rounded-xl ${compact ? 'p-3' : 'p-4'} flex gap-3`}
            >
              <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>
                <Icon className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
              </div>
              <div>
                <div className={`font-medium text-slate-800 ${compact ? 'text-sm' : ''}`}>{rec.title}</div>
                <p className={`text-slate-600 ${compact ? 'text-xs' : 'text-sm'} mt-0.5`}>{rec.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
