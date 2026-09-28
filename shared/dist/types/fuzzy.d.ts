export type LinguisticLabel = 'POOR' | 'ACCEPTABLE' | 'GOOD' | 'EXCELLENT';
export interface MembershipFunction {
    label: LinguisticLabel;
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
    complianceDegree: number;
}
export interface SettlementAction {
    payoutPercentage: number;
    bonusEligible: boolean;
    penaltyAmount: number;
    slashingTriggered: boolean;
    description: string;
}
//# sourceMappingURL=fuzzy.d.ts.map