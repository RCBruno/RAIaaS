"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMetricsRouter = createMetricsRouter;
const express_1 = require("express");
const fairness_engine_1 = require("@raiaas/fairness-engine");
function createMetricsRouter(fabricService, ipfsService) {
    const router = (0, express_1.Router)();
    const fuzzyEngine = new fairness_engine_1.SinbadFuzzyEngine();
    router.post('/submit', async (req, res) => {
        try {
            const { slaID, periodID, platformID, rawMetrics, baseFee, bondAmount } = req.body;
            // 1. Calculate aggregated Exposure/Merit Ratio
            const aggregatedRatio = fairness_engine_1.RatioCalculator.calculateAggregatedRatio(rawMetrics);
            // 2. Perform Fuzzy Evaluation (Sinbad² methodology)
            const fuzzyResult = fuzzyEngine.evaluateRatio(aggregatedRatio);
            // 3. Evaluate Graduated Settlement Action
            const settlementAction = fairness_engine_1.SettlementEvaluator.evaluateSettlement(fuzzyResult, Number(baseFee || 1000), Number(bondAmount || 5000));
            // 4. Construct Evidence Package
            const evidencePackage = {
                slaID,
                periodID,
                timestamp: new Date().toISOString(),
                platformID,
                metrics: rawMetrics,
                aggregatedRatio,
                calculatedHash: ''
            };
            // 5. Upload Evidence Package to IPFS
            const { ipfsCID, evidenceHash } = await ipfsService.uploadEvidence(evidencePackage);
            // 6. Submit Metric Report to Hyperledger Fabric
            const report = await fabricService.submitMetricReport(slaID, {
                periodID,
                timestamp: new Date().toISOString(),
                ipfsCID,
                evidenceHash,
                exposureMeritRatio: aggregatedRatio,
                fuzzyLabel: fuzzyResult.primaryLabel,
                complianceDegree: fuzzyResult.complianceDegree,
                disputeStatus: 'NONE',
                settlementExecuted: false
            });
            res.status(201).json({
                report,
                fuzzyResult,
                settlementAction,
                ipfsCID,
                evidenceHash
            });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
    return router;
}
//# sourceMappingURL=metrics.routes.js.map