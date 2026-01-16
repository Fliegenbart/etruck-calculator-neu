import { Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon?: LucideIcon;
  info?: string;
}

export function SliderField({ label, value, onChange, icon: Icon, info }: SliderFieldProps) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
          {Icon && (
            <span className="p-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50">
              <Icon className="w-3.5 h-3.5 text-slate-500" />
            </span>
          )}
          {label}
          {info && (
            <span className="relative group/tooltip">
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {info}
              </span>
            </span>
          )}
        </label>
        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
          style={{ width: `${value * 100}%` }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={value * 100}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
