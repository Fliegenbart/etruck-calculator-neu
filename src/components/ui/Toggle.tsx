import type { LucideIcon } from 'lucide-react';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: LucideIcon;
}

export function Toggle({ label, checked, onChange, icon: Icon }: ToggleProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
        {Icon && (
          <span className="p-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50">
            <Icon className="w-3.5 h-3.5 text-slate-500" />
          </span>
        )}
        {label}
      </span>
      <div className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
      </div>
    </label>
  );
}
