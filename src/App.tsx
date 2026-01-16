import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Truck, Zap, Fuel, TrendingDown, Leaf, Calculator, ChevronRight, Download, Euro, Gauge, Calendar, Route, Sparkles, Battery, ArrowRight, CheckCircle2 } from 'lucide-react';

// Formatierungsfunktionen
const formatCurrency = (value) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value) => new Intl.NumberFormat('de-DE').format(value);

// Animated Number Display
const AnimatedValue = ({ value, prefix = '', suffix = '' }) => (
  <span className="tabular-nums">{prefix}{value}{suffix}</span>
);

// Modern Input Field
const InputField = ({ label, value, onChange, unit, icon: Icon, min, max, step = 1 }) => (
  <div className="group">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
      {Icon && (
        <span className="p-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 group-focus-within:from-emerald-100 group-focus-within:to-emerald-50 transition-colors">
          <Icon className="w-3.5 h-3.5 text-slate-500 group-focus-within:text-emerald-600 transition-colors" />
        </span>
      )}
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
        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-slate-800 font-medium pr-16 hover:border-slate-300"
      />
      {unit && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium bg-slate-100 px-2 py-1 rounded-md">
          {unit}
        </span>
      )}
    </div>
  </div>
);

// Modern Slider
const SliderField = ({ label, value, onChange, icon: Icon }) => (
  <div className="group">
    <div className="flex items-center justify-between mb-3">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
        {Icon && (
          <span className="p-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50">
            <Icon className="w-3.5 h-3.5 text-slate-500" />
          </span>
        )}
        {label}
      </label>
      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
        {Math.round(value * 100)}%
      </span>
    </div>
    <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
        style={{ width: `${value * 100}%` }}
      />
      <input
        type="range"
        min="0"
        max="100"
        value={value * 100}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  </div>
);

// Glassmorphism Result Card
const ResultCard = ({ label, value, subtext, icon: Icon, gradient, iconBg }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} border border-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
    <div className={`inline-flex p-2.5 rounded-xl ${iconBg} mb-3`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="text-white/80 text-sm font-medium mb-1">{label}</div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    {subtext && <div className="text-white/60 text-xs">{subtext}</div>}
  </div>
);

// Modern Cost Bar
const CostBar = ({ label, dieselValue, electricValue, maxValue }) => {
  const dieselWidth = Math.max((dieselValue / maxValue) * 100, 8);
  const electricWidth = Math.max((electricValue / maxValue) * 100, 8);
  const savings = dieselValue - electricValue;
  const savingsPercent = dieselValue > 0 ? ((savings / dieselValue) * 100).toFixed(0) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700">{label}</span>
        {savings > 0 && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            -{savingsPercent}%
          </span>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-20">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-slate-500">Diesel</span>
          </div>
          <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 rounded-lg flex items-center justify-end px-3 transition-all duration-700 ease-out"
              style={{ width: `${dieselWidth}%` }}
            >
              <span className="text-xs font-bold text-white drop-shadow-sm">{formatCurrency(dieselValue)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 w-20">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-slate-500">E-LKW</span>
          </div>
          <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 rounded-lg flex items-center justify-end px-3 transition-all duration-700 ease-out"
              style={{ width: `${electricWidth}%` }}
            >
              <span className="text-xs font-bold text-white drop-shadow-sm">{formatCurrency(electricValue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Vehicle Class Button
const VehicleButton = ({ id, name, specs, icon, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden group ${
      selected
        ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg shadow-emerald-500/20'
        : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md'
    }`}
  >
    {selected && (
      <div className="absolute top-3 right-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      </div>
    )}
    <div className={`inline-flex p-2 rounded-xl mb-2 transition-colors ${selected ? 'bg-emerald-500' : 'bg-slate-100 group-hover:bg-emerald-100'}`}>
      {icon}
    </div>
    <div className="font-semibold text-slate-800">{name}</div>
    <div className="text-sm text-slate-500">{specs}</div>
  </button>
);

// Main Component
export default function ETruckCalculator() {
  const [annualMileage, setAnnualMileage] = useState(120000);
  const [usageYears, setUsageYears] = useState(8);
  const [highwayShare, setHighwayShare] = useState(0.8);
  const [depotChargingShare, setDepotChargingShare] = useState(0.7);
  const [dieselPrice, setDieselPrice] = useState(1.45);
  const [electricityPrice, setElectricityPrice] = useState(0.25);
  const [selectedVehicleClass, setSelectedVehicleClass] = useState('N3');

  const vehicleData = {
    N1: { dieselConsumption: 12, electricConsumption: 28, dieselPurchase: 45000, electricPurchase: 75000, thgQuote: 225, maintenance: { diesel: 0.08, electric: 0.05 }, insurance: { diesel: 2500, electric: 2375 } },
    N2: { dieselConsumption: 22, electricConsumption: 100, dieselPurchase: 95000, electricPurchase: 180000, thgQuote: 1545, maintenance: { diesel: 0.12, electric: 0.08 }, insurance: { diesel: 5000, electric: 4750 } },
    N3: { dieselConsumption: 32, electricConsumption: 120, dieselPurchase: 120000, electricPurchase: 350000, thgQuote: 2505, maintenance: { diesel: 0.15, electric: 0.10 }, insurance: { diesel: 8000, electric: 7500 } },
  };

  const results = useMemo(() => {
    const vd = vehicleData[selectedVehicleClass];

    const dieselEnergyAnnual = (annualMileage / 100) * vd.dieselConsumption * dieselPrice;
    const dieselTollAnnual = annualMileage * highwayShare * 0.348;
    const dieselMaintenanceAnnual = annualMileage * vd.maintenance.diesel;
    const dieselTaxAnnual = selectedVehicleClass === 'N3' ? 1681 : selectedVehicleClass === 'N2' ? 914 : 556;
    const dieselAnnualTotal = dieselEnergyAnnual + dieselTollAnnual + dieselMaintenanceAnnual + vd.insurance.diesel + dieselTaxAnnual;

    const avgElectricityPrice = electricityPrice * depotChargingShare + 0.55 * (1 - depotChargingShare);
    const electricEnergyAnnual = (annualMileage / 100) * vd.electricConsumption * avgElectricityPrice;
    const electricMaintenanceAnnual = annualMileage * vd.maintenance.electric;
    const electricAnnualTotal = electricEnergyAnnual + electricMaintenanceAnnual + vd.insurance.electric - vd.thgQuote;

    const subsidyEffect = vd.electricPurchase * 0.25;
    const electricNetPurchase = vd.electricPurchase - subsidyEffect;

    const dieselResidual = vd.dieselPurchase * 0.15;
    const electricResidual = vd.electricPurchase * 0.20;

    const dieselTCO = vd.dieselPurchase + (dieselAnnualTotal * usageYears) - dieselResidual;
    const electricTCO = electricNetPurchase + (electricAnnualTotal * usageYears) - electricResidual;

    const annualSavings = dieselAnnualTotal - electricAnnualTotal;
    const purchaseDiff = electricNetPurchase - vd.dieselPurchase;
    const breakEvenYears = annualSavings > 0 ? purchaseDiff / annualSavings : Infinity;

    const dieselCO2 = (annualMileage / 100) * vd.dieselConsumption * 2.64 * usageYears / 1000;
    const electricCO2 = (annualMileage / 100) * vd.electricConsumption * 0.38 * usageYears / 1000;

    return {
      diesel: { purchase: vd.dieselPurchase, annualTotal: dieselAnnualTotal, energy: dieselEnergyAnnual, toll: dieselTollAnnual, maintenance: dieselMaintenanceAnnual, insurance: vd.insurance.diesel, tco: dieselTCO },
      electric: { purchase: vd.electricPurchase, netPurchase: electricNetPurchase, annualTotal: electricAnnualTotal, energy: electricEnergyAnnual, toll: 0, maintenance: electricMaintenanceAnnual, insurance: vd.insurance.electric, thgQuote: -vd.thgQuote, tco: electricTCO },
      savings: dieselTCO - electricTCO,
      annualSavings,
      breakEvenYears: Math.max(0, breakEvenYears),
      co2Savings: dieselCO2 - electricCO2,
      dieselCO2,
    };
  }, [annualMileage, usageYears, highwayShare, depotChargingShare, dieselPrice, electricityPrice, selectedVehicleClass]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tMi0xNEgyNnYyaDh2LTJ6bTItMnYtMkgyNHYyaDEyem0wIDEwdi0ySDI0djJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-2xl shadow-lg">
                  <Truck className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  E-Truck TCO-Rechner
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-medium">2026</span>
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">Elektro vs. Diesel Kostenvergleich</p>
              </div>
            </div>
            <button className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 transition-all hover:scale-105">
              <Download className="w-4 h-4" />
              PDF Export
              <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-16 relative z-10 mb-8">
          <ResultCard
            label="Gesamtersparnis"
            value={formatCurrency(results.savings)}
            subtext={`in ${usageYears} Jahren Nutzung`}
            icon={TrendingDown}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            iconBg="bg-white/20"
          />
          <ResultCard
            label="Break-Even"
            value={results.breakEvenYears < 20 ? `${results.breakEvenYears.toFixed(1)} Jahre` : 'N/A'}
            subtext={results.breakEvenYears < 20 ? `${formatNumber(Math.round(results.breakEvenYears * annualMileage))} km` : ''}
            icon={Calculator}
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            iconBg="bg-white/20"
          />
          <ResultCard
            label="Jährliche Ersparnis"
            value={formatCurrency(results.annualSavings)}
            subtext="bei Betriebskosten"
            icon={Euro}
            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            iconBg="bg-white/20"
          />
          <ResultCard
            label="CO2-Einsparung"
            value={`${results.co2Savings.toFixed(0)} Tonnen`}
            subtext={`${((results.co2Savings / results.dieselCO2) * 100).toFixed(0)}% weniger Emissionen`}
            icon={Leaf}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
            iconBg="bg-white/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-4 space-y-6">
            {/* Vehicle Class */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50">
                  <Truck className="w-5 h-5 text-slate-600" />
                </span>
                Fahrzeugklasse
              </h3>
              <div className="space-y-3">
                <VehicleButton
                  id="N1"
                  name="N1 - Transporter"
                  specs="bis 3,5 Tonnen"
                  icon={<Truck className={`w-4 h-4 ${selectedVehicleClass === 'N1' ? 'text-white' : 'text-slate-500'}`} />}
                  selected={selectedVehicleClass === 'N1'}
                  onClick={() => setSelectedVehicleClass('N1')}
                />
                <VehicleButton
                  id="N2"
                  name="N2 - Verteiler-LKW"
                  specs="3,5 - 12 Tonnen"
                  icon={<Truck className={`w-4 h-4 ${selectedVehicleClass === 'N2' ? 'text-white' : 'text-slate-500'}`} />}
                  selected={selectedVehicleClass === 'N2'}
                  onClick={() => setSelectedVehicleClass('N2')}
                />
                <VehicleButton
                  id="N3"
                  name="N3 - Sattelzug"
                  specs="über 12 Tonnen"
                  icon={<Truck className={`w-4 h-4 ${selectedVehicleClass === 'N3' ? 'text-white' : 'text-slate-500'}`} />}
                  selected={selectedVehicleClass === 'N3'}
                  onClick={() => setSelectedVehicleClass('N3')}
                />
              </div>
            </div>

            {/* Usage Profile */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50">
                  <Route className="w-5 h-5 text-slate-600" />
                </span>
                Einsatzprofil
              </h3>
              <div className="space-y-5">
                <InputField label="Jahresfahrleistung" value={annualMileage} onChange={setAnnualMileage} unit="km" icon={Gauge} min={10000} max={500000} step={5000} />
                <InputField label="Nutzungsdauer" value={usageYears} onChange={setUsageYears} unit="Jahre" icon={Calendar} min={1} max={15} />
                <SliderField label="Autobahn-Anteil" value={highwayShare} onChange={setHighwayShare} icon={Route} />
                <SliderField label="Depot-Laden" value={depotChargingShare} onChange={setDepotChargingShare} icon={Battery} />
              </div>
            </div>

            {/* Energy Prices */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50">
                  <Fuel className="w-5 h-5 text-slate-600" />
                </span>
                Energiepreise
              </h3>
              <div className="space-y-5">
                <InputField label="Diesel (netto)" value={dieselPrice} onChange={setDieselPrice} unit="€/L" icon={Fuel} min={1} max={3} step={0.05} />
                <InputField label="Strom Depot" value={electricityPrice} onChange={setElectricityPrice} unit="€/kWh" icon={Zap} min={0.1} max={0.6} step={0.01} />
              </div>
            </div>

            {/* Benefits */}
            <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Eingerechnete Vorteile
                </h4>
                <ul className="space-y-3">
                  {[
                    'Sonder-AfA: 75% im 1. Jahr',
                    'Mautbefreiung bis 2031',
                    `THG-Quote: ${formatCurrency(vehicleData[selectedVehicleClass].thgQuote)}/Jahr`,
                    'KFZ-Steuer befreit bis 2030',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-200 flex-shrink-0" />
                      <span className="text-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-8 space-y-6">
            {/* Chart */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                </span>
                Kostenentwicklung
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={amortizationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dieselGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="electricGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k €`} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    <Area type="monotone" dataKey="Diesel" stroke="#f59e0b" strokeWidth={3} fill="url(#dieselGradient)" dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    <Area type="monotone" dataKey="E-LKW" stroke="#3b82f6" strokeWidth={3} fill="url(#electricGradient)" dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {results.breakEvenYears > 0 && results.breakEvenYears < usageYears && (
                <div className="mt-4 flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <TrendingDown className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-emerald-800 font-medium">
                    Break-Even nach <strong>{results.breakEvenYears.toFixed(1)} Jahren</strong> - danach sparen Sie <strong>{formatCurrency(results.annualSavings)}</strong> jährlich
                  </span>
                </div>
              )}
            </div>

            {/* Cost Comparison */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50">
                  <Euro className="w-5 h-5 text-violet-600" />
                </span>
                Jährliche Betriebskosten
              </h3>
              <div className="space-y-6">
                <CostBar label="Energiekosten" dieselValue={results.diesel.energy} electricValue={results.electric.energy} maxValue={Math.max(results.diesel.energy, results.electric.energy) * 1.1} />
                <CostBar label="Mautgebühren" dieselValue={results.diesel.toll} electricValue={results.electric.toll} maxValue={results.diesel.toll * 1.1 || 1} />
                <CostBar label="Wartung & Verschleiß" dieselValue={results.diesel.maintenance} electricValue={results.electric.maintenance} maxValue={Math.max(results.diesel.maintenance, results.electric.maintenance) * 1.1} />
              </div>

              {/* THG Quote Highlight */}
              <div className="mt-6 relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-emerald-500 to-teal-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-white">THG-Quote Erlös</div>
                      <div className="text-emerald-100 text-sm">Zusätzliche Einnahmen für E-LKW</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    +{formatCurrency(Math.abs(results.electric.thgQuote))}<span className="text-lg font-medium text-emerald-100">/Jahr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TCO Summary */}
            <div className="grid grid-cols-2 gap-6">
              {/* Diesel */}
              <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-200/50">
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber-200/30 rounded-full" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-amber-500/30">
                      <Fuel className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-amber-900">Diesel-LKW</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-700">Anschaffung</span>
                      <span className="font-semibold text-amber-900">{formatCurrency(results.diesel.purchase)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-700">Betrieb ({usageYears} Jahre)</span>
                      <span className="font-semibold text-amber-900">{formatCurrency(results.diesel.annualTotal * usageYears)}</span>
                    </div>
                    <div className="border-t-2 border-amber-200 pt-3 mt-3 flex justify-between items-end">
                      <span className="font-bold text-amber-900">Gesamt TCO</span>
                      <span className="text-2xl font-bold text-amber-900">{formatCurrency(results.diesel.tco)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* E-LKW */}
              <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 border-2 border-blue-200/50">
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-200/30 rounded-full" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/30">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-blue-900">E-LKW</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Anschaffung (netto)</span>
                      <span className="font-semibold text-blue-900">{formatCurrency(results.electric.netPurchase)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Betrieb ({usageYears} Jahre)</span>
                      <span className="font-semibold text-blue-900">{formatCurrency(results.electric.annualTotal * usageYears)}</span>
                    </div>
                    <div className="border-t-2 border-blue-200 pt-3 mt-3 flex justify-between items-end">
                      <span className="font-bold text-blue-900">Gesamt TCO</span>
                      <span className="text-2xl font-bold text-blue-900">{formatCurrency(results.electric.tco)}</span>
                    </div>
                  </div>
                  {/* Savings Badge */}
                  <div className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-3 text-center shadow-lg shadow-emerald-500/30">
                    <div className="text-emerald-100 text-xs font-medium">Ihre Ersparnis</div>
                    <div className="text-xl font-bold text-white">{formatCurrency(results.savings)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tMi0xNEgyNnYyaDh2LTJ6bTItMnYtMkgyNHYyaDEyem0wIDEwdi0ySDI0djJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Bereit für den Umstieg?</h3>
                  <p className="text-slate-400 max-w-md">
                    Laden Sie den detaillierten TCO-Report herunter oder lassen Sie sich von unseren Experten beraten.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition-all hover:scale-105">
                    <Download className="w-5 h-5" />
                    PDF Report
                  </button>
                  <button className="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-emerald-500/30">
                    Beratung anfragen
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">
            Datenstand: Januar 2026 · Mautbefreiung E-LKW bis 30.06.2031 · THG-Quote bis 2040 · Alle Angaben ohne Gewähr
          </p>
        </div>
      </footer>
    </div>
  );
}
