import { Truck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface VehicleButtonProps {
  id: string;
  name: string;
  specs: string;
  selected: boolean;
  onClick: () => void;
}

export function VehicleButton({ name, specs, selected, onClick }: VehicleButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden group ${
        selected
          ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg shadow-emerald-500/20'
          : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md'
      }`}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </motion.div>
      )}
      <div className={`inline-flex p-2 rounded-xl mb-2 transition-colors ${selected ? 'bg-emerald-500' : 'bg-slate-100 group-hover:bg-emerald-100'}`}>
        <Truck className={`w-4 h-4 ${selected ? 'text-white' : 'text-slate-500'}`} />
      </div>
      <div className="font-semibold text-slate-800">{name}</div>
      <div className="text-sm text-slate-500">{specs}</div>
    </motion.button>
  );
}
