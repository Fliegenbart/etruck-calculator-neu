import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout';
import { CalculationProvider } from './hooks/useCalculation';
import { Dashboard, Calculator, Scenarios, Sensitivity, Report } from './pages';

export default function App() {
  return (
    <CalculationProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/sensitivity" element={<Sensitivity />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </div>
    </CalculationProvider>
  );
}
