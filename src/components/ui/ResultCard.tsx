import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResultCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  delay?: number;
}

export function ResultCard({ label, value, subtext, icon: Icon, gradient, iconBg, delay = 0 }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl p-5 ${gradient} border border-white/20 backdrop-blur-sm shadow-lg`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className={`inline-flex p-2.5 rounded-xl ${iconBg} mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-white/80 text-sm font-medium mb-1">{label}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtext && <div className="text-white/60 text-xs">{subtext}</div>}
    </motion.div>
  );
}
