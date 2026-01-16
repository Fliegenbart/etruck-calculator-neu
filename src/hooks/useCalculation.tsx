import { useState, useMemo, useEffect, createContext, useContext, type ReactNode } from 'react';
import type { CalculatorInputs, CalculationResults, AmortizationDataPoint, Recommendation, UsageProfileType } from '../types';
import { DEFAULT_INPUTS, USAGE_PROFILES } from '../lib/constants';
import { calculateTCO, generateAmortizationData } from '../lib/calculations';
import { generateRecommendations } from '../lib/recommendations';

interface CalculationContextType {
  inputs: CalculatorInputs;
  results: CalculationResults;
  amortizationData: AmortizationDataPoint[];
  recommendations: Recommendation[];
  setInput: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
  setInputs: (newInputs: Partial<CalculatorInputs>) => void;
  applyProfile: (profile: UsageProfileType) => void;
  resetToDefaults: () => void;
}

const CalculationContext = createContext<CalculationContextType | null>(null);

export function CalculationProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputsState] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  // Auto-suggest charging points based on fleet size
  useEffect(() => {
    const suggestedPoints = Math.max(1, Math.ceil(inputs.fleetSize * 0.3));
    if (inputs.chargingPoints !== suggestedPoints && inputs.includeInfrastructure) {
      setInputsState(prev => ({ ...prev, chargingPoints: suggestedPoints }));
    }
  }, [inputs.fleetSize, inputs.includeInfrastructure]);

  // Load params from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newInputs: Partial<CalculatorInputs> = {};

    if (params.get('fleet')) newInputs.fleetSize = Number(params.get('fleet'));
    if (params.get('profile')) newInputs.usageProfile = params.get('profile') as UsageProfileType;
    if (params.get('vehicle')) newInputs.selectedVehicleClass = params.get('vehicle') as 'N1' | 'N2' | 'N3';
    if (params.get('mileage')) newInputs.annualMileage = Number(params.get('mileage'));
    if (params.get('years')) newInputs.usageYears = Number(params.get('years'));
    if (params.get('highway')) newInputs.highwayShare = Number(params.get('highway'));
    if (params.get('depot')) newInputs.depotChargingShare = Number(params.get('depot'));
    if (params.get('diesel')) newInputs.dieselPrice = Number(params.get('diesel'));
    if (params.get('electricity')) newInputs.electricityPrice = Number(params.get('electricity'));

    if (Object.keys(newInputs).length > 0) {
      setInputsState(prev => ({ ...prev, ...newInputs }));
    }
  }, []);

  const results = useMemo(() => calculateTCO(inputs), [inputs]);

  const amortizationData = useMemo(
    () => generateAmortizationData(inputs, results),
    [inputs, results]
  );

  const recommendations = useMemo(
    () => generateRecommendations(inputs, results),
    [inputs, results]
  );

  const setInput = <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => {
    setInputsState(prev => ({ ...prev, [key]: value }));
  };

  const setInputs = (newInputs: Partial<CalculatorInputs>) => {
    setInputsState(prev => ({ ...prev, ...newInputs }));
  };

  const applyProfile = (profile: UsageProfileType) => {
    if (profile !== 'custom') {
      const profileData = USAGE_PROFILES[profile];
      setInputsState(prev => ({
        ...prev,
        usageProfile: profile,
        annualMileage: profileData.annualMileage,
        highwayShare: profileData.highwayShare,
        depotChargingShare: profileData.depotChargingShare,
      }));
    } else {
      setInputsState(prev => ({ ...prev, usageProfile: 'custom' }));
    }
  };

  const resetToDefaults = () => {
    setInputsState(DEFAULT_INPUTS);
  };

  return (
    <CalculationContext.Provider
      value={{
        inputs,
        results,
        amortizationData,
        recommendations,
        setInput,
        setInputs,
        applyProfile,
        resetToDefaults,
      }}
    >
      {children}
    </CalculationContext.Provider>
  );
}

export function useCalculation() {
  const context = useContext(CalculationContext);
  if (!context) {
    throw new Error('useCalculation must be used within a CalculationProvider');
  }
  return context;
}

// Share URL generator
export function generateShareUrl(inputs: CalculatorInputs): string {
  const params = new URLSearchParams({
    fleet: inputs.fleetSize.toString(),
    profile: inputs.usageProfile,
    vehicle: inputs.selectedVehicleClass,
    mileage: inputs.annualMileage.toString(),
    years: inputs.usageYears.toString(),
    highway: inputs.highwayShare.toString(),
    depot: inputs.depotChargingShare.toString(),
    diesel: inputs.dieselPrice.toString(),
    electricity: inputs.electricityPrice.toString(),
  });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}
