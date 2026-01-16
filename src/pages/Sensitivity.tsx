import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Fuel, Route, Calendar, Battery, Info, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { PageWrapper } from '../components/layout';
import { TornadoChart } from '../components/charts';
import { useCalculation } from '../hooks/useCalculation';
import { calculateTCO, calculateSensitivity, formatCurrency, formatPercent } from '../lib/calculations';
import { SENSITIVITY_PARAMETERS } from '../lib/constants';

const parameterIcons: Record<string, React.ElementType> = {
  electricityPrice: Zap,
  dieselPrice: Fuel,
  annualMileage: Route,
  usageYears: Calendar,
  depotChargingShare: Battery,
};

export function Sensitivity() {
  const { inputs, results } = useCalculation();
  const [activeParameter, setActiveParameter] = useState<string | null>(null);
  const [whatIfValues, setWhatIfValues] = useState<Record<string, number>>({});

  // Calculate sensitivity results
  const sensitivityResults = useMemo(() => calculateSensitivity(inputs), [inputs]);

  // Calculate what-if scenario
  const whatIfResults = useMemo(() => {
    if (Object.keys(whatIfValues).length === 0) return null;
    const modifiedInputs = { ...inputs, ...whatIfValues };
    return calculateTCO(modifiedInputs);
  }, [inputs, whatIfValues]);

  const handleWhatIfChange = (key: string, value: number) => {
    setWhatIfValues((prev) => ({ ...prev, [key]: value }));
  };

  const resetWhatIf = () => {
    setWhatIfValues({});
  };

  // Find the most impactful parameter
  const topDriver = sensitivityResults[0];

  return (
    <PageWrapper
      title="Sensitivitäts-Analyse"
      subtitle="Verstehen Sie, welche Faktoren Ihre TCO am meisten beeinflussen"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Insight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-3xl p-6 text-white"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Wichtigster Kostentreiber</h3>
                <p className="text-violet-100">
                  <strong className="text-white">{topDriver.label}</strong> hat den größten Einfluss auf Ihre TCO.
                  Eine Änderung von ±20% wirkt sich mit bis zu <strong className="text-white">±{topDriver.impactPercent.toFixed(1)}%</strong> aus.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tornado Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50">
                  <Activity className="w-5 h-5 text-violet-600" />
                </span>
                Tornado-Diagramm
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Info className="w-4 h-4" />
                Basis-TCO: {formatCurrency(results.fleet.electricTCO)}
              </div>
            </div>
            <TornadoChart data={sensitivityResults} baseTCO={results.fleet.electricTCO} />
          </motion.div>

          {/* What-If Comparison */}
          {whatIfResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800">What-If Vergleich</h3>
                <button
                  onClick={resetWhatIf}
                  className="text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  Zurücksetzen
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Current */}
                <div className="bg-slate-50 rounded-2xl p-5">
                  <div className="text-sm text-slate-500 mb-2">Aktuell</div>
                  <div className="text-2xl font-bold text-slate-800 mb-4">
                    {formatCurrency(results.fleet.electricTCO)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Ersparnis</span>
                      <span className="font-medium text-emerald-600">{formatCurrency(results.fleet.savings)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">ROI</span>
                      <span className="font-medium text-slate-800">{formatPercent(results.roi)}</span>
                    </div>
                  </div>
                </div>

                {/* What-If */}
                <div className="bg-violet-50 rounded-2xl p-5 border-2 border-violet-200">
                  <div className="text-sm text-violet-600 mb-2">What-If Szenario</div>
                  <div className="text-2xl font-bold text-violet-800 mb-4">
                    {formatCurrency(whatIfResults.fleet.electricTCO)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-violet-600">Ersparnis</span>
                      <span className="font-medium text-emerald-600">{formatCurrency(whatIfResults.fleet.savings)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-violet-600">ROI</span>
                      <span className="font-medium text-violet-800">{formatPercent(whatIfResults.roi)}</span>
                    </div>
                  </div>

                  {/* Delta */}
                  <div className="mt-4 pt-4 border-t border-violet-200">
                    <div className="flex items-center gap-2">
                      {whatIfResults.fleet.electricTCO < results.fleet.electricTCO ? (
                        <>
                          <TrendingDown className="w-5 h-5 text-emerald-500" />
                          <span className="font-bold text-emerald-600">
                            {formatCurrency(results.fleet.electricTCO - whatIfResults.fleet.electricTCO)} günstiger
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-5 h-5 text-red-500" />
                          <span className="font-bold text-red-600">
                            {formatCurrency(whatIfResults.fleet.electricTCO - results.fleet.electricTCO)} teurer
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar - What-If Sliders */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6"
          >
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50">
                <Activity className="w-5 h-5 text-amber-600" />
              </span>
              What-If Simulation
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Passen Sie die Parameter an, um zu sehen wie sich Ihre TCO verändert.
            </p>

            <div className="space-y-6">
              {SENSITIVITY_PARAMETERS.map((param) => {
                const Icon = parameterIcons[param.key] || Activity;
                const currentValue = whatIfValues[param.key] ?? (inputs as any)[param.key];
                const baseValue = (inputs as any)[param.key];
                const isModified = whatIfValues[param.key] !== undefined;

                return (
                  <div
                    key={param.key}
                    className={`p-4 rounded-xl border-2 transition-colors ${
                      isModified ? 'border-violet-200 bg-violet-50' : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Icon className={`w-4 h-4 ${isModified ? 'text-violet-500' : 'text-slate-400'}`} />
                        {param.label}
                      </label>
                      <span className={`text-sm font-bold ${isModified ? 'text-violet-600' : 'text-slate-600'}`}>
                        {param.key === 'depotChargingShare'
                          ? `${(currentValue * 100).toFixed(0)}%`
                          : param.key === 'annualMileage'
                          ? currentValue.toLocaleString('de-DE')
                          : currentValue.toFixed(2)}{' '}
                        {param.key !== 'depotChargingShare' && param.unit}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      value={currentValue}
                      onChange={(e) => handleWhatIfChange(param.key, Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-violet-500"
                    />

                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                      <span>
                        {param.key === 'depotChargingShare'
                          ? `${(param.min * 100).toFixed(0)}%`
                          : param.key === 'annualMileage'
                          ? param.min.toLocaleString('de-DE')
                          : param.min}
                      </span>
                      <span className="text-slate-500">
                        Basis: {param.key === 'depotChargingShare'
                          ? `${(baseValue * 100).toFixed(0)}%`
                          : param.key === 'annualMileage'
                          ? baseValue.toLocaleString('de-DE')
                          : baseValue.toFixed(2)}
                      </span>
                      <span>
                        {param.key === 'depotChargingShare'
                          ? `${(param.max * 100).toFixed(0)}%`
                          : param.key === 'annualMileage'
                          ? param.max.toLocaleString('de-DE')
                          : param.max}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {Object.keys(whatIfValues).length > 0 && (
              <button
                onClick={resetWhatIf}
                className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-medium transition-colors"
              >
                Alle zurücksetzen
              </button>
            )}
          </motion.div>

          {/* Interpretation Help */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-6 border border-slate-200"
          >
            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              So lesen Sie das Diagramm
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500 mt-1 flex-shrink-0" />
                <span>Grün = TCO sinkt (positiv für Sie)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-3 h-3 rounded bg-red-500 mt-1 flex-shrink-0" />
                <span>Rot = TCO steigt (negativ für Sie)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400">•</span>
                <span>Längere Balken = größerer Einfluss</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
