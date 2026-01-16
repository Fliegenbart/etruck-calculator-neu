import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, TrendingDown, Leaf, Euro, ChevronRight, Truck, GitCompare, Activity, ArrowRight } from 'lucide-react';
import { PageWrapper } from '../components/layout';
import { ResultCard } from '../components/ui';
import { Recommendations } from '../components/shared';
import { AmortizationChart } from '../components/charts';
import { useCalculation } from '../hooks/useCalculation';
import { formatCurrency, formatPercent } from '../lib/calculations';

const quickActions = [
  { to: '/calculator', icon: Calculator, label: 'Neuer Rechner', description: 'Starten Sie eine neue TCO-Berechnung' },
  { to: '/scenarios', icon: GitCompare, label: 'Szenarien vergleichen', description: 'Vergleichen Sie gespeicherte Szenarien' },
  { to: '/sensitivity', icon: Activity, label: 'Sensitivitäts-Analyse', description: 'What-If Simulationen durchführen' },
];

export function Dashboard() {
  const { inputs, results, amortizationData, recommendations } = useCalculation();

  return (
    <PageWrapper
      title="Dashboard"
      subtitle="Ihre E-Truck TCO-Übersicht"
      actions={
        <Link
          to="/calculator"
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30"
        >
          <Calculator className="w-4 h-4" />
          Neue Berechnung
        </Link>
      }
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ResultCard
          label="Gesamtersparnis"
          value={formatCurrency(results.fleet.savings)}
          subtext={`in ${inputs.usageYears} Jahren`}
          icon={TrendingDown}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          iconBg="bg-white/20"
          delay={0}
        />
        <ResultCard
          label="Break-Even"
          value={results.breakEvenYears < 20 ? `${results.paybackMonths.toFixed(0)} Monate` : 'N/A'}
          subtext={results.breakEvenYears < 20 ? `${results.breakEvenYears.toFixed(1)} Jahre` : ''}
          icon={Calculator}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          iconBg="bg-white/20"
          delay={0.05}
        />
        <ResultCard
          label="ROI"
          value={formatPercent(results.roi)}
          subtext="Return on Investment"
          icon={Euro}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          iconBg="bg-white/20"
          delay={0.1}
        />
        <ResultCard
          label="CO2-Einsparung"
          value={`${results.co2Savings.toFixed(0)} t`}
          subtext={`${((results.co2Savings / results.dieselCO2) * 100).toFixed(0)}% weniger`}
          icon={Leaf}
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          iconBg="bg-white/20"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Calculation Summary */}
          {inputs.fleetSize > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-3xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="text-white">
                  <div className="text-indigo-200 text-sm font-medium flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Aktuelle Flottenberechnung: {inputs.fleetSize} Fahrzeuge
                  </div>
                  <div className="text-3xl font-bold mt-1">
                    Investition: {formatCurrency(results.fleet.investment)}
                  </div>
                </div>
                <Link
                  to="/calculator"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition-all"
                >
                  Anpassen
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Amortization Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                </span>
                Kostenentwicklung
              </h3>
              <Link
                to="/calculator"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                Details
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <AmortizationChart data={amortizationData} />
            {results.breakEvenYears > 0 && results.breakEvenYears < inputs.usageYears && (
              <div className="mt-4 flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
                <span className="text-emerald-800 font-medium">
                  Break-Even nach <strong>{results.paybackMonths.toFixed(0)} Monaten</strong> - danach sparen Sie{' '}
                  <strong>{formatCurrency(results.annualSavings * inputs.fleetSize)}</strong> jährlich
                </span>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {quickActions.map((action, index) => (
              <Link
                key={action.to}
                to={action.to}
                className="group bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-5 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="p-2.5 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl w-fit mb-3 group-hover:from-emerald-100 group-hover:to-emerald-50 transition-colors">
                  <action.icon className="w-5 h-5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-1">{action.label}</h4>
                <p className="text-sm text-slate-500">{action.description}</p>
                <div className="mt-3 flex items-center text-emerald-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Öffnen
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6"
          >
            <Recommendations recommendations={recommendations} />
          </motion.div>

          {/* TCO Comparison Mini */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6"
          >
            <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Euro className="w-5 h-5 text-slate-500" />
              TCO Vergleich
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Diesel</span>
                <span className="font-bold text-amber-600">{formatCurrency(results.fleet.dieselTCO)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">E-LKW</span>
                <span className="font-bold text-blue-600">{formatCurrency(results.fleet.electricTCO)}</span>
              </div>
              <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                <span className="font-medium text-slate-700">Ersparnis</span>
                <span className="font-bold text-emerald-600 text-lg">{formatCurrency(results.fleet.savings)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
