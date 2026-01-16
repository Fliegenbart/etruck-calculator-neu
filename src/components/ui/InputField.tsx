import { Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  icon?: LucideIcon;
  min?: number;
  max?: number;
  step?: number;
  info?: string;
}

export function InputField({ label, value, onChange, unit, icon: Icon, min, max, step = 1, info }: InputFieldProps) {
  return (
    <div className="group">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
        {Icon && (
          <span className="p-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 group-focus-within:from-emerald-100 group-focus-within:to-emerald-50 transition-colors">
            <Icon className="w-3.5 h-3.5 text-slate-500 group-focus-within:text-emerald-600 transition-colors" />
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
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-slate-800 font-medium pr-16 hover:border-slate-300"
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium bg-slate-100 px-2 py-1 rounded-md">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
