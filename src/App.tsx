import { useState, useMemo, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Truck, Zap, Fuel, TrendingDown, Leaf, Calculator, ChevronRight, Download, Euro, Gauge, Calendar, Route, Sparkles, Battery, ArrowRight, CheckCircle2, Building2, Plug, Info, Clock, Share2, Mail, Phone, User, Building, X, Copy, Check, AlertTriangle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ============================================================
// KONSTANTEN & TYPEN
// ============================================================

const USAGE_PROFILES = {
  kep: { name: 'KEP / Kurier', annualMileage: 20000, highwayShare: 0.05, depotChargingShare: 1.0, description: '~80 km/Tag, Stadt' },
  nahverkehr: { name: 'Nahverkehr', annualMileage: 50000, highwayShare: 0.4, depotChargingShare: 0.8, description: '~200 km/Tag, Regional' },
  fernverkehr: { name: 'Fernverkehr', annualMileage: 150000, highwayShare: 0.9, depotChargingShare: 0.4, description: '~600 km/Tag, Langstrecke' },
  custom: { name: 'Individuell', annualMileage: 120000, highwayShare: 0.8, depotChargingShare: 0.7, description: 'Eigene Werte' },
};

const VEHICLE_DATA = {
  N1: { dieselConsumption: 12, electricConsumption: 28, dieselPurchase: 45000, electricPurchase: 75000, thgQuote: 225, maintenance: { diesel: 0.08, electric: 0.05 }, insurance: { diesel: 2500, electric: 2375 }, name: 'N1 - Transporter', specs: 'bis 3,5 Tonnen' },
  N2: { dieselConsumption: 22, electricConsumption: 100, dieselPurchase: 95000, electricPurchase: 180000, thgQuote: 1545, maintenance: { diesel: 0.12, electric: 0.08 }, insurance: { diesel: 5000, electric: 4750 }, name: 'N2 - Verteiler-LKW', specs: '3,5 - 12 Tonnen' },
  N3: { dieselConsumption: 32, electricConsumption: 120, dieselPurchase: 120000, electricPurchase: 350000, thgQuote: 2505, maintenance: { diesel: 0.15, electric: 0.10 }, insurance: { diesel: 8000, electric: 7500 }, name: 'N3 - Sattelzug', specs: 'über 12 Tonnen' },
};

const INFRASTRUCTURE_COSTS = {
  acCharger: 8000,
  dcCharger: 50000,
  gridUpgrade: 30000,
};

// ============================================================
// HILFSFUNKTIONEN
// ============================================================

const formatCurrency = (value: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat('de-DE').format(value);
const formatPercent = (value: number) => `${value.toFixed(1)}%`;

// ============================================================
// KOMPONENTEN
// ============================================================

// Modern Input Field
const InputField = ({ label, value, onChange, unit, icon: Icon, min, max, step = 1, info }: any) => (
  <div className="group">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
      {Icon && (
        <span className="p-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 group-focus-within:from-emerald-100 group-focus-within:to-emerald-50 transition-colors">
          <Icon className="w-3.5 h-3.5 text-slate-500 group-focus-within:text-emerald-600 transition-colors" />
        </span>
      )}
      {label}
      {info && (
        <span className="relative group/tooltip">
          <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50">
            {info}
          </span>
        </span>
      )}
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
const SliderField = ({ label, value, onChange, icon: Icon, info }: any) => (
  <div className="group">
    <div className="flex items-center justify-between mb-3">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
        {Icon && (
          <span className="p-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50">
            <Icon className="w-3.5 h-3.5 text-slate-500" />
          </span>
        )}
        {label}
        {info && (
          <span className="relative group/tooltip">
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50">
              {info}
            </span>
          </span>
        )}
      </label>
      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
        {Math.round(value * 100)}%
      </span>
    </div>
    <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300" style={{ width: `${value * 100}%` }} />
      <input type="range" min="0" max="100" value={value * 100} onChange={(e) => onChange(Number(e.target.value) / 100)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
    </div>
  </div>
);

// Toggle Switch
const Toggle = ({ label, checked, onChange, icon: Icon }: any) => (
  <label className="flex items-center justify-between cursor-pointer group">
    <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
      {Icon && (
        <span className="p-1.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50">
          <Icon className="w-3.5 h-3.5 text-slate-500" />
        </span>
      )}
      {label}
    </span>
    <div className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
    </div>
  </label>
);

// Result Card
const ResultCard = ({ label, value, subtext, icon: Icon, gradient, iconBg }: any) => (
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

// Cost Bar
const CostBar = ({ label, dieselValue, electricValue, maxValue, source }: any) => {
  const dieselWidth = Math.max((dieselValue / maxValue) * 100, 8);
  const electricWidth = Math.max((electricValue / maxValue) * 100, 8);
  const savings = dieselValue - electricValue;
  const savingsPercent = dieselValue > 0 ? ((savings / dieselValue) * 100).toFixed(0) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-700 flex items-center gap-2">
          {label}
          {source && (
            <span className="relative group/tooltip">
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50">
                {source}
              </span>
            </span>
          )}
        </span>
        {savings > 0 && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />-{savingsPercent}%
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
            <div className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 rounded-lg flex items-center justify-end px-3 transition-all duration-700" style={{ width: `${dieselWidth}%` }}>
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
            <div className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 rounded-lg flex items-center justify-end px-3 transition-all duration-700" style={{ width: `${electricWidth}%` }}>
              <span className="text-xs font-bold text-white drop-shadow-sm">{formatCurrency(electricValue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Vehicle Button
const VehicleButton = ({ id, name, specs, selected, onClick }: any) => (
  <button
    onClick={onClick}
    className={`relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden group ${
      selected ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg shadow-emerald-500/20' : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md'
    }`}
  >
    {selected && <div className="absolute top-3 right-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>}
    <div className={`inline-flex p-2 rounded-xl mb-2 transition-colors ${selected ? 'bg-emerald-500' : 'bg-slate-100 group-hover:bg-emerald-100'}`}>
      <Truck className={`w-4 h-4 ${selected ? 'text-white' : 'text-slate-500'}`} />
    </div>
    <div className="font-semibold text-slate-800">{name}</div>
    <div className="text-sm text-slate-500">{specs}</div>
  </button>
);

// Lead Form Modal
const LeadFormModal = ({ isOpen, onClose, onSubmit, isGeneratingPdf }: any) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', fleetSize: '', timeline: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition">
          <X className="w-5 h-5 text-slate-500" />
        </button>
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-emerald-100 rounded-2xl mb-4">
            <Download className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">TCO-Report herunterladen</h3>
          <p className="text-slate-500 text-sm mt-1">Erhalten Sie Ihren detaillierten Bericht als PDF</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20" placeholder="Max Mustermann" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Firma *</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input required type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20" placeholder="Spedition GmbH" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">E-Mail *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20" placeholder="max@firma.de" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Telefon</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20" placeholder="+49 123 456789" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Flottengröße</label>
              <select value={formData.fleetSize} onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })} className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20">
                <option value="">Auswählen</option>
                <option value="1-5">1-5 Fahrzeuge</option>
                <option value="6-20">6-20 Fahrzeuge</option>
                <option value="21-50">21-50 Fahrzeuge</option>
                <option value="50+">50+ Fahrzeuge</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={isGeneratingPdf} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {isGeneratingPdf ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                PDF wird erstellt...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                PDF herunterladen
              </>
            )}
          </button>
        </form>
        <p className="text-xs text-slate-400 text-center mt-4">Ihre Daten werden vertraulich behandelt und nicht an Dritte weitergegeben.</p>
      </div>
    </div>
  );
};

// Regulatory Timeline
const RegulatoryTimeline = ({ usageYears }: { usageYears: number }) => {
  const currentYear = 2026;
  const endYear = currentYear + usageYears;
  const events = [
    { year: 2026, label: 'Heute', active: true },
    { year: 2030, label: 'KFZ-Steuer-Befreiung endet', warning: endYear >= 2030 },
    { year: 2031, label: 'Mautbefreiung endet', warning: endYear >= 2031 },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200">
      <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4" />
        Regulatory Timeline
      </h4>
      <div className="relative">
        <div className="absolute top-3 left-0 right-0 h-1 bg-slate-200 rounded-full" />
        <div className="relative flex justify-between">
          {events.map((event, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${event.active ? 'bg-emerald-500 border-emerald-500' : event.warning ? 'bg-amber-100 border-amber-500' : 'bg-white border-slate-300'}`}>
                {event.warning && <AlertTriangle className="w-3 h-3 text-amber-600" />}
              </div>
              <span className={`text-xs mt-2 font-medium ${event.warning ? 'text-amber-600' : 'text-slate-500'}`}>{event.year}</span>
              <span className={`text-xs text-center max-w-20 ${event.warning ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>{event.label}</span>
            </div>
          ))}
        </div>
      </div>
      {endYear >= 2030 && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Ihre Nutzungsdauer von {usageYears} Jahren überschreitet wichtige Förder-Deadlines. Die TCO-Berechnung berücksichtigt dies automatisch.
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================
// HAUPTKOMPONENTE
// ============================================================

export default function ETruckCalculator() {
  const reportRef = useRef<HTMLDivElement>(null);

  // State
  const [fleetSize, setFleetSize] = useState(1);
  const [usageProfile, setUsageProfile] = useState('custom');
  const [selectedVehicleClass, setSelectedVehicleClass] = useState('N3');
  const [annualMileage, setAnnualMileage] = useState(120000);
  const [usageYears, setUsageYears] = useState(8);
  const [highwayShare, setHighwayShare] = useState(0.8);
  const [depotChargingShare, setDepotChargingShare] = useState(0.7);
  const [dieselPrice, setDieselPrice] = useState(1.45);
  const [electricityPrice, setElectricityPrice] = useState(0.25);
  const [includeInfrastructure, setIncludeInfrastructure] = useState(false);
  const [chargingPoints, setChargingPoints] = useState(1);
  const [dcCharging, setDcCharging] = useState(false);
  const [gridUpgrade, setGridUpgrade] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // Update values when profile changes
  useEffect(() => {
    if (usageProfile !== 'custom') {
      const profile = USAGE_PROFILES[usageProfile as keyof typeof USAGE_PROFILES];
      setAnnualMileage(profile.annualMileage);
      setHighwayShare(profile.highwayShare);
      setDepotChargingShare(profile.depotChargingShare);
    }
  }, [usageProfile]);

  // Auto-suggest charging points
  useEffect(() => {
    setChargingPoints(Math.max(1, Math.ceil(fleetSize * 0.3)));
  }, [fleetSize]);

  // Calculations
  const results = useMemo(() => {
    const vd = VEHICLE_DATA[selectedVehicleClass as keyof typeof VEHICLE_DATA];

    // Diesel costs
    const dieselEnergyAnnual = (annualMileage / 100) * vd.dieselConsumption * dieselPrice;
    const dieselTollAnnual = annualMileage * highwayShare * 0.348;
    const dieselMaintenanceAnnual = annualMileage * vd.maintenance.diesel;
    const dieselTaxAnnual = selectedVehicleClass === 'N3' ? 1681 : selectedVehicleClass === 'N2' ? 914 : 556;
    const dieselAnnualTotal = dieselEnergyAnnual + dieselTollAnnual + dieselMaintenanceAnnual + vd.insurance.diesel + dieselTaxAnnual;

    // E-LKW costs
    const avgElectricityPrice = electricityPrice * depotChargingShare + 0.55 * (1 - depotChargingShare);
    const electricEnergyAnnual = (annualMileage / 100) * vd.electricConsumption * avgElectricityPrice;
    const electricMaintenanceAnnual = annualMileage * vd.maintenance.electric;

    // Tax exemption ends 2030, toll exemption ends 2031
    const yearsWithTaxExemption = Math.min(usageYears, Math.max(0, 2030 - 2026));
    const yearsWithTollExemption = Math.min(usageYears, Math.max(0, 2031 - 2026));
    const electricTaxTotal = dieselTaxAnnual * 0.25 * (usageYears - yearsWithTaxExemption);
    const electricTollTotal = annualMileage * highwayShare * 0.19 * (usageYears - yearsWithTollExemption); // Reduced toll for E-LKW after 2031

    const electricAnnualTotal = electricEnergyAnnual + electricMaintenanceAnnual + vd.insurance.electric - vd.thgQuote;

    // Purchase with subsidy
    const subsidyEffect = vd.electricPurchase * 0.25;
    const electricNetPurchase = vd.electricPurchase - subsidyEffect;

    // Infrastructure
    const infrastructureCost = includeInfrastructure
      ? chargingPoints * (dcCharging ? INFRASTRUCTURE_COSTS.dcCharger : INFRASTRUCTURE_COSTS.acCharger) + (gridUpgrade ? INFRASTRUCTURE_COSTS.gridUpgrade : 0)
      : 0;

    // Residual values
    const dieselResidual = vd.dieselPurchase * 0.15;
    const electricResidual = vd.electricPurchase * 0.20;

    // TCO per vehicle
    const dieselTCO = vd.dieselPurchase + (dieselAnnualTotal * usageYears) - dieselResidual;
    const electricTCO = electricNetPurchase + (electricAnnualTotal * usageYears) + electricTaxTotal / fleetSize + electricTollTotal / fleetSize - electricResidual + infrastructureCost / fleetSize;

    // Fleet totals
    const fleetDieselTCO = dieselTCO * fleetSize;
    const fleetElectricTCO = electricTCO * fleetSize;
    const fleetInvestment = electricNetPurchase * fleetSize + infrastructureCost;

    // Break-Even
    const annualSavings = dieselAnnualTotal - electricAnnualTotal;
    const purchaseDiff = electricNetPurchase - vd.dieselPurchase + infrastructureCost / fleetSize;
    const breakEvenYears = annualSavings > 0 ? purchaseDiff / annualSavings : Infinity;

    // CO2
    const dieselCO2 = (annualMileage / 100) * vd.dieselConsumption * 2.64 * usageYears / 1000;
    const electricCO2 = (annualMileage / 100) * vd.electricConsumption * 0.38 * usageYears / 1000;

    // KPIs
    const costPerKmDiesel = dieselAnnualTotal / annualMileage;
    const costPerKmElectric = electricAnnualTotal / annualMileage;
    const roi = ((fleetDieselTCO - fleetElectricTCO) / fleetInvestment) * 100;
    const paybackMonths = breakEvenYears * 12;

    return {
      diesel: { purchase: vd.dieselPurchase, annualTotal: dieselAnnualTotal, energy: dieselEnergyAnnual, toll: dieselTollAnnual, maintenance: dieselMaintenanceAnnual, insurance: vd.insurance.diesel, tco: dieselTCO, costPerKm: costPerKmDiesel },
      electric: { purchase: vd.electricPurchase, netPurchase: electricNetPurchase, annualTotal: electricAnnualTotal, energy: electricEnergyAnnual, toll: 0, maintenance: electricMaintenanceAnnual, insurance: vd.insurance.electric, thgQuote: -vd.thgQuote, tco: electricTCO, costPerKm: costPerKmElectric },
      fleet: { dieselTCO: fleetDieselTCO, electricTCO: fleetElectricTCO, investment: fleetInvestment, savings: fleetDieselTCO - fleetElectricTCO },
      infrastructure: { cost: infrastructureCost, perVehicle: infrastructureCost / fleetSize },
      savings: dieselTCO - electricTCO,
      annualSavings,
      breakEvenYears: Math.max(0, breakEvenYears),
      paybackMonths,
      roi,
      co2Savings: (dieselCO2 - electricCO2) * fleetSize,
      dieselCO2: dieselCO2 * fleetSize,
    };
  }, [annualMileage, usageYears, highwayShare, depotChargingShare, dieselPrice, electricityPrice, selectedVehicleClass, fleetSize, includeInfrastructure, chargingPoints, dcCharging, gridUpgrade]);

  const amortizationData = useMemo(() => {
    const data = [];
    for (let i = 0; i <= usageYears; i++) {
      data.push({
        year: i,
        label: i === 0 ? 'Start' : `Jahr ${i}`,
        Diesel: (results.diesel.purchase + (results.diesel.annualTotal * i)) * fleetSize,
        'E-LKW': (results.electric.netPurchase + (results.electric.annualTotal * i)) * fleetSize + results.infrastructure.cost,
      });
    }
    return data;
  }, [results, usageYears, fleetSize]);

  // Share functionality
  const handleShare = () => {
    const params = new URLSearchParams({
      fleet: fleetSize.toString(),
      profile: usageProfile,
      vehicle: selectedVehicleClass,
      mileage: annualMileage.toString(),
      years: usageYears.toString(),
      highway: highwayShare.toString(),
      depot: depotChargingShare.toString(),
      diesel: dieselPrice.toString(),
      electricity: electricityPrice.toString(),
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  // PDF Generation
  const handleGeneratePdf = async (formData: any) => {
    setIsGeneratingPdf(true);
    try {
      // Log lead data (in production, send to backend)
      console.log('Lead data:', formData);

      if (reportRef.current) {
        const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add header
        pdf.setFillColor(16, 24, 39);
        pdf.rect(0, 0, 210, 30, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.text('E-Truck TCO-Report', 15, 18);
        pdf.setFontSize(10);
        pdf.text(`Erstellt für: ${formData.company}`, 15, 25);
        pdf.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 150, 25);

        // Add content
        pdf.addImage(imgData, 'PNG', 0, 35, imgWidth, imgHeight);

        // Add footer
        const pageHeight = pdf.internal.pageSize.height;
        pdf.setFillColor(241, 245, 249);
        pdf.rect(0, pageHeight - 15, 210, 15, 'F');
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(8);
        pdf.text('Alle Angaben ohne Gewähr. Datenstand: Januar 2026', 15, pageHeight - 6);

        pdf.save(`TCO-Report-${formData.company.replace(/\s+/g, '-')}.pdf`);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
    }
    setIsGeneratingPdf(false);
    setShowLeadForm(false);
  };

  // Load params from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('fleet')) setFleetSize(Number(params.get('fleet')));
    if (params.get('profile')) setUsageProfile(params.get('profile') || 'custom');
    if (params.get('vehicle')) setSelectedVehicleClass(params.get('vehicle') || 'N3');
    if (params.get('mileage')) setAnnualMileage(Number(params.get('mileage')));
    if (params.get('years')) setUsageYears(Number(params.get('years')));
    if (params.get('highway')) setHighwayShare(Number(params.get('highway')));
    if (params.get('depot')) setDepotChargingShare(Number(params.get('depot')));
    if (params.get('diesel')) setDieselPrice(Number(params.get('diesel')));
    if (params.get('electricity')) setElectricityPrice(Number(params.get('electricity')));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-4 right-4 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <Check className="w-5 h-5" />
          Link in Zwischenablage kopiert!
        </div>
      )}

      {/* Lead Form Modal */}
      <LeadFormModal isOpen={showLeadForm} onClose={() => setShowLeadForm(false)} onSubmit={handleGeneratePdf} isGeneratingPdf={isGeneratingPdf} />

      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tMi0xNEgyNnYyaDh2LTJ6bTItMnYtMkgyNHYyaDEyem0wIDEwdi0ySDI0djJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
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
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-medium">Pro</span>
                </h1>
                <p className="text-slate-400 text-sm mt-0.5">Flottenvergleich für Logistikunternehmen</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleShare} className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 transition-all">
                <Share2 className="w-4 h-4" />
                Teilen
              </button>
              <button onClick={() => setShowLeadForm(true)} className="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30">
                <Download className="w-4 h-4" />
                PDF Report
                <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8" ref={reportRef}>
        {/* Fleet Investment Banner */}
        {fleetSize > 1 && (
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-3xl p-6 mb-8 -mt-12 relative z-10 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-white">
                <div className="text-indigo-200 text-sm font-medium">Flotten-Übersicht: {fleetSize} Fahrzeuge</div>
                <div className="text-3xl font-bold mt-1">Gesamt-Investition: {formatCurrency(results.fleet.investment)}</div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-indigo-200 text-xs">Gesamt-Ersparnis</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(results.fleet.savings)}</div>
                </div>
                <div className="text-center">
                  <div className="text-indigo-200 text-xs">ROI</div>
                  <div className="text-2xl font-bold text-emerald-300">{formatPercent(results.roi)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${fleetSize === 1 ? '-mt-16' : ''} relative z-10 mb-8`}>
          <ResultCard label="Gesamtersparnis" value={formatCurrency(results.fleet.savings)} subtext={`in ${usageYears} Jahren`} icon={TrendingDown} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" iconBg="bg-white/20" />
          <ResultCard label="Break-Even" value={results.breakEvenYears < 20 ? `${results.paybackMonths.toFixed(0)} Monate` : 'N/A'} subtext={results.breakEvenYears < 20 ? `${results.breakEvenYears.toFixed(1)} Jahre` : ''} icon={Calculator} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" iconBg="bg-white/20" />
          <ResultCard label="Cost per km" value={`${(results.electric.costPerKm * 100).toFixed(1)} ct`} subtext={`vs. ${(results.diesel.costPerKm * 100).toFixed(1)} ct Diesel`} icon={Route} gradient="bg-gradient-to-br from-violet-500 to-purple-600" iconBg="bg-white/20" />
          <ResultCard label="CO2-Einsparung" value={`${results.co2Savings.toFixed(0)} t`} subtext={`${((results.co2Savings / results.dieselCO2) * 100).toFixed(0)}% weniger`} icon={Leaf} gradient="bg-gradient-to-br from-green-500 to-emerald-600" iconBg="bg-white/20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Fleet Size */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </span>
                Flottengröße
              </h3>
              <InputField label="Anzahl Fahrzeuge" value={fleetSize} onChange={setFleetSize} unit="LKW" icon={Truck} min={1} max={500} />
            </div>

            {/* Usage Profile */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50">
                  <Route className="w-5 h-5 text-slate-600" />
                </span>
                Einsatzprofil
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(USAGE_PROFILES).map(([key, profile]) => (
                  <button
                    key={key}
                    onClick={() => setUsageProfile(key)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${usageProfile === key ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="font-medium text-sm text-slate-800">{profile.name}</div>
                    <div className="text-xs text-slate-500">{profile.description}</div>
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                <InputField label="Jahresfahrleistung" value={annualMileage} onChange={(v: number) => { setAnnualMileage(v); setUsageProfile('custom'); }} unit="km" icon={Gauge} min={10000} max={500000} step={5000} />
                <InputField label="Nutzungsdauer" value={usageYears} onChange={setUsageYears} unit="Jahre" icon={Calendar} min={1} max={15} />
                <SliderField label="Autobahn-Anteil" value={highwayShare} onChange={(v: number) => { setHighwayShare(v); setUsageProfile('custom'); }} icon={Route} info="Mautpflichtige Strecken (Autobahn/Bundesstraße)" />
                <SliderField label="Depot-Laden" value={depotChargingShare} onChange={(v: number) => { setDepotChargingShare(v); setUsageProfile('custom'); }} icon={Battery} info="Anteil Laden am eigenen Depot vs. öffentlich" />
              </div>
            </div>

            {/* Vehicle Class */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50">
                  <Truck className="w-5 h-5 text-slate-600" />
                </span>
                Fahrzeugklasse
              </h3>
              <div className="space-y-3">
                {Object.entries(VEHICLE_DATA).map(([key, data]) => (
                  <VehicleButton key={key} id={key} name={data.name} specs={data.specs} selected={selectedVehicleClass === key} onClick={() => setSelectedVehicleClass(key)} />
                ))}
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
              <div className="space-y-4">
                <InputField label="Diesel (netto)" value={dieselPrice} onChange={setDieselPrice} unit="€/L" icon={Fuel} min={1} max={3} step={0.05} info="Durchschnittlicher Gewerbe-Dieselpreis" />
                <InputField label="Strom Depot" value={electricityPrice} onChange={setElectricityPrice} unit="€/kWh" icon={Zap} min={0.1} max={0.6} step={0.01} info="Ihr Strompreis für Depot-Laden" />
              </div>
            </div>

            {/* Infrastructure */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50">
                  <Plug className="w-5 h-5 text-amber-600" />
                </span>
                Ladeinfrastruktur
              </h3>
              <div className="space-y-4">
                <Toggle label="Infrastruktur einrechnen" checked={includeInfrastructure} onChange={setIncludeInfrastructure} icon={Building2} />
                {includeInfrastructure && (
                  <>
                    <InputField label="Anzahl Ladepunkte" value={chargingPoints} onChange={setChargingPoints} unit="Stk." icon={Plug} min={1} max={100} info={`Empfohlen: ${Math.ceil(fleetSize * 0.3)} für ${fleetSize} Fahrzeuge`} />
                    <Toggle label="DC-Schnelllader (50 kW+)" checked={dcCharging} onChange={setDcCharging} icon={Zap} />
                    <Toggle label="Netzanschluss-Upgrade" checked={gridUpgrade} onChange={setGridUpgrade} icon={Building2} />
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                      <div className="text-sm font-medium text-amber-800">Infrastruktur-Kosten</div>
                      <div className="text-2xl font-bold text-amber-900">{formatCurrency(results.infrastructure.cost)}</div>
                      <div className="text-xs text-amber-600 mt-1">{formatCurrency(results.infrastructure.perVehicle)} pro Fahrzeug</div>
                    </div>
                  </>
                )}
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
                    { text: 'Sonder-AfA: 75% im 1. Jahr', source: 'Wachstumschancengesetz 2024' },
                    { text: 'Mautbefreiung bis 2031', source: 'BFStrMG §1' },
                    { text: `THG-Quote: ${formatCurrency(VEHICLE_DATA[selectedVehicleClass as keyof typeof VEHICLE_DATA].thgQuote)}/Jahr`, source: 'THG-Quotenhandel 2025' },
                    { text: 'KFZ-Steuer befreit bis 2030', source: 'KraftStG §3d' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm group relative">
                      <CheckCircle2 className="w-4 h-4 text-emerald-200 flex-shrink-0" />
                      <span className="text-white/90">{item.text}</span>
                      <span className="absolute left-0 -bottom-6 bg-white text-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Quelle: {item.source}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Regulatory Timeline */}
            <RegulatoryTimeline usageYears={usageYears} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Chart */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                </span>
                Kostenentwicklung {fleetSize > 1 && `(${fleetSize} Fahrzeuge)`}
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={amortizationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dieselGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="electricGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k €`} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '12px 16px' }} />
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
                    Break-Even nach <strong>{results.paybackMonths.toFixed(0)} Monaten</strong> - danach sparen Sie <strong>{formatCurrency(results.annualSavings * fleetSize)}</strong> jährlich
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
                Jährliche Betriebskosten (pro Fahrzeug)
              </h3>
              <div className="space-y-6">
                <CostBar label="Energiekosten" dieselValue={results.diesel.energy} electricValue={results.electric.energy} maxValue={Math.max(results.diesel.energy, results.electric.energy) * 1.1} source={`Diesel: ${VEHICLE_DATA[selectedVehicleClass as keyof typeof VEHICLE_DATA].dieselConsumption} L/100km, E-LKW: ${VEHICLE_DATA[selectedVehicleClass as keyof typeof VEHICLE_DATA].electricConsumption} kWh/100km`} />
                <CostBar label="Mautgebühren" dieselValue={results.diesel.toll} electricValue={results.electric.toll} maxValue={results.diesel.toll * 1.1 || 1} source="Mautsatz: 0,348 €/km (BAG 2025)" />
                <CostBar label="Wartung & Verschleiß" dieselValue={results.diesel.maintenance} electricValue={results.electric.maintenance} maxValue={Math.max(results.diesel.maintenance, results.electric.maintenance) * 1.1} source="Branchendurchschnitt für Nutzfahrzeuge" />
              </div>

              {/* THG Quote */}
              <div className="mt-6 relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-emerald-500 to-teal-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-center justify-between flex-wrap gap-4">
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
                    +{formatCurrency(Math.abs(results.electric.thgQuote) * fleetSize)}<span className="text-lg font-medium text-emerald-100">/Jahr</span>
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
                      <span className="text-amber-700">Anschaffung ({fleetSize}x)</span>
                      <span className="font-semibold text-amber-900">{formatCurrency(results.diesel.purchase * fleetSize)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-700">Betrieb ({usageYears} Jahre)</span>
                      <span className="font-semibold text-amber-900">{formatCurrency(results.diesel.annualTotal * usageYears * fleetSize)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-700">Cost per km</span>
                      <span className="font-semibold text-amber-900">{(results.diesel.costPerKm * 100).toFixed(1)} ct</span>
                    </div>
                    <div className="border-t-2 border-amber-200 pt-3 mt-3 flex justify-between items-end">
                      <span className="font-bold text-amber-900">Gesamt TCO</span>
                      <span className="text-2xl font-bold text-amber-900">{formatCurrency(results.fleet.dieselTCO)}</span>
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
                      <span className="text-blue-700">Anschaffung ({fleetSize}x, netto)</span>
                      <span className="font-semibold text-blue-900">{formatCurrency(results.electric.netPurchase * fleetSize)}</span>
                    </div>
                    {includeInfrastructure && (
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Infrastruktur</span>
                        <span className="font-semibold text-blue-900">{formatCurrency(results.infrastructure.cost)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Betrieb ({usageYears} Jahre)</span>
                      <span className="font-semibold text-blue-900">{formatCurrency(results.electric.annualTotal * usageYears * fleetSize)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Cost per km</span>
                      <span className="font-semibold text-blue-900">{(results.electric.costPerKm * 100).toFixed(1)} ct</span>
                    </div>
                    <div className="border-t-2 border-blue-200 pt-3 mt-3 flex justify-between items-end">
                      <span className="font-bold text-blue-900">Gesamt TCO</span>
                      <span className="text-2xl font-bold text-blue-900">{formatCurrency(results.fleet.electricTCO)}</span>
                    </div>
                  </div>
                  {/* Savings Badge */}
                  <div className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-3 text-center shadow-lg shadow-emerald-500/30">
                    <div className="text-emerald-100 text-xs font-medium">Ihre Ersparnis</div>
                    <div className="text-xl font-bold text-white">{formatCurrency(results.fleet.savings)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tMi0xNEgyNnYyaDh2LTJ6bTItMnYtMkgyNHYyaDEyem0wIDEwdi0ySDI0djJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex items-center justify-between flex-wrap gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Bereit für den Umstieg?</h3>
                  <p className="text-slate-400 max-w-md">
                    Laden Sie den detaillierten TCO-Report herunter oder lassen Sie sich von unseren Experten beraten.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowLeadForm(true)} className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition-all hover:scale-105">
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
          <p className="text-xs text-slate-400 mt-2">
            Quellen: BAG, BMWK, KBA, THG-Quotenhandel · Verbrauchswerte nach VECTO
          </p>
        </div>
      </footer>
    </div>
  );
}
