import { FuzzyEvaluationResult, SettlementAction } from '@raiaas/shared';
export declare class SettlementEvaluator {
    /**
     * Evaluates the graduated settlement action based on fuzzy evaluation result.
     */
    static evaluateSettlement(fuzzyResult: FuzzyEvaluationResult, baseFee: number, bondAmount: number): SettlementAction;
}
//# sourceMappingURL=settlement-evaluator.d.ts.map