import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, Truck, Route, Fuel, Zap, Plug, Building2, Gauge, Calendar, Battery, Euro, TrendingDown, Leaf, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PageWrapper } from '../components/layout';
import { InputField, SliderField, Toggle, ResultCard, CostBar, VehicleButton } from '../components/ui';
import { LeadFormModal, RegulatoryTimeline, Recommendations } from '../components/shared';
import { AmortizationChart } from '../components/charts';
import { useCalculation, generateShareUrl } from '../hooks/useCalculation';
import { formatCurrency, formatPercent } from '../lib/calculations';
import { USAGE_PROFILES, VEHICLE_DATA } from '../lib/constants';
import type { LeadFormData, UsageProfileType, VehicleClass } from '../types';

export function Calculator() {
  const { inputs, results, amortizationData, recommendations, setInput, applyProfile } = useCalculation();
  const reportRef = useRef<HTMLDivElement>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = () => {
    const url = generateShareUrl(inputs);
    navigator.clipboard.writeText(url);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const handleGeneratePdf = async (formData: LeadFormData) => {
    setIsGeneratingPdf(true);
    try {
      console.log('Lead data:', formData);

      if (reportRef.current) {
        const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.setFillColor(16, 24, 39);
        pdf.rect(0, 0, 210, 30, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.text('E-Truck TCO-Report', 15, 18);
        pdf.setFontSize(10);
        pdf.text(`Erstellt für: ${formData.company}`, 15, 25);
        pdf.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 150, 25);

        pdf.addImage(imgData, 'PNG', 0, 35, imgWidth, imgHeight);

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

  return (
    <PageWrapper
      title="TCO-Rechner"
      subtitle="Detaillierte Berechnung der Gesamtbetriebskosten"
      actions={
        <>
          <button
            onClick={handleShare}
            className="bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 flex items-center gap-2 transition-all"
          >
            <Share2 className="w-4 h-4" />
            Teilen
          </button>
          <button
            onClick={() => setShowLeadForm(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30"
          >
            <Download className="w-4 h-4" />
            PDF Report
          </button>
        </>
      }
    >
      {/* Toast */}
      {showShareToast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50"
        >
          <CheckCircle2 className="w-5 h-5" />
          Link in Zwischenablage kopiert!
        </motion.div>
      )}

      {/* Lead Form */}
      <LeadFormModal
        isOpen={showLeadForm}
        onClose={() => setShowLeadForm(false)}
        onSubmit={handleGeneratePdf}
        isGeneratingPdf={isGeneratingPdf}
      />

      <div ref={reportRef}>
        {/* Fleet Investment Banner */}
        {inputs.fleetSize > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-3xl p-6 mb-8 shadow-xl"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-white">
                <div className="text-indigo-200 text-sm font-medium">
                  Flotten-Übersicht: {inputs.fleetSize} Fahrzeuge
                </div>
                <div className="text-3xl font-bold mt-1">
                  Gesamt-Investition: {formatCurrency(results.fleet.investment)}
                </div>
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
          </motion.div>
        )}

        {/* Key Metrics */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${inputs.fleetSize === 1 ? '' : ''} mb-8`}>
          <ResultCard
            label="Gesamtersparnis"
            value={formatCurrency(results.fleet.savings)}
            subtext={`in ${inputs.usageYears} Jahren`}
            icon={TrendingDown}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            iconBg="bg-white/20"
          />
          <ResultCard
            label="Break-Even"
            value={results.breakEvenYears < 20 ? `${results.paybackMonths.toFixed(0)} Monate` : 'N/A'}
            subtext={results.breakEvenYears < 20 ? `${results.breakEvenYears.toFixed(1)} Jahre` : ''}
            icon={Gauge}
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            iconBg="bg-white/20"
          />
          <ResultCard
            label="Cost per km"
            value={`${(results.electric.costPerKm * 100).toFixed(1)} ct`}
            subtext={`vs. ${(results.diesel.costPerKm * 100).toFixed(1)} ct Diesel`}
            icon={Route}
            gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            iconBg="bg-white/20"
          />
          <ResultCard
            label="CO2-Einsparung"
            value={`${results.co2Savings.toFixed(0)} t`}
            subtext={`${((results.co2Savings / results.dieselCO2) * 100).toFixed(0)}% weniger`}
            icon={Leaf}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
            iconBg="bg-white/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-4 space-y-6">
            {/* Fleet Size */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </span>
                Flottengröße
              </h3>
              <InputField
                label="Anzahl Fahrzeuge"
                value={inputs.fleetSize}
                onChange={(v) => setInput('fleetSize', v)}
                unit="LKW"
                icon={Truck}
                min={1}
                max={500}
              />
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
                    onClick={() => applyProfile(key as UsageProfileType)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      inputs.usageProfile === key
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-medium text-sm text-slate-800">{profile.name}</div>
                    <div className="text-xs text-slate-500">{profile.description}</div>
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                <InputField
                  label="Jahresfahrleistung"
                  value={inputs.annualMileage}
                  onChange={(v) => {
                    setInput('annualMileage', v);
                    setInput('usageProfile', 'custom');
                  }}
                  unit="km"
                  icon={Gauge}
                  min={10000}
                  max={500000}
                  step={5000}
                />
                <InputField
                  label="Nutzungsdauer"
                  value={inputs.usageYears}
                  onChange={(v) => setInput('usageYears', v)}
                  unit="Jahre"
                  icon={Calendar}
                  min={1}
                  max={15}
                />
                <SliderField
                  label="Autobahn-Anteil"
                  value={inputs.highwayShare}
                  onChange={(v) => {
                    setInput('highwayShare', v);
                    setInput('usageProfile', 'custom');
                  }}
                  icon={Route}
                  info="Mautpflichtige Strecken (Autobahn/Bundesstraße)"
                />
                <SliderField
                  label="Depot-Laden"
                  value={inputs.depotChargingShare}
                  onChange={(v) => {
                    setInput('depotChargingShare', v);
                    setInput('usageProfile', 'custom');
                  }}
                  icon={Battery}
                  info="Anteil Laden am eigenen Depot vs. öffentlich"
                />
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
                  <VehicleButton
                    key={key}
                    id={key}
                    name={data.name}
                    specs={data.specs}
                    selected={inputs.selectedVehicleClass === key}
                    onClick={() => setInput('selectedVehicleClass', key as VehicleClass)}
                  />
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
                <InputField
                  label="Diesel (netto)"
                  value={inputs.dieselPrice}
                  onChange={(v) => setInput('dieselPrice', v)}
                  unit="€/L"
                  icon={Fuel}
                  min={1}
                  max={3}
                  step={0.05}
                  info="Durchschnittlicher Gewerbe-Dieselpreis"
                />
                <InputField
                  label="Strom Depot"
                  value={inputs.electricityPrice}
                  onChange={(v) => setInput('electricityPrice', v)}
                  unit="€/kWh"
                  icon={Zap}
                  min={0.1}
                  max={0.6}
                  step={0.01}
                  info="Ihr Strompreis für Depot-Laden"
                />
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
                <Toggle
                  label="Infrastruktur einrechnen"
                  checked={inputs.includeInfrastructure}
                  onChange={(v) => setInput('includeInfrastructure', v)}
                  icon={Building2}
                />
                {inputs.includeInfrastructure && (
                  <>
                    <InputField
                      label="Anzahl Ladepunkte"
                      value={inputs.chargingPoints}
                      onChange={(v) => setInput('chargingPoints', v)}
                      unit="Stk."
                      icon={Plug}
                      min={1}
                      max={100}
                      info={`Empfohlen: ${Math.ceil(inputs.fleetSize * 0.3)} für ${inputs.fleetSize} Fahrzeuge`}
                    />
                    <Toggle
                      label="DC-Schnelllader (50 kW+)"
                      checked={inputs.dcCharging}
                      onChange={(v) => setInput('dcCharging', v)}
                      icon={Zap}
                    />
                    <Toggle
                      label="Netzanschluss-Upgrade"
                      checked={inputs.gridUpgrade}
                      onChange={(v) => setInput('gridUpgrade', v)}
                      icon={Building2}
                    />
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                      <div className="text-sm font-medium text-amber-800">Infrastruktur-Kosten</div>
                      <div className="text-2xl font-bold text-amber-900">
                        {formatCurrency(results.infrastructure.cost)}
                      </div>
                      <div className="text-xs text-amber-600 mt-1">
                        {formatCurrency(results.infrastructure.perVehicle)} pro Fahrzeug
                      </div>
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
                    {
                      text: `THG-Quote: ${formatCurrency(VEHICLE_DATA[inputs.selectedVehicleClass].thgQuote)}/Jahr`,
                      source: 'THG-Quotenhandel 2025',
                    },
                    { text: 'KFZ-Steuer befreit bis 2030', source: 'KraftStG §3d' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm group relative">
                      <CheckCircle2 className="w-4 h-4 text-emerald-200 flex-shrink-0" />
                      <span className="text-white/90">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Regulatory Timeline */}
            <RegulatoryTimeline usageYears={inputs.usageYears} />

            {/* Recommendations */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
              <Recommendations recommendations={recommendations} />
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
                Kostenentwicklung {inputs.fleetSize > 1 && `(${inputs.fleetSize} Fahrzeuge)`}
              </h3>
              <AmortizationChart data={amortizationData} />
              {results.breakEvenYears > 0 && results.breakEvenYears < inputs.usageYears && (
                <div className="mt-4 flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <TrendingDown className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-emerald-800 font-medium">
                    Break-Even nach <strong>{results.paybackMonths.toFixed(0)} Monaten</strong> - danach sparen Sie{' '}
                    <strong>{formatCurrency(results.annualSavings * inputs.fleetSize)}</strong> jährlich
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
                <CostBar
                  label="Energiekosten"
                  dieselValue={results.diesel.energy}
                  electricValue={results.electric.energy}
                  maxValue={Math.max(results.diesel.energy, results.electric.energy) * 1.1}
                  source={`Diesel: ${VEHICLE_DATA[inputs.selectedVehicleClass].dieselConsumption} L/100km, E-LKW: ${VEHICLE_DATA[inputs.selectedVehicleClass].electricConsumption} kWh/100km`}
                />
                <CostBar
                  label="Mautgebühren"
                  dieselValue={results.diesel.toll}
                  electricValue={results.electric.toll}
                  maxValue={results.diesel.toll * 1.1 || 1}
                  source="Mautsatz: 0,348 €/km (BAG 2025)"
                />
                <CostBar
                  label="Wartung & Verschleiß"
                  dieselValue={results.diesel.maintenance}
                  electricValue={results.electric.maintenance}
                  maxValue={Math.max(results.diesel.maintenance, results.electric.maintenance) * 1.1}
                  source="Branchendurchschnitt für Nutzfahrzeuge"
                />
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
                    +{formatCurrency(Math.abs(results.electric.thgQuote) * inputs.fleetSize)}
                    <span className="text-lg font-medium text-emerald-100">/Jahr</span>
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
                      <span className="text-amber-700">Anschaffung ({inputs.fleetSize}x)</span>
                      <span className="font-semibold text-amber-900">
                        {formatCurrency(results.diesel.purchase * inputs.fleetSize)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-700">Betrieb ({inputs.usageYears} Jahre)</span>
                      <span className="font-semibold text-amber-900">
                        {formatCurrency(results.diesel.annualTotal * inputs.usageYears * inputs.fleetSize)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-700">Cost per km</span>
                      <span className="font-semibold text-amber-900">
                        {(results.diesel.costPerKm * 100).toFixed(1)} ct
                      </span>
                    </div>
                    <div className="border-t-2 border-amber-200 pt-3 mt-3 flex justify-between items-end">
                      <span className="font-bold text-amber-900">Gesamt TCO</span>
                      <span className="text-2xl font-bold text-amber-900">
                        {formatCurrency(results.fleet.dieselTCO)}
                      </span>
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
                      <span className="text-blue-700">Anschaffung ({inputs.fleetSize}x, netto)</span>
                      <span className="font-semibold text-blue-900">
                        {formatCurrency(results.electric.netPurchase * inputs.fleetSize)}
                      </span>
                    </div>
                    {inputs.includeInfrastructure && (
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Infrastruktur</span>
                        <span className="font-semibold text-blue-900">
                          {formatCurrency(results.infrastructure.cost)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Betrieb ({inputs.usageYears} Jahre)</span>
                      <span className="font-semibold text-blue-900">
                        {formatCurrency(results.electric.annualTotal * inputs.usageYears * inputs.fleetSize)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Cost per km</span>
                      <span className="font-semibold text-blue-900">
                        {(results.electric.costPerKm * 100).toFixed(1)} ct
                      </span>
                    </div>
                    <div className="border-t-2 border-blue-200 pt-3 mt-3 flex justify-between items-end">
                      <span className="font-bold text-blue-900">Gesamt TCO</span>
                      <span className="text-2xl font-bold text-blue-900">
                        {formatCurrency(results.fleet.electricTCO)}
                      </span>
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
                  <button
                    onClick={() => setShowLeadForm(true)}
                    className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition-all hover:scale-105"
                  >
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
      </div>
    </PageWrapper>
  );
}
