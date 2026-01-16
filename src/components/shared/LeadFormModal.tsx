import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, User, Building, Mail, Phone } from 'lucide-react';
import type { LeadFormData } from '../../types';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeadFormData) => void;
  isGeneratingPdf: boolean;
}

export function LeadFormModal({ isOpen, onClose, onSubmit, isGeneratingPdf }: LeadFormModalProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    fleetSize: '',
    timeline: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-emerald-100 rounded-2xl mb-4">
                  <Download className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">TCO-Report herunterladen</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Erhalten Sie Ihren detaillierten Bericht als PDF
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
                        placeholder="Max Mustermann"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">Firma *</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
                        placeholder="Spedition GmbH"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">E-Mail *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
                      placeholder="max@firma.de"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">Telefon</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
                        placeholder="+49 123 456789"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">Flottengröße</label>
                    <select
                      value={formData.fleetSize}
                      onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
                    >
                      <option value="">Auswählen</option>
                      <option value="1-5">1-5 Fahrzeuge</option>
                      <option value="6-20">6-20 Fahrzeuge</option>
                      <option value="21-50">21-50 Fahrzeuge</option>
                      <option value="50+">50+ Fahrzeuge</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingPdf}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
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

              <p className="text-xs text-slate-400 text-center mt-4">
                Ihre Daten werden vertraulich behandelt und nicht an Dritte weitergegeben.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
