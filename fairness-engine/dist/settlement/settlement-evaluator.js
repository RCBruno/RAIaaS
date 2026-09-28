"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementEvaluator = void 0;
class SettlementEvaluator {
    /**
     * Evaluates the graduated settlement action based on fuzzy evaluation result.
     */
    static evaluateSettlement(fuzzyResult, baseFee, bondAmount) {
        const alpha = fuzzyResult.complianceDegree;
        const label = fuzzyResult.primaryLabel;
        if (label === 'EXCELLENT' || alpha >= 0.85) {
            return {
                payoutPercentage: 100,
                bonusEligible: true,
                penaltyAmount: 0,
                slashingTriggered: false,
                description: `Full fee payout (100%) and compliance performance bonus released for EXCELLENT compliance (Degree: ${alpha}).`
            };
        }
        if (label === 'GOOD' || (alpha >= 0.70 && alpha < 0.85)) {
            return {
                payoutPercentage: 90,
                bonusEligible: false,
                penaltyAmount: 0,
                slashingTriggered: false,
                description: `High fee payout (90%) released for GOOD compliance (Degree: ${alpha}).`
            };
        }
        if (label === 'ACCEPTABLE' || (alpha >= 0.50 && alpha < 0.70)) {
            const payout = Math.round(70 + (alpha - 0.50) * 100); // 70% to 90%
            return {
                payoutPercentage: payout,
                bonusEligible: false,
                penaltyAmount: 0,
                slashingTriggered: false,
                description: `Partial fee payout (${payout}%) released for ACCEPTABLE compliance (Degree: ${alpha}).`
            };
        }
        // POOR compliance (alpha < 0.50)
        const penaltyRate = 0.20; // 20% of bond slashed for default
        const penalty = Math.min(bondAmount, baseFee * 0.5 + bondAmount * penaltyRate);
        return {
            payoutPercentage: 0,
            bonusEligible: false,
            penaltyAmount: Math.round(penalty),
            slashingTriggered: true,
            description: `AUTOMATIC PENALTY & BOND SLASHING: Platform failed SLA compliance (Degree: ${alpha}, Label: ${label}). Slashing penalty of $${Math.round(penalty)} applied.`
        };
    }
}
exports.SettlementEvaluator = SettlementEvaluator;
//# sourceMappingURL=settlement-evaluator.js.map