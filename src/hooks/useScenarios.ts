import { useState, useEffect } from 'react';
import type { Scenario, CalculatorInputs, CalculationResults } from '../types';
import { calculateTCO } from '../lib/calculations';

const STORAGE_KEY = 'etruck-scenarios';

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  // Load scenarios from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScenarios(parsed);
      } catch (e) {
        console.error('Failed to parse saved scenarios', e);
      }
    }
  }, []);

  // Save scenarios to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  }, [scenarios]);

  const saveScenario = (name: string, inputs: CalculatorInputs) => {
    const results = calculateTCO(inputs);
    const newScenario: Scenario = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      inputs,
      results,
    };
    setScenarios(prev => [...prev, newScenario]);
    return newScenario;
  };

  const updateScenario = (id: string, updates: Partial<Pick<Scenario, 'name' | 'inputs'>>) => {
    setScenarios(prev =>
      prev.map(scenario => {
        if (scenario.id === id) {
          const newInputs = updates.inputs ?? scenario.inputs;
          return {
            ...scenario,
            name: updates.name ?? scenario.name,
            inputs: newInputs,
            results: updates.inputs ? calculateTCO(newInputs) : scenario.results,
          };
        }
        return scenario;
      })
    );
  };

  const deleteScenario = (id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
    setSelectedScenarios(prev => prev.filter(sId => sId !== id));
  };

  const duplicateScenario = (id: string, newName?: string) => {
    const original = scenarios.find(s => s.id === id);
    if (original) {
      return saveScenario(newName ?? `${original.name} (Kopie)`, { ...original.inputs });
    }
    return null;
  };

  const toggleScenarioSelection = (id: string) => {
    setSelectedScenarios(prev => {
      if (prev.includes(id)) {
        return prev.filter(sId => sId !== id);
      }
      if (prev.length < 4) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const clearSelection = () => {
    setSelectedScenarios([]);
  };

  const getSelectedScenarios = (): Scenario[] => {
    return scenarios.filter(s => selectedScenarios.includes(s.id));
  };

  const recalculateScenario = (id: string) => {
    setScenarios(prev =>
      prev.map(scenario => {
        if (scenario.id === id) {
          return {
            ...scenario,
            results: calculateTCO(scenario.inputs),
          };
        }
        return scenario;
      })
    );
  };

  return {
    scenarios,
    selectedScenarios,
    saveScenario,
    updateScenario,
    deleteScenario,
    duplicateScenario,
    toggleScenarioSelection,
    clearSelection,
    getSelectedScenarios,
    recalculateScenario,
  };
}
