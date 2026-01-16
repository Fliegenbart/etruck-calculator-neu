// Vehicle & Profile Types
export type VehicleClass = 'N1' | 'N2' | 'N3';
export type UsageProfileType = 'kep' | 'nahverkehr' | 'fernverkehr' | 'custom';

export interface VehicleData {
  dieselConsumption: number;
  electricConsumption: number;
  dieselPurchase: number;
  electricPurchase: number;
  thgQuote: number;
  maintenance: { diesel: number; electric: number };
  insurance: { diesel: number; electric: number };
  name: string;
  specs: string;
}

export interface UsageProfile {
  name: string;
  annualMileage: number;
  highwayShare: number;
  depotChargingShare: number;
  description: string;
}

// Calculator Input State
export interface CalculatorInputs {
  fleetSize: number;
  usageProfile: UsageProfileType;
  selectedVehicleClass: VehicleClass;
  annualMileage: number;
  usageYears: number;
  highwayShare: number;
  depotChargingShare: number;
  dieselPrice: number;
  electricityPrice: number;
  includeInfrastructure: boolean;
  chargingPoints: number;
  dcCharging: boolean;
  gridUpgrade: boolean;
}

// Calculation Results
export interface DieselCosts {
  purchase: number;
  annualTotal: number;
  energy: number;
  toll: number;
  maintenance: number;
  insurance: number;
  tco: number;
  costPerKm: number;
}

export interface ElectricCosts {
  purchase: number;
  netPurchase: number;
  annualTotal: number;
  energy: number;
  toll: number;
  maintenance: number;
  insurance: number;
  thgQuote: number;
  tco: number;
  costPerKm: number;
}

export interface FleetResults {
  dieselTCO: number;
  electricTCO: number;
  investment: number;
  savings: number;
}

export interface InfrastructureResults {
  cost: number;
  perVehicle: number;
}

export interface CalculationResults {
  diesel: DieselCosts;
  electric: ElectricCosts;
  fleet: FleetResults;
  infrastructure: InfrastructureResults;
  savings: number;
  annualSavings: number;
  breakEvenYears: number;
  paybackMonths: number;
  roi: number;
  co2Savings: number;
  dieselCO2: number;
}

// Scenario Management
export interface Scenario {
  id: string;
  name: string;
  createdAt: string;
  inputs: CalculatorInputs;
  results: CalculationResults;
}

// Sensitivity Analysis
export interface SensitivityParameter {
  key: keyof CalculatorInputs;
  label: string;
  baseValue: number;
  minValue: number;
  maxValue: number;
  step: number;
  unit: string;
}

export interface SensitivityResult {
  parameter: string;
  label: string;
  lowValue: number;
  highValue: number;
  lowTCO: number;
  highTCO: number;
  impactPercent: number;
}

// Chart Data
export interface AmortizationDataPoint {
  year: number;
  label: string;
  Diesel: number;
  'E-LKW': number;
}

// Recommendations
export interface Recommendation {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  icon: string;
}

// Lead Form
export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  fleetSize: string;
  timeline: string;
}
