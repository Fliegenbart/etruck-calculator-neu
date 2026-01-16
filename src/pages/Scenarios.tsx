import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, Plus, Trash2, Copy, Check, X, Calculator, Truck, Calendar, Euro, TrendingDown, ChevronRight } from 'lucide-react';
import { PageWrapper } from '../components/layout';
import { useScenarios } from '../hooks/useScenarios';
import { useCalculation } from '../hooks/useCalculation';
import { formatCurrency } from '../lib/calculations';
import { VEHICLE_DATA, USAGE_PROFILES } from '../lib/constants';
import type { Scenario } from '../types';

function ScenarioCard({
  scenario,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: {
  scenario: Scenario;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-2xl shadow-lg border-2 transition-all ${
        isSelected ? 'border-emerald-500 shadow-emerald-500/20' : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800">{scenario.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(scenario.createdAt).toLocaleDateString('de-DE')}
            </p>
          </div>
          <button
            onClick={onSelect}
            className={`p-2 rounded-lg transition-colors ${
              isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* Scenario Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Truck className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">
              {scenario.inputs.fleetSize}x {VEHICLE_DATA[scenario.inputs.selectedVehicleClass].name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">
              {scenario.inputs.usageYears} Jahre, {scenario.inputs.annualMileage.toLocaleString('de-DE')} km/Jahr
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Euro className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">
              {scenario.inputs.electricityPrice.toFixed(2)} €/kWh, {scenario.inputs.dieselPrice.toFixed(2)} €/L
            </span>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-slate-50 rounded-xl p-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-400">TCO E-LKW</div>
              <div className="font-bold text-blue-600">{formatCurrency(scenario.results.fleet.electricTCO)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Ersparnis</div>
              <div className="font-bold text-emerald-600">{formatCurrency(scenario.results.fleet.savings)}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onDuplicate}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-600 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Kopieren
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ComparisonView({ scenarios }: { scenarios: Scenario[] }) {
  if (scenarios.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
    >
      <div className="p-6 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-violet-500" />
          Vergleich ({scenarios.length} Szenarien)
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Metrik</th>
              {scenarios.map((s) => (
                <th key={s.id} className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-6 py-4 text-sm text-slate-600">Flottengröße</td>
              {scenarios.map((s) => (
                <td key={s.id} className="px-6 py-4 text-sm font-medium text-slate-800">
                  {s.inputs.fleetSize} Fahrzeuge
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-slate-600">Investition</td>
              {scenarios.map((s) => (
                <td key={s.id} className="px-6 py-4 text-sm font-medium text-slate-800">
                  {formatCurrency(s.results.fleet.investment)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-slate-600">TCO Diesel</td>
              {scenarios.map((s) => (
                <td key={s.id} className="px-6 py-4 text-sm font-medium text-amber-600">
                  {formatCurrency(s.results.fleet.dieselTCO)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-slate-600">TCO E-LKW</td>
              {scenarios.map((s) => (
                <td key={s.id} className="px-6 py-4 text-sm font-medium text-blue-600">
                  {formatCurrency(s.results.fleet.electricTCO)}
                </td>
              ))}
            </tr>
            <tr className="bg-emerald-50">
              <td className="px-6 py-4 text-sm font-semibold text-emerald-700">Ersparnis</td>
              {scenarios.map((s) => (
                <td key={s.id} className="px-6 py-4 text-sm font-bold text-emerald-600">
                  {formatCurrency(s.results.fleet.savings)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-slate-600">Break-Even</td>
              {scenarios.map((s) => (
                <td key={s.id} className="px-6 py-4 text-sm font-medium text-slate-800">
                  {s.results.paybackMonths.toFixed(0)} Monate
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-slate-600">ROI</td>
              {scenarios.map((s) => (
                <td key={s.id} className="px-6 py-4 text-sm font-medium text-violet-600">
                  {s.results.roi.toFixed(1)}%
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 text-sm text-slate-600">CO2-Einsparung</td>
              {scenarios.map((s) => (
                <td key={s.id} className="px-6 py-4 text-sm font-medium text-green-600">
                  {s.results.co2Savings.toFixed(0)} t
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export function Scenarios() {
  const { inputs } = useCalculation();
  const {
    scenarios,
    selectedScenarios,
    saveScenario,
    deleteScenario,
    duplicateScenario,
    toggleScenarioSelection,
    getSelectedScenarios,
  } = useScenarios();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');

  const handleSaveScenario = () => {
    if (newScenarioName.trim()) {
      saveScenario(newScenarioName.trim(), inputs);
      setNewScenarioName('');
      setShowSaveModal(false);
    }
  };

  const selectedScenariosList = getSelectedScenarios();

  return (
    <PageWrapper
      title="Szenarien"
      subtitle="Speichern und vergleichen Sie verschiedene Berechnungen"
      actions={
        <button
          onClick={() => setShowSaveModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30"
        >
          <Plus className="w-4 h-4" />
          Aktuelles Szenario speichern
        </button>
      }
    >
      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Szenario speichern</h3>
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="Name des Szenarios"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-medium transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleSaveScenario}
                    disabled={!newScenarioName.trim()}
                    className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-medium transition-colors disabled:opacity-50"
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {scenarios.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-slate-100 p-12 text-center"
        >
          <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-4">
            <GitCompare className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Keine Szenarien gespeichert</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Erstellen Sie zunächst eine Berechnung im TCO-Rechner und speichern Sie diese als Szenario.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/calculator"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 transition-all"
            >
              <Calculator className="w-5 h-5" />
              Zum Rechner
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Selection Info */}
          {selectedScenarios.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500 rounded-lg">
                  <GitCompare className="w-4 h-4 text-white" />
                </div>
                <span className="text-violet-800 font-medium">
                  {selectedScenarios.length} von max. 4 Szenarien ausgewählt
                </span>
              </div>
            </motion.div>
          )}

          {/* Scenarios Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {scenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  isSelected={selectedScenarios.includes(scenario.id)}
                  onSelect={() => toggleScenarioSelection(scenario.id)}
                  onDelete={() => deleteScenario(scenario.id)}
                  onDuplicate={() => duplicateScenario(scenario.id)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Comparison */}
          {selectedScenariosList.length >= 2 && <ComparisonView scenarios={selectedScenariosList} />}
        </div>
      )}
    </PageWrapper>
  );
}
