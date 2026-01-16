import type { VehicleData, UsageProfile, VehicleClass, UsageProfileType } from '../types';

export const USAGE_PROFILES: Record<UsageProfileType, UsageProfile> = {
  kep: {
    name: 'KEP / Kurier',
    annualMileage: 20000,
    highwayShare: 0.05,
    depotChargingShare: 1.0,
    description: '~80 km/Tag, Stadt'
  },
  nahverkehr: {
    name: 'Nahverkehr',
    annualMileage: 50000,
    highwayShare: 0.4,
    depotChargingShare: 0.8,
    description: '~200 km/Tag, Regional'
  },
  fernverkehr: {
    name: 'Fernverkehr',
    annualMileage: 150000,
    highwayShare: 0.9,
    depotChargingShare: 0.4,
    description: '~600 km/Tag, Langstrecke'
  },
  custom: {
    name: 'Individuell',
    annualMileage: 120000,
    highwayShare: 0.8,
    depotChargingShare: 0.7,
    description: 'Eigene Werte'
  },
};

export const VEHICLE_DATA: Record<VehicleClass, VehicleData> = {
  N1: {
    dieselConsumption: 12,
    electricConsumption: 28,
    dieselPurchase: 45000,
    electricPurchase: 75000,
    thgQuote: 225,
    maintenance: { diesel: 0.08, electric: 0.05 },
    insurance: { diesel: 2500, electric: 2375 },
    name: 'N1 - Transporter',
    specs: 'bis 3,5 Tonnen'
  },
  N2: {
    dieselConsumption: 22,
    electricConsumption: 100,
    dieselPurchase: 95000,
    electricPurchase: 180000,
    thgQuote: 1545,
    maintenance: { diesel: 0.12, electric: 0.08 },
    insurance: { diesel: 5000, electric: 4750 },
    name: 'N2 - Verteiler-LKW',
    specs: '3,5 - 12 Tonnen'
  },
  N3: {
    dieselConsumption: 32,
    electricConsumption: 120,
    dieselPurchase: 120000,
    electricPurchase: 350000,
    thgQuote: 2505,
    maintenance: { diesel: 0.15, electric: 0.10 },
    insurance: { diesel: 8000, electric: 7500 },
    name: 'N3 - Sattelzug',
    specs: 'über 12 Tonnen'
  },
};

export const INFRASTRUCTURE_COSTS = {
  acCharger: 8000,
  dcCharger: 50000,
  gridUpgrade: 30000,
};

// Regulatory dates
export const REGULATORY_DATES = {
  currentYear: 2026,
  taxExemptionEnds: 2030,
  tollExemptionEnds: 2031,
};

// Maut rate per km for diesel trucks
export const TOLL_RATE_DIESEL = 0.348;
export const TOLL_RATE_ELECTRIC = 0.19; // Reduced rate after exemption ends

// CO2 emission factors
export const CO2_FACTOR_DIESEL = 2.64; // kg CO2 per liter diesel
export const CO2_FACTOR_ELECTRICITY = 0.38; // kg CO2 per kWh (German grid mix)

// Public charging price
export const PUBLIC_CHARGING_PRICE = 0.55; // €/kWh

// Default calculator inputs
export const DEFAULT_INPUTS = {
  fleetSize: 1,
  usageProfile: 'custom' as UsageProfileType,
  selectedVehicleClass: 'N3' as VehicleClass,
  annualMileage: 120000,
  usageYears: 8,
  highwayShare: 0.8,
  depotChargingShare: 0.7,
  dieselPrice: 1.45,
  electricityPrice: 0.25,
  includeInfrastructure: false,
  chargingPoints: 1,
  dcCharging: false,
  gridUpgrade: false,
};

// Sensitivity analysis parameters
export const SENSITIVITY_PARAMETERS = [
  { key: 'electricityPrice', label: 'Strompreis', min: 0.15, max: 0.45, step: 0.01, unit: '€/kWh' },
  { key: 'dieselPrice', label: 'Dieselpreis', min: 1.20, max: 2.00, step: 0.05, unit: '€/L' },
  { key: 'annualMileage', label: 'Jahresfahrleistung', min: 50000, max: 200000, step: 10000, unit: 'km' },
  { key: 'usageYears', label: 'Nutzungsdauer', min: 4, max: 12, step: 1, unit: 'Jahre' },
  { key: 'depotChargingShare', label: 'Depot-Laden Anteil', min: 0.3, max: 1.0, step: 0.1, unit: '%' },
];
