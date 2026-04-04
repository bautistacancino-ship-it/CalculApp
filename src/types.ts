export interface ProjectData {
  serviceType: string;
  estimatedHours: number;
  hourlyRate: number;
}

export interface ComplexityData {
  urgency: 'normal' | 'fast' | 'urgent';
  revisions: number;
  includeSourceFiles: boolean;
}

export interface ImpactData {
  clientSize: 'micro' | 'pyme' | 'corp';
  geographicScope: 'local' | 'national' | 'international';
  licenseDuration: '1year' | '2years' | 'perpetual';
}

export interface ExtraCostsData {
  stock: number;
  fonts: number;
  externalProviders: number;
}

export type ExperienceLevel = 'student' | 'junior' | 'senior';

export interface HourlyRateCalculation {
  desiredSalary: number;
  monthlyExpenses: number;
  workingDays: number;
  hoursPerDay: number;
  productivityFactor: number; // 0 to 1
  experienceLevel: ExperienceLevel;
}

export interface BudgetState {
  hourlyRateCalc: HourlyRateCalculation;
  project: ProjectData;
  complexity: ComplexityData;
  impact: ImpactData;
  extras: ExtraCostsData;
}

export interface CalculationResult {
  baseCost: number;
  pmFee: number;
  urgencyMultiplier: number;
  usageMultiplier: number;
  sourceFilesSurcharge: number;
  subtotal: number;
  extraCostsTotal: number;
  finalTotal: number;
}
