import type { CalculatorInputs, CalculationResults, AmortizationDataPoint, SensitivityResult } from '../types';
import {
  VEHICLE_DATA,
  INFRASTRUCTURE_COSTS,
  REGULATORY_DATES,
  TOLL_RATE_DIESEL,
  TOLL_RATE_ELECTRIC,
  CO2_FACTOR_DIESEL,
  CO2_FACTOR_ELECTRICITY,
  PUBLIC_CHARGING_PRICE,
  SENSITIVITY_PARAMETERS,
} from './constants';

export function calculateTCO(inputs: CalculatorInputs): CalculationResults {
  const vd = VEHICLE_DATA[inputs.selectedVehicleClass];

  // Diesel costs
  const dieselEnergyAnnual = (inputs.annualMileage / 100) * vd.dieselConsumption * inputs.dieselPrice;
  const dieselTollAnnual = inputs.annualMileage * inputs.highwayShare * TOLL_RATE_DIESEL;
  const dieselMaintenanceAnnual = inputs.annualMileage * vd.maintenance.diesel;
  const dieselTaxAnnual = inputs.selectedVehicleClass === 'N3' ? 1681 : inputs.selectedVehicleClass === 'N2' ? 914 : 556;
  const dieselAnnualTotal = dieselEnergyAnnual + dieselTollAnnual + dieselMaintenanceAnnual + vd.insurance.diesel + dieselTaxAnnual;

  // E-LKW costs
  const avgElectricityPrice = inputs.electricityPrice * inputs.depotChargingShare + PUBLIC_CHARGING_PRICE * (1 - inputs.depotChargingShare);
  const electricEnergyAnnual = (inputs.annualMileage / 100) * vd.electricConsumption * avgElectricityPrice;
  const electricMaintenanceAnnual = inputs.annualMileage * vd.maintenance.electric;

  // Tax and toll exemptions
  const yearsWithTaxExemption = Math.min(inputs.usageYears, Math.max(0, REGULATORY_DATES.taxExemptionEnds - REGULATORY_DATES.currentYear));
  const yearsWithTollExemption = Math.min(inputs.usageYears, Math.max(0, REGULATORY_DATES.tollExemptionEnds - REGULATORY_DATES.currentYear));
  const electricTaxTotal = dieselTaxAnnual * 0.25 * (inputs.usageYears - yearsWithTaxExemption);
  const electricTollTotal = inputs.annualMileage * inputs.highwayShare * TOLL_RATE_ELECTRIC * (inputs.usageYears - yearsWithTollExemption);

  const electricAnnualTotal = electricEnergyAnnual + electricMaintenanceAnnual + vd.insurance.electric - vd.thgQuote;

  // Purchase with subsidy (Sonder-AfA effect)
  const subsidyEffect = vd.electricPurchase * 0.25;
  const electricNetPurchase = vd.electricPurchase - subsidyEffect;

  // Infrastructure
  const infrastructureCost = inputs.includeInfrastructure
    ? inputs.chargingPoints * (inputs.dcCharging ? INFRASTRUCTURE_COSTS.dcCharger : INFRASTRUCTURE_COSTS.acCharger) + (inputs.gridUpgrade ? INFRASTRUCTURE_COSTS.gridUpgrade : 0)
    : 0;

  // Residual values
  const dieselResidual = vd.dieselPurchase * 0.15;
  const electricResidual = vd.electricPurchase * 0.20;

  // TCO per vehicle
  const dieselTCO = vd.dieselPurchase + (dieselAnnualTotal * inputs.usageYears) - dieselResidual;
  const electricTCO = electricNetPurchase + (electricAnnualTotal * inputs.usageYears) + electricTaxTotal / inputs.fleetSize + electricTollTotal / inputs.fleetSize - electricResidual + infrastructureCost / inputs.fleetSize;

  // Fleet totals
  const fleetDieselTCO = dieselTCO * inputs.fleetSize;
  const fleetElectricTCO = electricTCO * inputs.fleetSize;
  const fleetInvestment = electricNetPurchase * inputs.fleetSize + infrastructureCost;

  // Break-Even
  const annualSavings = dieselAnnualTotal - electricAnnualTotal;
  const purchaseDiff = electricNetPurchase - vd.dieselPurchase + infrastructureCost / inputs.fleetSize;
  const breakEvenYears = annualSavings > 0 ? purchaseDiff / annualSavings : Infinity;

  // CO2
  const dieselCO2 = (inputs.annualMileage / 100) * vd.dieselConsumption * CO2_FACTOR_DIESEL * inputs.usageYears / 1000;
  const electricCO2 = (inputs.annualMileage / 100) * vd.electricConsumption * CO2_FACTOR_ELECTRICITY * inputs.usageYears / 1000;

  // KPIs
  const costPerKmDiesel = dieselAnnualTotal / inputs.annualMileage;
  const costPerKmElectric = electricAnnualTotal / inputs.annualMileage;
  const roi = ((fleetDieselTCO - fleetElectricTCO) / fleetInvestment) * 100;
  const paybackMonths = breakEvenYears * 12;

  return {
    diesel: {
      purchase: vd.dieselPurchase,
      annualTotal: dieselAnnualTotal,
      energy: dieselEnergyAnnual,
      toll: dieselTollAnnual,
      maintenance: dieselMaintenanceAnnual,
      insurance: vd.insurance.diesel,
      tco: dieselTCO,
      costPerKm: costPerKmDiesel,
    },
    electric: {
      purchase: vd.electricPurchase,
      netPurchase: electricNetPurchase,
      annualTotal: electricAnnualTotal,
      energy: electricEnergyAnnual,
      toll: 0,
      maintenance: electricMaintenanceAnnual,
      insurance: vd.insurance.electric,
      thgQuote: -vd.thgQuote,
      tco: electricTCO,
      costPerKm: costPerKmElectric,
    },
    fleet: {
      dieselTCO: fleetDieselTCO,
      electricTCO: fleetElectricTCO,
      investment: fleetInvestment,
      savings: fleetDieselTCO - fleetElectricTCO,
    },
    infrastructure: {
      cost: infrastructureCost,
      perVehicle: infrastructureCost / inputs.fleetSize,
    },
    savings: dieselTCO - electricTCO,
    annualSavings,
    breakEvenYears: Math.max(0, breakEvenYears),
    paybackMonths,
    roi,
    co2Savings: (dieselCO2 - electricCO2) * inputs.fleetSize,
    dieselCO2: dieselCO2 * inputs.fleetSize,
  };
}

export function generateAmortizationData(inputs: CalculatorInputs, results: CalculationResults): AmortizationDataPoint[] {
  const data: AmortizationDataPoint[] = [];
  for (let i = 0; i <= inputs.usageYears; i++) {
    data.push({
      year: i,
      label: i === 0 ? 'Start' : `Jahr ${i}`,
      Diesel: (results.diesel.purchase + (results.diesel.annualTotal * i)) * inputs.fleetSize,
      'E-LKW': (results.electric.netPurchase + (results.electric.annualTotal * i)) * inputs.fleetSize + results.infrastructure.cost,
    });
  }
  return data;
}

export function calculateSensitivity(baseInputs: CalculatorInputs): SensitivityResult[] {
  const baseResults = calculateTCO(baseInputs);
  const baseTCO = baseResults.fleet.electricTCO;

  const results: SensitivityResult[] = [];

  for (const param of SENSITIVITY_PARAMETERS) {
    const key = param.key as keyof CalculatorInputs;
    const baseValue = baseInputs[key] as number;

    // Calculate low scenario (-20%)
    const lowValue = param.key === 'depotChargingShare'
      ? Math.max(param.min, baseValue - 0.2)
      : baseValue * 0.8;
    const lowInputs = { ...baseInputs, [key]: Math.max(param.min, lowValue) };
    const lowResults = calculateTCO(lowInputs);

    // Calculate high scenario (+20%)
    const highValue = param.key === 'depotChargingShare'
      ? Math.min(param.max, baseValue + 0.2)
      : baseValue * 1.2;
    const highInputs = { ...baseInputs, [key]: Math.min(param.max, highValue) };
    const highResults = calculateTCO(highInputs);

    const impactLow = ((lowResults.fleet.electricTCO - baseTCO) / baseTCO) * 100;
    const impactHigh = ((highResults.fleet.electricTCO - baseTCO) / baseTCO) * 100;

    results.push({
      parameter: param.key,
      label: param.label,
      lowValue: lowInputs[key] as number,
      highValue: highInputs[key] as number,
      lowTCO: lowResults.fleet.electricTCO,
      highTCO: highResults.fleet.electricTCO,
      impactPercent: Math.max(Math.abs(impactLow), Math.abs(impactHigh)),
    });
  }

  // Sort by impact
  return results.sort((a, b) => b.impactPercent - a.impactPercent);
}

// Formatting utilities
export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('de-DE').format(value);

export const formatPercent = (value: number) =>
  `${value.toFixed(1)}%`;
