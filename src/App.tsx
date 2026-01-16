import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Truck, Zap, Fuel, TrendingDown, Leaf, Calculator, ChevronRight, Download, Settings, Euro, Gauge, Calendar, Route } from 'lucide-react';

// Formatierungsfunktionen
const formatCurrency = (value) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value) => new Intl.NumberFormat('de-DE').format(value);

// Eingabefeld mit Label
const InputField = ({ label, value, onChange, unit, icon: Icon, min, max, step = 1 }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
      {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      {label}
    </label>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition pr-12"
      />
      {unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
          {unit}
        </span>
      )}
    </div>
  </div>
);

// Slider mit Prozentanzeige
const SliderField = ({ label, value, onChange, icon: Icon }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        {label}
      </label>
      <span className="text-sm font-semibold text-emerald-600">{Math.round(value * 100)}%</span>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      value={value * 100}
      onChange={(e) => onChange(Number(e.target.value) / 100)}
      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
    />
  </div>
);

// Ergebnis-Highlight-Box
const ResultHighlight = ({ label, value, subtext, icon: Icon, color = 'emerald' }) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
  };
  
  return (
    <div className={`p-3 rounded-xl border-2 ${colorClasses[color]}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <div className="text-lg font-bold">{value}</div>
      {subtext && <div className="text-xs opacity-70">{subtext}</div>}
    </div>
  );
};

// Kostenvergleichs-Balken
const CostComparisonBar = ({ label, dieselValue, electricValue, maxValue }) => {
  const dieselWidth = Math.max((dieselValue / maxValue) * 100, 5);
  const electricWidth = Math.max((electricValue / maxValue) * 100, 5);
  const savings = dieselValue - electricValue;
  const savingsPercent = dieselValue > 0 ? ((savings / dieselValue) * 100).toFixed(0) : 0;
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        {savings > 0 && (
          <span className="text-emerald-600 font-semibold text-xs">-{savingsPercent}%</span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 w-12">Diesel</span>
          <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
              style={{ width: `${dieselWidth}%` }}
            >
              <span className="text-xs font-medium text-white drop-shadow">{formatCurrency(dieselValue)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 w-12">E-LKW</span>
          <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-400 to-blue-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
              style={{ width: `${electricWidth}%` }}
            >
              <span className="text-xs font-medium text-white drop-shadow">{formatCurrency(electricValue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hauptkomponente
export default function ETruckCalculator() {
  // State für Eingaben
  const [annualMileage, setAnnualMileage] = useState(120000);
  const [usageYears, setUsageYears] = useState(8);
  const [highwayShare, setHighwayShare] = useState(0.8);
  const [depotChargingShare, setDepotChargingShare] = useState(0.7);
  const [dieselPrice, setDieselPrice] = useState(1.45);
  const [electricityPrice, setElectricityPrice] = useState(0.25);
  const [selectedVehicleClass, setSelectedVehicleClass] = useState('N3');
  
  // Fahrzeugdaten je nach Klasse
  const vehicleData = {
    N1: { dieselConsumption: 12, electricConsumption: 28, dieselPurchase: 45000, electricPurchase: 75000, thgQuote: 225, maintenance: { diesel: 0.08, electric: 0.05 }, insurance: { diesel: 2500, electric: 2375 } },
    N2: { dieselConsumption: 22, electricConsumption: 100, dieselPurchase: 95000, electricPurchase: 180000, thgQuote: 1545, maintenance: { diesel: 0.12, electric: 0.08 }, insurance: { diesel: 5000, electric: 4750 } },
    N3: { dieselConsumption: 32, electricConsumption: 120, dieselPurchase: 120000, electricPurchase: 350000, thgQuote: 2505, maintenance: { diesel: 0.15, electric: 0.10 }, insurance: { diesel: 8000, electric: 7500 } },
  };
  
  // Berechnete Werte
  const results = useMemo(() => {
    const vd = vehicleData[selectedVehicleClass];
    
    // Diesel-Kosten
    const dieselEnergyAnnual = (annualMileage / 100) * vd.dieselConsumption * dieselPrice;
    const dieselTollAnnual = annualMileage * highwayShare * 0.348;
    const dieselMaintenanceAnnual = annualMileage * vd.maintenance.diesel;
    const dieselTaxAnnual = selectedVehicleClass === 'N3' ? 1681 : selectedVehicleClass === 'N2' ? 914 : 556;
    const dieselAnnualTotal = dieselEnergyAnnual + dieselTollAnnual + dieselMaintenanceAnnual + vd.insurance.diesel + dieselTaxAnnual;
    
    // E-LKW-Kosten
    const avgElectricityPrice = electricityPrice * depotChargingShare + 0.55 * (1 - depotChargingShare);
    const electricEnergyAnnual = (annualMileage / 100) * vd.electricConsumption * avgElectricityPrice;
    const electricMaintenanceAnnual = annualMileage * vd.maintenance.electric;
    const electricAnnualTotal = electricEnergyAnnual + electricMaintenanceAnnual + vd.insurance.electric - vd.thgQuote;
    
    // Anschaffung mit Förderung
    const subsidyEffect = vd.electricPurchase * 0.25;
    const electricNetPurchase = vd.electricPurchase - subsidyEffect;
    
    // Restwerte
    const dieselResidual = vd.dieselPurchase * 0.15;
    const electricResidual = vd.electricPurchase * 0.20;
    
    // TCO
    const dieselTCO = vd.dieselPurchase + (dieselAnnualTotal * usageYears) - dieselResidual;
    const electricTCO = electricNetPurchase + (electricAnnualTotal * usageYears) - electricResidual;
    
    // Break-Even
    const annualSavings = dieselAnnualTotal - electricAnnualTotal;
    const purchaseDiff = electricNetPurchase - vd.dieselPurchase;
    const breakEvenYears = annualSavings > 0 ? purchaseDiff / annualSavings : Infinity;
    
    // CO2
    const dieselCO2 = (annualMileage / 100) * vd.dieselConsumption * 2.64 * usageYears / 1000;
    const electricCO2 = (annualMileage / 100) * vd.electricConsumption * 0.38 * usageYears / 1000;
    
    return {
      diesel: {
        purchase: vd.dieselPurchase,
        annualTotal: dieselAnnualTotal,
        energy: dieselEnergyAnnual,
        toll: dieselTollAnnual,
        maintenance: dieselMaintenanceAnnual,
        insurance: vd.insurance.diesel,
        tco: dieselTCO,
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
      },
      savings: dieselTCO - electricTCO,
      annualSavings,
      breakEvenYears: Math.max(0, breakEvenYears),
      co2Savings: dieselCO2 - electricCO2,
      dieselCO2,
    };
  }, [annualMileage, usageYears, highwayShare, depotChargingShare, dieselPrice, electricityPrice, selectedVehicleClass]);
  
  // Amortisierungsdaten
  const amortizationData = useMemo(() => {
    const data = [];
    for (let i = 0; i <= usageYears; i++) {
      data.push({
        year: i,
        label: i === 0 ? 'Start' : `Jahr ${i}`,
        Diesel: results.diesel.purchase + (results.diesel.annualTotal * i),
        'E-LKW': results.electric.netPurchase + (results.electric.annualTotal * i),
      });
    }
    return data;
  }, [results, usageYears]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">E-Truck TCO-Rechner</h1>
              <p className="text-slate-400 text-xs">Elektro vs. Diesel Vergleich</p>
            </div>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition">
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Linke Spalte: Eingaben */}
          <div className="space-y-4">
            {/* Fahrzeugklasse */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-slate-400" />
                Fahrzeugklasse
              </h3>
              <div className="space-y-2">
                {[
                  { id: 'N1', name: 'N1 – Transporter', specs: 'bis 3,5t' },
                  { id: 'N2', name: 'N2 – Verteiler', specs: '3,5-12t' },
                  { id: 'N3', name: 'N3 – Sattelzug', specs: '>12t' },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicleClass(v.id)}
                    className={`w-full p-2.5 rounded-lg border-2 text-left transition text-sm ${
                      selectedVehicleClass === v.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-medium text-slate-900">{v.name}</div>
                    <div className="text-xs text-slate-500">{v.specs}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Einsatzprofil */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                <Route className="w-4 h-4 text-slate-400" />
                Einsatzprofil
              </h3>
              <div className="space-y-3">
                <InputField
                  label="Jahresfahrleistung"
                  value={annualMileage}
                  onChange={setAnnualMileage}
                  unit="km"
                  icon={Gauge}
                  min={10000}
                  max={500000}
                  step={5000}
                />
                <InputField
                  label="Nutzungsdauer"
                  value={usageYears}
                  onChange={setUsageYears}
                  unit="Jahre"
                  icon={Calendar}
                  min={1}
                  max={15}
                />
                <SliderField
                  label="Autobahn-Anteil (Maut)"
                  value={highwayShare}
                  onChange={setHighwayShare}
                  icon={Route}
                />
                <SliderField
                  label="Depot-Laden"
                  value={depotChargingShare}
                  onChange={setDepotChargingShare}
                  icon={Zap}
                />
              </div>
            </div>
            
            {/* Energiepreise */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                <Fuel className="w-4 h-4 text-slate-400" />
                Energiepreise
              </h3>
              <div className="space-y-3">
                <InputField
                  label="Diesel (netto)"
                  value={dieselPrice}
                  onChange={setDieselPrice}
                  unit="€/L"
                  icon={Fuel}
                  min={1}
                  max={3}
                  step={0.05}
                />
                <InputField
                  label="Strom Depot"
                  value={electricityPrice}
                  onChange={setElectricityPrice}
                  unit="€/kWh"
                  icon={Zap}
                  min={0.1}
                  max={0.6}
                  step={0.01}
                />
              </div>
            </div>
            
            {/* Förderungen Info */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
              <h4 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2 text-sm">
                <Euro className="w-4 h-4" />
                Eingerechnete Vorteile
              </h4>
              <ul className="space-y-1 text-xs text-slate-700">
                <li className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> Sonder-AfA 75%</li>
                <li className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> Mautbefreiung bis 2031</li>
                <li className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> THG-Quote {formatCurrency(vehicleData[selectedVehicleClass].thgQuote)}/Jahr</li>
                <li className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span> KFZ-Steuer befreit</li>
              </ul>
            </div>
          </div>
          
          {/* Rechte Spalte: Ergebnisse */}
          <div className="lg:col-span-2 space-y-4">
            {/* Highlight-Boxen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ResultHighlight
                label="Gesamtersparnis"
                value={formatCurrency(results.savings)}
                subtext={`über ${usageYears} Jahre`}
                color="emerald"
                icon={TrendingDown}
              />
              <ResultHighlight
                label="Break-Even"
                value={results.breakEvenYears < 20 ? `${results.breakEvenYears.toFixed(1)} J.` : 'Nie'}
                subtext={results.breakEvenYears < 20 ? formatNumber(Math.round(results.breakEvenYears * annualMileage)) + ' km' : ''}
                color="blue"
                icon={Calculator}
              />
              <ResultHighlight
                label="Jährl. Ersparnis"
                value={formatCurrency(results.annualSavings)}
                subtext="Betriebskosten"
                color="emerald"
                icon={Euro}
              />
              <ResultHighlight
                label="CO₂-Einsparung"
                value={`${results.co2Savings.toFixed(0)} t`}
                subtext={`${((results.co2Savings / results.dieselCO2) * 100).toFixed(0)}% weniger`}
                color="emerald"
                icon={Leaf}
              />
            </div>
            
            {/* Amortisierungsgraph */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">Kumulierte Kosten</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={amortizationData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis 
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} 
                      tick={{ fontSize: 11 }} 
                      stroke="#94a3b8"
                      width={45}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="Diesel" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="E-LKW" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {results.breakEvenYears > 0 && results.breakEvenYears < usageYears && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-600 bg-emerald-50 rounded-lg p-2">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    <strong className="text-emerald-700">Break-Even nach {results.breakEvenYears.toFixed(1)} Jahren</strong>
                  </span>
                </div>
              )}
            </div>
            
            {/* Kostenvergleich Detail */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900 mb-4 text-sm">Jährliche Betriebskosten</h3>
              <div className="space-y-4">
                <CostComparisonBar
                  label="Energie"
                  dieselValue={results.diesel.energy}
                  electricValue={results.electric.energy}
                  maxValue={Math.max(results.diesel.energy, results.electric.energy) * 1.1}
                />
                <CostComparisonBar
                  label="Maut"
                  dieselValue={results.diesel.toll}
                  electricValue={results.electric.toll}
                  maxValue={results.diesel.toll * 1.1}
                />
                <CostComparisonBar
                  label="Wartung"
                  dieselValue={results.diesel.maintenance}
                  electricValue={results.electric.maintenance}
                  maxValue={Math.max(results.diesel.maintenance, results.electric.maintenance) * 1.1}
                />
              </div>
              
              {/* THG-Quote Highlight */}
              <div className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-emerald-800 text-sm">THG-Quote Erlös (nur E-LKW)</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-700">
                    +{formatCurrency(Math.abs(results.electric.thgQuote))}/Jahr
                  </span>
                </div>
              </div>
            </div>
            
            {/* TCO Zusammenfassung */}
            <div className="grid grid-cols-2 gap-4">
              {/* Diesel TCO */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-amber-500 p-1.5 rounded-lg text-white">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-amber-900 text-sm">Diesel-LKW</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-amber-700">Anschaffung</span>
                    <span className="font-medium">{formatCurrency(results.diesel.purchase)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700">Betrieb ({usageYears} J.)</span>
                    <span className="font-medium">{formatCurrency(results.diesel.annualTotal * usageYears)}</span>
                  </div>
                  <div className="border-t border-amber-300 pt-2 flex justify-between">
                    <span className="font-semibold text-amber-900">TCO</span>
                    <span className="text-lg font-bold text-amber-900">{formatCurrency(results.diesel.tco)}</span>
                  </div>
                </div>
              </div>
              
              {/* E-LKW TCO */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-blue-500 p-1.5 rounded-lg text-white">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-blue-900 text-sm">E-LKW</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Anschaffung (netto)</span>
                    <span className="font-medium">{formatCurrency(results.electric.netPurchase)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Betrieb ({usageYears} J.)</span>
                    <span className="font-medium">{formatCurrency(results.electric.annualTotal * usageYears)}</span>
                  </div>
                  <div className="border-t border-blue-300 pt-2 flex justify-between">
                    <span className="font-semibold text-blue-900">TCO</span>
                    <span className="text-lg font-bold text-blue-900">{formatCurrency(results.electric.tco)}</span>
                  </div>
                </div>
                {/* Savings Badge */}
                <div className="mt-3 bg-emerald-500 text-white rounded-lg p-2 text-center">
                  <div className="text-xs opacity-90">Sie sparen</div>
                  <div className="font-bold">{formatCurrency(results.savings)}</div>
                </div>
              </div>
            </div>
            
            {/* CTA */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Interesse?</h3>
                <p className="text-slate-300 text-xs mt-0.5">
                  Detaillierten Report herunterladen oder Beratung anfragen.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="bg-white text-slate-900 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <button className="bg-emerald-500 px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition flex items-center gap-1.5">
                  Beratung
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 mt-8 py-4">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>
            Daten: Januar 2026 · Mautbefreiung E-LKW bis 30.06.2031 · THG-Quote bis 2040 · Angaben ohne Gewähr
          </p>
        </div>
      </footer>
    </div>
  );
}
