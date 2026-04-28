export interface ProjectData {
  serviceType: string;
  customServiceType?: string;
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
export type RetentionYear = '2026' | '2027' | '2028' | 'none';

export interface HourlyRateCalculation {
  desiredSalary: number;
  monthlyExpenses: number;
  workingDays: number;
  hoursPerDay: number;
  productivityFactor: number; // 0 to 1
  experienceLevel: ExperienceLevel;
}

export interface ProposalData {
  clientName: string;
  companyName: string;
  projectTitle: string;
  projectDescription: string;
  deliveryTime: string;
  paymentMethod: '100% anticipo' | '50/50' | '30/30/40';
  validity: '7 días' | '15 días' | '30 días';
  clauses: {
    intellectualProperty: boolean;
    excessRevisions: boolean;
    inactivityPause: boolean;
    exhibitionRights: boolean;
    contentResponsibility: boolean;
    cancellation: boolean;
  };
}

export interface BudgetState {
  hourlyRateCalc: HourlyRateCalculation;
  project: ProjectData;
  complexity: ComplexityData;
  impact: ImpactData;
  extras: ExtraCostsData;
  retentionYear: RetentionYear;
  proposal: ProposalData;
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
  retentionRate: number;
  retentionAmount: number;
  grossTotal: number;
}
