import { TrendingDown, Info } from 'lucide-react';
import { formatCurrency } from '../../lib/calculations';

interface CostBarProps {
  label: string;
  dieselValue: number;
  electricValue: number;
  maxValue: number;
  source?: string;
}

export function CostBar({ label, dieselValue, electricValue, maxValue, source }: CostBarProps) {
  const dieselWidth = Math.max((dieselValue / maxValue) * 100, 8);
  const electricWidth = Math.max((electricValue / maxValue) * 100, 8);
  const savings = dieselValue - electricValue;
  const savingsPercent = dieselValue > 0 ? ((savings / dieselValue) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700 flex items-center gap-2">
          {label}
          {source && (
            <span className="relative group/tooltip">
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {source}
              </span>
            </span>
          )}
        </span>
        {savings > 0 && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />-{savingsPercent}%
          </span>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-20">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-slate-500">Diesel</span>
          </div>
          <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 rounded-lg flex items-center justify-end px-3 transition-all duration-700"
              style={{ width: `${dieselWidth}%` }}
            >
              <span className="text-xs font-bold text-white drop-shadow-sm">{formatCurrency(dieselValue)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-20">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-slate-500">E-LKW</span>
          </div>
          <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 rounded-lg flex items-center justify-end px-3 transition-all duration-700"
              style={{ width: `${electricWidth}%` }}
            >
              <span className="text-xs font-bold text-white drop-shadow-sm">{formatCurrency(electricValue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
