import { FuzzyEvaluationResult, FuzzyScaleConfig } from '@raiaas/shared';
export declare class SinbadFuzzyEngine {
    private scaleConfig;
    constructor(customConfig?: FuzzyScaleConfig);
    /**
     * Fuzzifies a continuous Exposure/Merit ratio into membership degrees for each linguistic label
     * and calculates the aggregated compliance degree alpha in [0, 1].
     */
    evaluateRatio(ratio: number): FuzzyEvaluationResult;
}
//# sourceMappingURL=fuzzy-engine.d.ts.map