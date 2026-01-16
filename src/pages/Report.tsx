import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Share2, Mail, CheckCircle2, Copy, Printer, ExternalLink } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PageWrapper } from '../components/layout';
import { LeadFormModal } from '../components/shared';
import { useCalculation, generateShareUrl } from '../hooks/useCalculation';
import { formatCurrency, formatPercent } from '../lib/calculations';
import { VEHICLE_DATA, USAGE_PROFILES } from '../lib/constants';
import type { LeadFormData } from '../types';

export function Report() {
  const { inputs, results } = useCalculation();
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const shareUrl = generateShareUrl(inputs);

  const handleCopy = (text: string, item: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleShare = () => {
    handleCopy(shareUrl, 'url');
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const handleGeneratePdf = async (formData: LeadFormData) => {
    setIsGeneratingPdf(true);
    try {
      console.log('Lead data:', formData);

      const pdf = new jsPDF('p', 'mm', 'a4');

      // Header
      pdf.setFillColor(16, 24, 39);
      pdf.rect(0, 0, 210, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text('E-Truck TCO-Report', 15, 22);
      pdf.setFontSize(12);
      pdf.text(`Erstellt für: ${formData.company}`, 15, 32);
      pdf.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 140, 32);

      // Summary Section
      let y = 55;
      pdf.setTextColor(30, 41, 59);
      pdf.setFontSize(16);
      pdf.text('Zusammenfassung', 15, y);
      y += 10;

      pdf.setFontSize(11);
      pdf.setTextColor(71, 85, 105);

      const summaryItems = [
        ['Flottengröße', `${inputs.fleetSize} Fahrzeuge`],
        ['Fahrzeugklasse', VEHICLE_DATA[inputs.selectedVehicleClass].name],
        ['Einsatzprofil', USAGE_PROFILES[inputs.usageProfile].name],
        ['Jahresfahrleistung', `${inputs.annualMileage.toLocaleString('de-DE')} km`],
        ['Nutzungsdauer', `${inputs.usageYears} Jahre`],
      ];

      summaryItems.forEach(([label, value]) => {
        pdf.text(label + ':', 15, y);
        pdf.setTextColor(30, 41, 59);
        pdf.text(value, 80, y);
        pdf.setTextColor(71, 85, 105);
        y += 7;
      });

      // TCO Comparison
      y += 10;
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.text('TCO-Vergleich', 15, y);
      y += 10;

      pdf.setFontSize(11);
      const comparisonItems = [
        ['TCO Diesel', formatCurrency(results.fleet.dieselTCO)],
        ['TCO E-LKW', formatCurrency(results.fleet.electricTCO)],
        ['Gesamtersparnis', formatCurrency(results.fleet.savings)],
        ['Break-Even', `${results.paybackMonths.toFixed(0)} Monate`],
        ['ROI', formatPercent(results.roi)],
        ['CO2-Einsparung', `${results.co2Savings.toFixed(0)} Tonnen`],
      ];

      comparisonItems.forEach(([label, value]) => {
        pdf.setTextColor(71, 85, 105);
        pdf.text(label + ':', 15, y);
        pdf.setTextColor(16, 185, 129);
        if (label === 'TCO Diesel') pdf.setTextColor(245, 158, 11);
        if (label === 'TCO E-LKW') pdf.setTextColor(59, 130, 246);
        pdf.text(value, 80, y);
        y += 7;
      });

      // Investment
      y += 10;
      pdf.setFontSize(16);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Investition', 15, y);
      y += 10;

      pdf.setFontSize(11);
      const investmentItems = [
        ['Gesamtinvestition E-LKW', formatCurrency(results.fleet.investment)],
        ['Jährliche Ersparnis', formatCurrency(results.annualSavings * inputs.fleetSize)],
      ];

      if (inputs.includeInfrastructure) {
        investmentItems.push(['Infrastrukturkosten', formatCurrency(results.infrastructure.cost)]);
      }

      investmentItems.forEach(([label, value]) => {
        pdf.setTextColor(71, 85, 105);
        pdf.text(label + ':', 15, y);
        pdf.setTextColor(30, 41, 59);
        pdf.text(value, 80, y);
        y += 7;
      });

      // Footer
      const pageHeight = pdf.internal.pageSize.height;
      pdf.setFillColor(241, 245, 249);
      pdf.rect(0, pageHeight - 20, 210, 20, 'F');
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(9);
      pdf.text('Alle Angaben ohne Gewähr. Datenstand: Januar 2026', 15, pageHeight - 10);
      pdf.text('Quellen: BAG, BMWK, KBA, THG-Quotenhandel', 15, pageHeight - 5);

      pdf.save(`TCO-Report-${formData.company.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
    }
    setIsGeneratingPdf(false);
    setShowLeadForm(false);
  };

  // Generate summary text for email/sharing
  const summaryText = `E-Truck TCO-Report

Flotte: ${inputs.fleetSize}x ${VEHICLE_DATA[inputs.selectedVehicleClass].name}
Nutzung: ${inputs.annualMileage.toLocaleString('de-DE')} km/Jahr über ${inputs.usageYears} Jahre

Ergebnis:
- Gesamtersparnis: ${formatCurrency(results.fleet.savings)}
- Break-Even: ${results.paybackMonths.toFixed(0)} Monate
- ROI: ${formatPercent(results.roi)}
- CO2-Einsparung: ${results.co2Savings.toFixed(0)} Tonnen

Link zur Berechnung: ${shareUrl}`;

  return (
    <PageWrapper
      title="Report-Center"
      subtitle="Exportieren und teilen Sie Ihre Berechnungen"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Preview */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
          >
            {/* Report Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8">
              <h2 className="text-2xl font-bold text-white mb-2">E-Truck TCO-Report</h2>
              <p className="text-slate-400">
                Generiert am {new Date().toLocaleDateString('de-DE')}
              </p>
            </div>

            {/* Report Content */}
            <div className="p-8 space-y-8">
              {/* Summary */}
              <div>
                <h3 className="font-bold text-slate-800 mb-4">Zusammenfassung</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-sm text-slate-500">Flottengröße</div>
                    <div className="font-bold text-slate-800">{inputs.fleetSize} Fahrzeuge</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-sm text-slate-500">Fahrzeugklasse</div>
                    <div className="font-bold text-slate-800">{VEHICLE_DATA[inputs.selectedVehicleClass].name}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-sm text-slate-500">Jahresfahrleistung</div>
                    <div className="font-bold text-slate-800">{inputs.annualMileage.toLocaleString('de-DE')} km</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-sm text-slate-500">Nutzungsdauer</div>
                    <div className="font-bold text-slate-800">{inputs.usageYears} Jahre</div>
                  </div>
                </div>
              </div>

              {/* TCO Comparison */}
              <div>
                <h3 className="font-bold text-slate-800 mb-4">TCO-Vergleich</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600">TCO Diesel-Flotte</span>
                    <span className="font-bold text-amber-600 text-lg">{formatCurrency(results.fleet.dieselTCO)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600">TCO E-LKW-Flotte</span>
                    <span className="font-bold text-blue-600 text-lg">{formatCurrency(results.fleet.electricTCO)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-emerald-50 -mx-4 px-4 rounded-xl">
                    <span className="font-semibold text-emerald-700">Gesamtersparnis</span>
                    <span className="font-bold text-emerald-600 text-xl">{formatCurrency(results.fleet.savings)}</span>
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div>
                <h3 className="font-bold text-slate-800 mb-4">Kennzahlen</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{results.paybackMonths.toFixed(0)}</div>
                    <div className="text-sm text-blue-600">Monate Break-Even</div>
                  </div>
                  <div className="text-center p-4 bg-violet-50 rounded-xl">
                    <div className="text-2xl font-bold text-violet-600">{formatPercent(results.roi)}</div>
                    <div className="text-sm text-violet-600">ROI</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{results.co2Savings.toFixed(0)} t</div>
                    <div className="text-sm text-green-600">CO2-Einsparung</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Footer */}
            <div className="bg-slate-50 p-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                Alle Angaben ohne Gewähr. Datenstand: Januar 2026. Quellen: BAG, BMWK, KBA, THG-Quotenhandel.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Export Options */}
        <div className="space-y-6">
          {/* PDF Download */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6"
          >
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              PDF Export
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Laden Sie einen professionellen PDF-Report mit allen Details herunter.
            </p>
            <button
              onClick={() => setShowLeadForm(true)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
            >
              <Download className="w-5 h-5" />
              PDF herunterladen
            </button>
          </motion.div>

          {/* Share Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6"
          >
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-slate-500" />
              Link teilen
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Teilen Sie diese Berechnung mit Kollegen.
            </p>
            <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-slate-600 outline-none truncate"
              />
              <button
                onClick={handleShare}
                className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors flex-shrink-0"
              >
                {copiedItem === 'url' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-600" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Email Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6"
          >
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-slate-500" />
              Per E-Mail senden
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Kopieren Sie die Zusammenfassung für eine E-Mail.
            </p>
            <button
              onClick={() => handleCopy(summaryText, 'email')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {copiedItem === 'email' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Kopiert!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Zusammenfassung kopieren
                </>
              )}
            </button>
          </motion.div>

          {/* Print */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6"
          >
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Printer className="w-5 h-5 text-slate-500" />
              Drucken
            </h3>
            <button
              onClick={() => window.print()}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Seite drucken
            </button>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
