import { Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface RegulatoryTimelineProps {
  usageYears: number;
}

export function RegulatoryTimeline({ usageYears }: RegulatoryTimelineProps) {
  const currentYear = 2026;
  const endYear = currentYear + usageYears;
  const events = [
    { year: 2026, label: 'Heute', active: true },
    { year: 2030, label: 'KFZ-Steuer-Befreiung endet', warning: endYear >= 2030 },
    { year: 2031, label: 'Mautbefreiung endet', warning: endYear >= 2031 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200"
    >
      <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4" />
        Regulatory Timeline
      </h4>
      <div className="relative">
        <div className="absolute top-3 left-0 right-0 h-1 bg-slate-200 rounded-full" />
        <div className="relative flex justify-between">
          {events.map((event, i) => (
            <div key={i} className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                  event.active
                    ? 'bg-emerald-500 border-emerald-500'
                    : event.warning
                    ? 'bg-amber-100 border-amber-500'
                    : 'bg-white border-slate-300'
                }`}
              >
                {event.warning && <AlertTriangle className="w-3 h-3 text-amber-600" />}
              </motion.div>
              <span className={`text-xs mt-2 font-medium ${event.warning ? 'text-amber-600' : 'text-slate-500'}`}>
                {event.year}
              </span>
              <span className={`text-xs text-center max-w-20 ${event.warning ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                {event.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      {endYear >= 2030 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Ihre Nutzungsdauer von {usageYears} Jahren überschreitet wichtige Förder-Deadlines.
            Die TCO-Berechnung berücksichtigt dies automatisch.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
