import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageWrapper({ children, title, subtitle, actions }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-screen"
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="ml-12 lg:ml-0">
              <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
              {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
        {children}
      </main>
    </motion.div>
  );
}
