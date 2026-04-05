/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const LOGO_URL = "https://lh3.googleusercontent.com/d/131Hnqre2rrpTnrQQFijkcq2vvKBSC-fS";

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
  X,
  GraduationCap,
  Sprout,
  Trophy,
  FileText,
  Copy,
  Check,
  Lock,
  ShieldCheck,
  AlertCircle,
  Eye,
  FileCheck,
  Ban,
  Shield
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
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
  retentionYear: 'none',
  proposal: {
    clientName: '',
    companyName: '',
    projectTitle: '',
    projectDescription: '',
    deliveryTime: '',
    paymentMethod: '50/50',
    validity: '15 días',
    clauses: {
      intellectualProperty: true,
      excessRevisions: true,
      inactivityPause: false,
      exhibitionRights: false,
      contentResponsibility: false,
      cancellation: true,
    },
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

  const nextStep = () => setStep(s => Math.min(s + 1, 7));
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
            <div className="text-left mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl mb-4 shadow-sm">
                <Settings2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">1.- Cálculo de Tarifa Base</h2>
              <p className="text-slate-500 text-sm">Define tu valor hora según tus metas y gastos</p>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants} className="bg-brand-50 p-4 rounded-2xl border border-brand-100 mb-6">
                <p className="text-sm text-brand-800 font-medium">
                  Tu tarifa actual calculada: <span className="text-lg font-bold">${calculateDetailedHourlyRate().toLocaleString('es-CL')} / hora</span>
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Nivel de Experiencia
                  <InfoTooltip text={HELP_TEXT.experienceLevel} />
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'student', label: 'Estudiante', icon: GraduationCap },
                    { id: 'junior', label: 'Junior / Inicios', icon: Sprout },
                    { id: 'senior', label: 'Senior / Experto', icon: Trophy }
                  ].map((exp) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={exp.id}
                      onClick={() => setState({ ...state, hourlyRateCalc: { ...state.hourlyRateCalc, experienceLevel: exp.id as any } })}
                      className={`p-3 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center ${
                        state.hourlyRateCalc.experienceLevel === exp.id 
                          ? 'border-brand-600 bg-brand-50 text-brand-700' 
                          : 'border-slate-100 hover:border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className={`mb-1.5 ${state.hourlyRateCalc.experienceLevel === exp.id ? 'text-brand-600' : 'text-slate-400'}`}>
                        <exp.icon className="w-6 h-6" />
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-tight">{exp.label}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
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
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    updateHourlyRateFromCalc();
                    nextStep();
                  }}
                  className="w-full p-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
                >
                  Usar esta Tarifa y Continuar
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </motion.div>
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
            <div className="text-left mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl mb-4 shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">2.- Datos del Proyecto</h2>
              <p className="text-slate-500 text-sm">Categoría y tiempo estimado de ejecución</p>
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
            <div className="text-left mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl mb-4 shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">3.- Complejidad y Tiempos</h2>
              <p className="text-slate-500 text-sm">Urgencia y entregables adicionales</p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Nivel de Urgencia
                  <InfoTooltip text={HELP_TEXT.urgency} />
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['normal', 'fast', 'urgent'] as const).map((u) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={u}
                      onClick={() => setState({ ...state, complexity: { ...state.complexity, urgency: u } })}
                      className={`p-3 rounded-xl border-2 transition-all text-sm font-medium capitalize ${
                        state.complexity.urgency === u 
                        ? 'border-brand-500 bg-brand-50 text-brand-700' 
                        : 'border-slate-100 hover:border-slate-200 text-slate-500'
                      }`}
                    >
                      {u === 'normal' ? 'Normal' : u === 'fast' ? 'Rápido' : 'Urgente'}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
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
              </motion.div>

              <motion.label 
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all border border-slate-200"
              >
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
              </motion.label>
            </motion.div>
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
            <div className="text-left mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl mb-4 shadow-sm">
                <Globe className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">4.- Impacto y Licencias</h2>
              <p className="text-slate-500 text-sm">Alcance y tamaño del cliente</p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Tamaño del Cliente
                  <InfoTooltip text={HELP_TEXT.clientSize} />
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(['micro', 'pyme', 'corp'] as const).map((s) => (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
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
              </motion.div>
            </motion.div>
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
            <div className="text-left mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl mb-4 shadow-sm">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">5.- Costos Extra</h2>
              <p className="text-slate-500 text-sm">Gastos adicionales del proyecto</p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </motion.div>
              <motion.div variants={itemVariants}>
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
              </motion.div>
            </motion.div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-left mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 text-brand-600 rounded-full mb-4 shadow-sm">
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

                {/* Boleta de Honorarios Section */}
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Boleta de Honorarios</h4>
                    <select 
                      className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-brand-500"
                      value={state.retentionYear}
                      onChange={(e) => setState({ ...state, retentionYear: e.target.value as any })}
                    >
                      <option value="none">Sin Boleta</option>
                      <option value="2026">Año 2026 (15.25%)</option>
                      <option value="2027">Año 2027 (16%)</option>
                      <option value="2028">Año 2028 (17%)</option>
                    </select>
                  </div>

                  {state.retentionYear !== 'none' && result && (
                    <div className="space-y-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs">Monto Líquido (Lo que recibes)</span>
                        <span className="font-bold text-brand-400">${result.finalTotal.toLocaleString('es-CL')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs">Retención ({(result.retentionRate * 100).toFixed(2)}%)</span>
                        <span className="text-red-400 text-xs">-${result.retentionAmount.toLocaleString('es-CL')}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                        <span className="text-slate-200 text-sm font-bold">Monto Bruto (Lo que cobras)</span>
                        <span className="text-xl font-bold text-white">${result.grossTotal.toLocaleString('es-CL')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 p-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Nuevo Cálculo
              </button>
              <button 
                onClick={() => setStep(7)}
                className="flex-[2] p-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
              >
                Generar Propuesta Comercial
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );

      case 7:
        const selectedClauses = [];
        if (state.proposal.clauses.intellectualProperty) selectedClauses.push("1. Propiedad Intelectual: Los derechos de uso y archivos finales serán propiedad del cliente únicamente tras haber liquidado el 100% del pago total.");
        if (state.proposal.clauses.excessRevisions) selectedClauses.push(`2. Exceso de Revisiones: Toda revisión adicional a las ${state.complexity.revisions} incluidas, tendrá un costo adicional del 20% del valor del proyecto por cada nueva ronda.`);
        if (state.proposal.clauses.inactivityPause) selectedClauses.push("3. Pausa por Inactividad: Si el proyecto se detiene por más de 15 días por falta de respuesta del cliente, se considerará pausado y su reactivación tendrá un costo administrativo del 10%.");
        if (state.proposal.clauses.exhibitionRights) selectedClauses.push("4. Derechos de Exhibición: El diseñador se reserva el derecho de exhibir el trabajo realizado en su portafolio profesional y redes sociales con fines promocionales.");
        if (state.proposal.clauses.contentResponsibility) selectedClauses.push("5. Responsabilidad de Contenido: El cliente garantiza que todo el material (fotos, textos, logos) entregado para el proyecto es de su propiedad o tiene los derechos de uso correspondientes.");
        if (state.proposal.clauses.cancellation) selectedClauses.push("6. Cláusula de Cancelación: En caso de cancelación por parte del cliente tras haber iniciado el trabajo, el anticipo no será reembolsable como compensación por el tiempo reservado.");

        const termsText = selectedClauses.length > 0 
          ? `\n\nTérminos y Condiciones del Servicio:\n${selectedClauses.join('\n')}`
          : '';

        const proposalText = `
Estimado(a) ${state.proposal.clientName || '[Nombre del Cliente]'} de ${state.proposal.companyName || '[Empresa]'}:

Es un gusto saludarte. En relación a nuestra conversación sobre el proyecto "${state.proposal.projectTitle || 'Proyecto de Diseño'}", presento a continuación la propuesta formal para el desarrollo del mismo.

El proyecto consiste en: ${state.proposal.projectDescription || '[Descripción del proyecto]'}. Para llevarlo a cabo, se contempla un servicio de ${state.project.serviceType} con una dedicación estimada de ${state.project.estimatedHours} horas de trabajo profesional.

La propuesta incluye ${state.complexity.revisions} rondas de revisiones para asegurar que el resultado final cumpla con tus expectativas ${state.complexity.includeSourceFiles ? 'e integra la entrega de todos los archivos fuente originales' : 'y la entrega de los archivos finales listos para su uso'}.

La inversión total para este proyecto es de $${result?.finalTotal.toLocaleString('es-CL')} CLP${state.retentionYear !== 'none' ? ` (Monto Bruto con retención: $${result?.grossTotal.toLocaleString('es-CL')} CLP)` : ''}.

En cuanto a las condiciones comerciales, el plazo de entrega estimado es de ${state.proposal.deliveryTime || 'a convenir'}, bajo una modalidad de pago de ${state.proposal.paymentMethod}. Esta cotización tiene una validez de ${state.proposal.validity} a contar de la fecha de hoy, ${new Date().toLocaleDateString('es-CL')}.

Quedo atento(a) a tus comentarios para dar inicio a esta colaboración.

Saludos cordiales,

[Tu Nombre / Firma]${termsText}
--------------------------------------------------
Propuesta generada con CalculApp.pro
        `.trim();

        const toggleClause = (key: keyof typeof state.proposal.clauses) => {
          setState({
            ...state,
            proposal: {
              ...state.proposal,
              clauses: {
                ...state.proposal.clauses,
                [key]: !state.proposal.clauses[key]
              }
            }
          });
        };

        const applyPreset = () => {
          setState({
            ...state,
            proposal: {
              ...state.proposal,
              clauses: {
                intellectualProperty: true,
                excessRevisions: true,
                inactivityPause: false,
                exhibitionRights: false,
                contentResponsibility: false,
                cancellation: true,
              }
            }
          });
        };

        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-left mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl mb-4 shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">7.- Propuesta Comercial</h2>
              <p className="text-slate-500 text-sm">Genera el texto para enviar a tu cliente</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Cliente</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    value={state.proposal.clientName}
                    onChange={e => setState({ ...state, proposal: { ...state.proposal, clientName: e.target.value } })}
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    value={state.proposal.companyName}
                    onChange={e => setState({ ...state, proposal: { ...state.proposal, companyName: e.target.value } })}
                    placeholder="Ej: Diseño SpA"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título del Proyecto</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  value={state.proposal.projectTitle}
                  onChange={e => setState({ ...state, proposal: { ...state.proposal, projectTitle: e.target.value } })}
                  placeholder="Ej: Rediseño de Logotipo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del Proyecto</label>
                <textarea 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none min-h-[100px]"
                  value={state.proposal.projectDescription}
                  onChange={e => setState({ ...state, proposal: { ...state.proposal, projectDescription: e.target.value } })}
                  placeholder="Describe brevemente los entregables y el alcance..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plazo de Entrega</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    value={state.proposal.deliveryTime}
                    onChange={e => setState({ ...state, proposal: { ...state.proposal, deliveryTime: e.target.value } })}
                    placeholder="Ej: 10 días hábiles"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Modalidad de Pago</label>
                  <select 
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    value={state.proposal.paymentMethod}
                    onChange={e => setState({ ...state, proposal: { ...state.proposal, paymentMethod: e.target.value as any } })}
                  >
                    <option value="100% anticipo">100% anticipo</option>
                    <option value="50/50">50% anticipo / 50% entrega</option>
                    <option value="30/30/40">30% inicio / 30% avance / 40% entrega</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Validez</label>
                  <select 
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    value={state.proposal.validity}
                    onChange={e => setState({ ...state, proposal: { ...state.proposal, validity: e.target.value as any } })}
                  >
                    <option value="7 días">7 días</option>
                    <option value="15 días">15 días</option>
                    <option value="30 días">30 días</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Protection Clauses Section */}
            <div className="mt-8 p-6 bg-brand-50 rounded-[2rem] border border-brand-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-200">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Escudo de Protección</h3>
                    <p className="text-xs text-slate-500 font-medium">Configuración de Contrato y Cláusulas</p>
                  </div>
                </div>
                <button 
                  onClick={applyPreset}
                  className="px-4 py-2 bg-white text-brand-600 border border-brand-200 rounded-xl text-xs font-bold hover:bg-brand-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Preset Recomendado
                </button>
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {[
                  { key: 'intellectualProperty', label: 'Propiedad Intelectual', icon: Lock, desc: 'Pago 100% para cesión de derechos.' },
                  { key: 'excessRevisions', label: 'Exceso de Revisiones', icon: Clock, desc: 'Cobro adicional por cambios extra.' },
                  { key: 'inactivityPause', label: 'Pausa por Inactividad', icon: AlertCircle, desc: 'Recargo por proyectos detenidos.' },
                  { key: 'exhibitionRights', label: 'Derechos de Exhibición', icon: Eye, desc: 'Permiso para usar en portafolio.' },
                  { key: 'contentResponsibility', label: 'Responsabilidad de Contenido', icon: FileCheck, desc: 'Cliente garantiza autoría de material.' },
                  { key: 'cancellation', label: 'Cláusula de Cancelación', icon: Ban, desc: 'Anticipo no reembolsable.' },
                ].map((clause) => (
                  <motion.label 
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    key={clause.key}
                    className={`flex items-start gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      state.proposal.clauses[clause.key as keyof typeof state.proposal.clauses]
                        ? 'bg-white border-brand-500 shadow-md shadow-brand-100'
                        : 'bg-slate-50/50 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <div className="pt-0.5">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        checked={state.proposal.clauses[clause.key as keyof typeof state.proposal.clauses]}
                        onChange={() => toggleClause(clause.key as keyof typeof state.proposal.clauses)}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <clause.icon className={`w-3.5 h-3.5 ${state.proposal.clauses[clause.key as keyof typeof state.proposal.clauses] ? 'text-brand-600' : 'text-slate-400'}`} />
                        <span className={`text-xs font-bold ${state.proposal.clauses[clause.key as keyof typeof state.proposal.clauses] ? 'text-brand-700' : 'text-slate-600'}`}>
                          {clause.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{clause.desc}</p>
                    </div>
                  </motion.label>
                ))}
              </motion.div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-bold text-slate-700 mb-2">Vista Previa de la Propuesta</label>
              <div className="relative group">
                <pre className="w-full p-6 bg-slate-900 text-slate-300 rounded-2xl text-xs font-mono whitespace-pre-wrap border border-slate-800 leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar">
                  {proposalText}
                </pre>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(proposalText);
                    const btn = document.getElementById('copy-btn');
                    if (btn) {
                      const original = btn.innerHTML;
                      btn.innerHTML = '¡Copiado!';
                      btn.classList.add('bg-emerald-500');
                      setTimeout(() => {
                        btn.innerHTML = original;
                        btn.classList.remove('bg-emerald-500');
                      }, 2000);
                    }
                  }}
                  id="copy-btn"
                  className="absolute top-4 right-4 p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all flex items-center gap-2 text-xs font-bold shadow-lg"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Propuesta
                </button>
              </div>
            </div>

            <button 
              onClick={() => setStep(6)}
              className="w-full p-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Volver al Resumen
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-2xl shadow-lg shadow-brand-200 overflow-hidden bg-white border border-slate-100 cursor-pointer"
            >
              <img 
                src={LOGO_URL} 
                alt="CalculApp.pro Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-brand-500 text-white font-bold text-xl">C</div>';
                  }
                }}
              />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">CalculApp<span className="text-brand-600">.pro</span></h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">Presupuesto de diseños.</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        {step < 8 && (
          <div className="mb-10">
            <div className="flex justify-between mb-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => {
                const Icon = i === 1 ? Settings2 : i === 2 ? Clock : i === 3 ? Zap : i === 4 ? Globe : i === 5 ? PlusCircle : i === 6 ? CheckCircle2 : FileText;
                return (
                  <div 
                    key={i} 
                    className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${step >= i ? 'text-brand-600' : 'text-slate-300'}`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                      step === i ? 'border-brand-600 bg-brand-600 text-white scale-110 shadow-lg shadow-brand-100' : 
                      step > i ? 'border-brand-600 bg-brand-50 text-brand-600' : 
                      'border-slate-200 bg-white text-slate-300'
                    }`}>
                      {step > i ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-tighter text-center">
                      {i}.- {i === 1 ? 'Tarifa' : i === 2 ? 'Proyecto' : i === 3 ? 'Tiempos' : i === 4 ? 'Impacto' : i === 5 ? 'Extras' : i === 6 ? 'Resumen' : 'Propuesta'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-brand-600"
                initial={{ width: '0%' }}
                animate={{ width: `${(step - 1) * (100/6)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <motion.div 
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <div className="p-8 sm:p-10">
            <AnimatePresence mode="wait" initial={false}>
              {renderStep()}
            </AnimatePresence>
          </div>

          {/* Navigation Footer */}
          {step < 6 && (
            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
              <motion.button
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevStep}
                disabled={step === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                  step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Atrás
              </motion.button>
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Subtotal</p>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={result?.finalTotal}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-lg font-bold text-slate-900"
                    >
                      ${result?.finalTotal.toLocaleString('es-CL')}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (step === 1) updateHourlyRateFromCalc();
                    nextStep();
                  }}
                  className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  {step === 5 ? 'Ver Resultado' : 'Siguiente'}
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>

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
