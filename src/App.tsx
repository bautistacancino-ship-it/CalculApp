/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logo from '../public/logoapp.jpg';
import { 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Zap, 
  Globe, 
  PlusCircle,
  CheckCircle2,
  Settings2,
  Info,
  X
} from 'lucide-react';
import { BudgetState, CalculationResult } from './types';
import { SERVICE_TYPES, DEFAULT_HOURLY_RATE, EXPERIENCE_MULTIPLIERS } from './constants';
import { calculateBudget } from './lib/calculator';

const HELP_TEXT = {
  serviceType: "Selecciona la categoría principal del proyecto para categorizar el presupuesto.",
  estimatedHours: "Calcula el tiempo total de ejecución, incluyendo investigación, bocetos y diseño final.",
  hourlyRate: "Tu valor por hora de trabajo. Puedes calcularlo detalladamente en el primer paso basándote en tus gastos y sueldo deseado.",
  urgency: "Normal (entrega estándar), Rápido (+50% costo), Urgente (+100% costo).",
  revisions: "Número de rondas de cambios incluidas antes de cobrar extras.",
  sourceFiles: "Si el cliente requiere los archivos editables (.ai, .psd, .fig), se aplica un recargo del 50%.",
  clientSize: "El valor del diseño aumenta según el impacto comercial y la responsabilidad legal.",
  geographicScope: "Define dónde se utilizará el diseño (Local, Nacional o Internacional).",
  stock: "Presupuesto para compra de fotografías, videos o ilustraciones de stock.",
  fonts: "Costo de licencias tipográficas específicas para el proyecto.",
  externalProviders: "Gastos de impresión, hosting, fotografía externa u otros colaboradores.",
  desiredSalary: "El sueldo neto que aspiras ganar mensualmente después de impuestos.",
  monthlyExpenses: "Suma de arriendo, software (Adobe, Figma), internet, hardware y otros gastos fijos.",
  workingDays: "Días que realmente trabajas al mes (ej: 20 días si descansas fines de semana).",
  hoursPerDay: "Horas totales que dedicas al trabajo cada día.",
  productivityFactor: "Porcentaje de tus horas que son realmente facturables (reuniones, administración y descansos no se cobran).",
  experienceLevel: "Tu nivel de experiencia influye en el valor de mercado de tu trabajo (Estudiante: -30%, Junior: Base, Senior: +50%)."
};

function InfoTooltip({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block ml-1.5 align-middle">
      <button 
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-brand-500 transition-colors p-0.5"
      >
        <Info className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl pointer-events-none"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const INITIAL_STATE: BudgetState = {
  hourlyRateCalc: {
    desiredSalary: 1200000,
    monthlyExpenses: 300000,
    workingDays: 20,
    hoursPerDay: 8,
    productivityFactor: 0.7,
    experienceLevel: 'junior',
  },
  project: {
    serviceType: SERVICE_TYPES[0],
    estimatedHours: 10,
    hourlyRate: DEFAULT_HOURLY_RATE,
  },
  complexity: {
    urgency: 'normal',
    revisions: 2,
    includeSourceFiles: false,
  },
  impact: {
    clientSize: 'micro',
    geographicScope: 'local',
    licenseDuration: '1year',
  },
  extras: {
    stock: 0,
    fonts: 0,
    externalProviders: 0,
  },
};

export default function App() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<BudgetState>(INITIAL_STATE);
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Load preferences
  useEffect(() => {
    const savedRate = localStorage.getItem('design_calc_hourly_rate');
    if (savedRate) {
      setState(prev => ({
        ...prev,
        project: { ...prev.project, hourlyRate: parseFloat(savedRate) }
      }));
    }
  }, []);

  // Recalculate whenever state changes
  useEffect(() => {
    setResult(calculateBudget(state));
  }, [state]);

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const calculateDetailedHourlyRate = () => {
    const { desiredSalary, monthlyExpenses, workingDays, hoursPerDay, productivityFactor } = state.hourlyRateCalc;
    const totalMonthlyNeeded = desiredSalary + monthlyExpenses;
    const totalHoursPerMonth = workingDays * hoursPerDay;
    const billableHours = totalHoursPerMonth * productivityFactor;
    
    if (billableHours === 0) return 0;
    return Math.round(totalMonthlyNeeded / billableHours);
  };

  const updateHourlyRateFromCalc = () => {
    const newRate = calculateDetailedHourlyRate();
    setState(prev => ({
      ...prev,
      project: { ...prev.project, hourlyRate: newRate }
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-brand-600 mb-2">
              <Settings2 className="w-5 h-5" />
              <h2 className="text-xl">Cálculo de Tarifa Base</h2>
            </div>
            
            <div className="bg-brand-50 p-4 rounded-2xl border border-brand-100 mb-6">
              <p className="text-sm text-brand-800 font-medium">
                Tu tarifa actual calculada: <span className="text-lg font-bold">${calculateDetailedHourlyRate().toLocaleString('es-CL')} / hora</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sueldo Deseado ($)
                  <InfoTooltip text={HELP_TEXT.desiredSalary} />
                </label>
                <input 
                  type="number" 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  value={state.hourlyRateCalc.desiredSalary}
                  onChange={e => setState({ ...state, hourlyRateCalc: { ...state.hourlyRateCalc, desiredSalary: parseFloat(e.target.value) || 0 } })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Gastos Mensuales ($)
                  <InfoTooltip text={HELP_TEXT.monthlyExpenses} />
                </label>
                <input 
                  type="number" 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  value={state.hourlyRateCalc.monthlyExpenses}
                  onChange={e => setState({ ...state, hourlyRateCalc: { ...state.hourlyRateCalc, monthlyExpenses: parseFloat(e.target.value) || 0 } })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Días Laborales / Mes
                  <InfoTooltip text={HELP_TEXT.workingDays} />
                </label>
                <input 
                  type="number" 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  value={state.hourlyRateCalc.workingDays}
                  onChange={e => setState({ ...state, hourlyRateCalc: { ...state.hourlyRateCalc, workingDays: parseInt(e.target.value) || 0 } })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Horas / Día
                  <InfoTooltip text={HELP_TEXT.hoursPerDay} />
                </label>
                <input 
                  type="number" 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  value={state.hourlyRateCalc.hoursPerDay}
                  onChange={e => setState({ ...state, hourlyRateCalc: { ...state.hourlyRateCalc, hoursPerDay: parseInt(e.target.value) || 0 } })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Nivel de Experiencia
                <InfoTooltip text={HELP_TEXT.experienceLevel} />
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'student', label: 'Estudiante', icon: '🎓' },
                  { id: 'junior', label: 'Junior / Inicios', icon: '🌱' },
                  { id: 'senior', label: 'Senior / Experto', icon: '🏆' }
                ].map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => setState({ ...state, hourlyRateCalc: { ...state.hourlyRateCalc, experienceLevel: exp.id as any } })}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      state.hourlyRateCalc.experienceLevel === exp.id 
                        ? 'border-brand-600 bg-brand-50 text-brand-700' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="text-xl mb-1">{exp.icon}</div>
                    <div className="text-[10px] font-bold uppercase tracking-tight">{exp.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                <span>Factor de Productividad <InfoTooltip text={HELP_TEXT.productivityFactor} /></span>
                <span>{Math.round(state.hourlyRateCalc.productivityFactor * 100)}%</span>
              </label>
              <input 
                type="range" 
                min="0.1" 
                max="1" 
                step="0.05"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                value={state.hourlyRateCalc.productivityFactor}
                onChange={e => setState({ ...state, hourlyRateCalc: { ...state.hourlyRateCalc, productivityFactor: parseFloat(e.target.value) } })}
              />
              <p className="text-[10px] text-slate-400 mt-1 italic">Representa el tiempo real que dedicas a diseñar vs tareas administrativas.</p>
            </div>

            <div className="pt-4">
              <button 
                onClick={() => {
                  updateHourlyRateFromCalc();
                  nextStep();
                }}
                className="w-full p-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
              >
                Usar esta Tarifa y Continuar
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-brand-600 mb-2">
              <Clock className="w-5 h-5" />
              <h2 className="text-xl">Datos del Proyecto</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Servicio
                  <InfoTooltip text={HELP_TEXT.serviceType} />
                </label>
                <select 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  value={state.project.serviceType}
                  onChange={e => setState({ ...state, project: { ...state.project, serviceType: e.target.value } })}
                >
                  {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                  <span>Horas Estimadas <InfoTooltip text={HELP_TEXT.estimatedHours} /></span>
                  <span>{state.project.estimatedHours}h</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="200" 
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  value={state.project.estimatedHours}
                  onChange={e => setState({ ...state, project: { ...state.project, estimatedHours: parseInt(e.target.value) } })}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Tarifa por Hora ($ CLP)
                    <InfoTooltip text={HELP_TEXT.hourlyRate} />
                  </label>
                  <button 
                    onClick={() => setStep(1)}
                    className="text-[10px] text-brand-600 font-bold uppercase hover:underline"
                  >
                    Recalcular detallado
                  </button>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    value={state.project.hourlyRate}
                    onChange={e => setState({ ...state, project: { ...state.project, hourlyRate: parseFloat(e.target.value) || 0 } })}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-brand-600 mb-2">
              <Zap className="w-5 h-5" />
              <h2 className="text-xl">Complejidad y Tiempos</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Nivel de Urgencia
                  <InfoTooltip text={HELP_TEXT.urgency} />
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['normal', 'fast', 'urgent'] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => setState({ ...state, complexity: { ...state.complexity, urgency: u } })}
                      className={`p-3 rounded-xl border-2 transition-all text-sm font-medium capitalize ${
                        state.complexity.urgency === u 
                        ? 'border-brand-500 bg-brand-50 text-brand-700' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-500'
                      }`}
                    >
                      {u === 'normal' ? 'Normal' : u === 'fast' ? 'Rápido' : 'Urgente'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Revisiones Incluidas
                  <InfoTooltip text={HELP_TEXT.revisions} />
                </label>
                <input 
                  type="number" 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  value={state.complexity.revisions}
                  onChange={e => setState({ ...state, complexity: { ...state.complexity, revisions: parseInt(e.target.value) || 0 } })}
                />
              </div>

              <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-slate-200">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  checked={state.complexity.includeSourceFiles}
                  onChange={e => setState({ ...state, complexity: { ...state.complexity, includeSourceFiles: e.target.checked } })}
                />
                <div>
                  <span className="block text-sm font-semibold text-slate-800">
                    Entrega de Archivos Fuente
                    <InfoTooltip text={HELP_TEXT.sourceFiles} />
                  </span>
                  <span className="block text-xs text-slate-500">+50% del costo base por cesión de propiedad intelectual.</span>
                </div>
              </label>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-brand-600 mb-2">
              <Globe className="w-5 h-5" />
              <h2 className="text-xl">Impacto y Licencias</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Tamaño del Cliente
                  <InfoTooltip text={HELP_TEXT.clientSize} />
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(['micro', 'pyme', 'corp'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setState({ ...state, impact: { ...state.impact, clientSize: s } })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        state.impact.clientSize === s 
                        ? 'border-brand-500 bg-brand-50' 
                        : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <span className={`block font-bold ${state.impact.clientSize === s ? 'text-brand-700' : 'text-slate-700'}`}>
                        {s === 'micro' ? 'Microempresa / Freelance' : s === 'pyme' ? 'PYME / Startup' : 'Corporación / Gran Empresa'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {s === 'micro' ? 'Impacto limitado, presupuesto ajustado.' : s === 'pyme' ? 'Impacto medio, mayor alcance comercial.' : 'Alto impacto, uso masivo y gran responsabilidad.'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Alcance Geográfico
                  <InfoTooltip text={HELP_TEXT.geographicScope} />
                </label>
                <select 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  value={state.impact.geographicScope}
                  onChange={e => setState({ ...state, impact: { ...state.impact, geographicScope: e.target.value as any } })}
                >
                  <option value="local">Local / Regional</option>
                  <option value="national">Nacional</option>
                  <option value="international">Internacional</option>
                </select>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-brand-600 mb-2">
              <PlusCircle className="w-5 h-5" />
              <h2 className="text-xl">Costos Extra</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Stock (Fotos/Video)
                    <InfoTooltip text={HELP_TEXT.stock} />
                  </label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    value={state.extras.stock}
                    onChange={e => setState({ ...state, extras: { ...state.extras, stock: parseFloat(e.target.value) || 0 } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipografías
                    <InfoTooltip text={HELP_TEXT.fonts} />
                  </label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    value={state.extras.fonts}
                    onChange={e => setState({ ...state, extras: { ...state.extras, fonts: parseFloat(e.target.value) || 0 } })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Proveedores Externos
                  <InfoTooltip text={HELP_TEXT.externalProviders} />
                </label>
                <input 
                  type="number" 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  value={state.extras.externalProviders}
                  onChange={e => setState({ ...state, extras: { ...state.extras, externalProviders: parseFloat(e.target.value) || 0 } })}
                />
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 text-brand-600 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Presupuesto Final</h2>
              <p className="text-slate-500">Desglose detallado para tu cliente</p>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-slate-400 text-sm uppercase tracking-widest font-semibold">Total Estimado</p>
                    <h3 className="text-5xl font-bold text-brand-400 mt-1">
                      ${result?.finalTotal.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">Moneda</p>
                    <p className="font-bold">CLP</p>
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-800 pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Costo Base ({state.project.estimatedHours}h x ${state.project.hourlyRate.toLocaleString('es-CL')})</span>
                    <span>${result?.baseCost.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Gestión de Proyecto (20%)</span>
                    <span>${result?.pmFee.toLocaleString('es-CL')}</span>
                  </div>
                  {result && result.urgencyMultiplier > 1 && (
                    <div className="flex justify-between text-sm text-amber-400">
                      <span>Recargo por Urgencia (x{result.urgencyMultiplier})</span>
                      <span>+${((result.baseCost + result.pmFee) * (result.urgencyMultiplier - 1)).toLocaleString('es-CL')}</span>
                    </div>
                  )}
                  {result && result.usageMultiplier > 1 && (
                    <div className="flex justify-between text-sm text-brand-400">
                      <span>Valor por Impacto (x{result.usageMultiplier})</span>
                      <span>+${((result.baseCost + result.pmFee) * result.urgencyMultiplier * (result.usageMultiplier - 1)).toLocaleString('es-CL')}</span>
                    </div>
                  )}
                  {result && (EXPERIENCE_MULTIPLIERS[state.hourlyRateCalc.experienceLevel] !== 1) && (
                    <div className="flex justify-between text-sm text-indigo-400">
                      <span>Ajuste por Experiencia (x{EXPERIENCE_MULTIPLIERS[state.hourlyRateCalc.experienceLevel]})</span>
                      <span>
                        {EXPERIENCE_MULTIPLIERS[state.hourlyRateCalc.experienceLevel] > 1 ? '+' : '-'}
                        ${Math.abs((result.baseCost + result.pmFee) * result.urgencyMultiplier * result.usageMultiplier * (EXPERIENCE_MULTIPLIERS[state.hourlyRateCalc.experienceLevel] - 1)).toLocaleString('es-CL')}
                      </span>
                    </div>
                  )}
                  {result && result.sourceFilesSurcharge > 0 && (
                    <div className="flex justify-between text-sm text-emerald-400">
                      <span>Cesión de Archivos Fuente</span>
                      <span>+${result.sourceFilesSurcharge.toLocaleString('es-CL')}</span>
                    </div>
                  )}
                  {result && result.extraCostsTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Costos Extra (Stock, Fuentes, etc.)</span>
                      <span>${result.extraCostsTotal.toLocaleString('es-CL')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep(1)}
              className="w-full p-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Nuevo Cálculo
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl shadow-lg shadow-brand-200 overflow-hidden bg-white border border-slate-100">
              <img 
                src={logo} 
                alt="CalculApp.pro Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">CalculApp<span className="text-brand-600">.pro</span></h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">Presupuesto de diseños.</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {step < 6 && (
          <div className="mb-10">
            <div className="flex justify-between mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={`flex flex-col items-center gap-2 transition-all duration-500 ${step >= i ? 'text-brand-600' : 'text-slate-300'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
                    step === i ? 'border-brand-600 bg-brand-600 text-white scale-110 shadow-lg shadow-brand-100' : 
                    step > i ? 'border-brand-600 bg-brand-50 text-brand-600' : 
                    'border-slate-200 bg-white text-slate-300'
                  }`}>
                    {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">
                    {i === 1 ? 'Tarifa' : i === 2 ? 'Proyecto' : i === 3 ? 'Tiempos' : i === 4 ? 'Impacto' : 'Extras'}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-brand-600"
                initial={{ width: '0%' }}
                animate={{ width: `${(step - 1) * 25}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 sm:p-10">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>

          {/* Navigation Footer */}
          {step < 6 && (
            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                  step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Atrás
              </button>
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Subtotal</p>
                  <p className="text-lg font-bold text-slate-900">${result?.finalTotal.toLocaleString('es-CL')}</p>
                </div>
                <button
                  onClick={() => {
                    if (step === 1) updateHourlyRateFromCalc();
                    nextStep();
                  }}
                  className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  {step === 5 ? 'Ver Resultado' : 'Siguiente'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-slate-400 text-sm">
            Diseñado para profesionales creativos. 
          </p>
          <p className="text-xs text-slate-400">
            Creado por: <a href="https://www.instagram.com/bautistacancino/" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600 font-medium transition-colors">@bautistacancino</a>
          </p>
          <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">
            © 2026 CalculApp.pro Studio
          </p>
        </div>
      </div>
    </div>
  );
}
