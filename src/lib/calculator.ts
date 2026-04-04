import { BudgetState, CalculationResult } from "../types";
import { 
  URGENCY_MULTIPLIERS, 
  USAGE_MULTIPLIERS, 
  EXPERIENCE_MULTIPLIERS,
  PM_FEE_PERCENTAGE, 
  SOURCE_FILES_SURCHARGE_PERCENTAGE 
} from "../constants";

export function calculateBudget(state: BudgetState): CalculationResult {
  const { project, complexity, impact, extras } = state;

  // 1. Costo Base = (Horas Estimadas * Tarifa por Hora)
  const rawBaseCost = project.estimatedHours * project.hourlyRate;
  
  // 2. PM Fee (20%)
  const pmFee = rawBaseCost * PM_FEE_PERCENTAGE;
  const baseCostWithPM = rawBaseCost + pmFee;

  // 3. Multiplicadores
  const urgencyMultiplier = URGENCY_MULTIPLIERS[complexity.urgency];
  const usageMultiplier = USAGE_MULTIPLIERS[impact.clientSize];
  const experienceMultiplier = EXPERIENCE_MULTIPLIERS[state.hourlyRateCalc.experienceLevel];

  // 4. Recargo Archivos Fuente (50% del Costo Base con PM)
  const sourceFilesSurcharge = complexity.includeSourceFiles 
    ? baseCostWithPM * SOURCE_FILES_SURCHARGE_PERCENTAGE 
    : 0;

  // 5. Subtotal = (Costo Base * Multiplicador de Urgencia * Multiplicador de Uso * Multiplicador de Experiencia) + Recargo Archivos Fuente
  const subtotal = (baseCostWithPM * urgencyMultiplier * usageMultiplier * experienceMultiplier) + sourceFilesSurcharge;

  // 6. Costos Extra
  const extraCostsTotal = extras.stock + extras.fonts + extras.externalProviders;

  // 7. Total Final
  const finalTotal = subtotal + extraCostsTotal;

  return {
    baseCost: rawBaseCost,
    pmFee,
    urgencyMultiplier,
    usageMultiplier,
    sourceFilesSurcharge,
    subtotal,
    extraCostsTotal,
    finalTotal
  };
}
