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

  // 7. Total Final (Líquido)
  const finalTotal = subtotal + extraCostsTotal;

  // 8. Retención de Boletas de Honorarios (Chile)
  const retentionRates: Record<string, number> = {
    '2026': 0.1525,
    '2027': 0.16,
    '2028': 0.17,
    'none': 0
  };

  const retentionRate = retentionRates[state.retentionYear] || 0;
  
  // Si finalTotal es lo que el diseñador quiere recibir (Líquido), 
  // calculamos el Bruto (lo que debe cobrar en la boleta)
  const grossTotal = retentionRate > 0 
    ? Math.round(finalTotal / (1 - retentionRate))
    : finalTotal;
    
  const retentionAmount = grossTotal - finalTotal;

  return {
    baseCost: rawBaseCost,
    pmFee,
    urgencyMultiplier,
    usageMultiplier,
    sourceFilesSurcharge,
    subtotal,
    extraCostsTotal,
    finalTotal,
    retentionRate,
    retentionAmount,
    grossTotal
  };
}
