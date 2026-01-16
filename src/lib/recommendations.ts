import type { CalculatorInputs, CalculationResults, Recommendation } from '../types';

export function generateRecommendations(inputs: CalculatorInputs, results: CalculationResults): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Check break-even
  if (results.breakEvenYears < 3) {
    recommendations.push({
      id: 'quick-breakeven',
      type: 'success',
      title: 'Schneller Break-Even',
      description: `Mit einem Break-Even von nur ${results.paybackMonths.toFixed(0)} Monaten ist jetzt ein idealer Umstiegszeitpunkt.`,
      icon: 'TrendingDown',
    });
  } else if (results.breakEvenYears > inputs.usageYears) {
    recommendations.push({
      id: 'long-breakeven',
      type: 'warning',
      title: 'Break-Even nicht in Nutzungsdauer',
      description: 'Erwägen Sie eine längere Nutzungsdauer oder prüfen Sie Ihre Stromkosten.',
      icon: 'AlertTriangle',
    });
  }

  // Check depot charging
  if (inputs.depotChargingShare < 0.6) {
    const potentialSavings = Math.round((0.55 - inputs.electricityPrice) * (inputs.annualMileage / 100) * 120 * 0.2);
    recommendations.push({
      id: 'increase-depot-charging',
      type: 'tip',
      title: 'Mehr Depot-Laden',
      description: `+20% Depot-Laden könnte ca. ${potentialSavings.toLocaleString('de-DE')} € pro Jahr sparen.`,
      icon: 'Battery',
    });
  }

  // Check fleet size for infrastructure
  if (inputs.fleetSize >= 5 && !inputs.includeInfrastructure) {
    recommendations.push({
      id: 'consider-infrastructure',
      type: 'info',
      title: 'Ladeinfrastruktur einplanen',
      description: 'Bei 5+ Fahrzeugen lohnt sich eigene Ladeinfrastruktur fast immer.',
      icon: 'Plug',
    });
  }

  // DC charger recommendation for high mileage
  if (inputs.annualMileage > 100000 && inputs.includeInfrastructure && !inputs.dcCharging) {
    recommendations.push({
      id: 'dc-charger',
      type: 'info',
      title: 'DC-Schnelllader empfohlen',
      description: 'Bei hoher Fahrleistung erhöht DC-Laden die Fahrzeugverfügbarkeit.',
      icon: 'Zap',
    });
  }

  // High ROI
  if (results.roi > 50) {
    recommendations.push({
      id: 'high-roi',
      type: 'success',
      title: 'Hoher ROI',
      description: `${results.roi.toFixed(0)}% ROI über ${inputs.usageYears} Jahre - eine attraktive Investition.`,
      icon: 'TrendingUp',
    });
  }

  // CO2 savings
  if (results.co2Savings > 100) {
    recommendations.push({
      id: 'co2-savings',
      type: 'success',
      title: 'Signifikante CO2-Einsparung',
      description: `${results.co2Savings.toFixed(0)} Tonnen CO2 weniger - gut für CSR-Berichte.`,
      icon: 'Leaf',
    });
  }

  // Regulatory warning
  const usageEndYear = 2026 + inputs.usageYears;
  if (usageEndYear > 2030) {
    recommendations.push({
      id: 'regulatory-change',
      type: 'warning',
      title: 'Förderungen enden',
      description: 'KFZ-Steuerbefreiung endet 2030, Mautbefreiung 2031. Bereits eingerechnet.',
      icon: 'Clock',
    });
  }

  // THG Quote reminder
  recommendations.push({
    id: 'thg-quote',
    type: 'info',
    title: 'THG-Quote nicht vergessen',
    description: `Jährlich ${Math.abs(results.electric.thgQuote).toLocaleString('de-DE')} € pro Fahrzeug durch THG-Handel möglich.`,
    icon: 'Euro',
  });

  // Limit to 5 most relevant
  return recommendations.slice(0, 5);
}

// Get the most important driver for TCO
export function getTopCostDriver(inputs: CalculatorInputs): { parameter: string; impact: string } {
  const avgElectricityPrice = inputs.electricityPrice * inputs.depotChargingShare + 0.55 * (1 - inputs.depotChargingShare);

  const energyCost = (inputs.annualMileage / 100) * 120 * avgElectricityPrice * inputs.usageYears;
  const tollSavings = inputs.annualMileage * inputs.highwayShare * 0.348 * inputs.usageYears;

  if (tollSavings > energyCost * 0.5) {
    return { parameter: 'Mautersparnis', impact: 'hoch' };
  } else if (inputs.depotChargingShare < 0.5) {
    return { parameter: 'Strompreis', impact: 'sehr hoch' };
  } else {
    return { parameter: 'Jahresfahrleistung', impact: 'moderat' };
  }
}
