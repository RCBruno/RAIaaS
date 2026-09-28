export type LinguisticLabel = 'POOR' | 'ACCEPTABLE' | 'GOOD' | 'EXCELLENT';

export interface MembershipFunction {
  label: LinguisticLabel;
  // Triangular or trapezoidal coordinates: [a, b, c, d]
  // For triangular: b === c
  points: [number, number, number, number];
}

export interface FuzzyScaleConfig {
  name: string;
  labels: LinguisticLabel[];
  membershipFunctions: MembershipFunction[];
}

export interface FuzzyEvaluationResult {
  exposureMeritRatio: number;
  memberships: Record<LinguisticLabel, number>;
  primaryLabel: LinguisticLabel;
  complianceDegree: number; // Value in [0, 1]
}

export interface SettlementAction {
  payoutPercentage: number;
  bonusEligible: boolean;
  penaltyAmount: number;
  slashingTriggered: boolean;
  description: string;
}
