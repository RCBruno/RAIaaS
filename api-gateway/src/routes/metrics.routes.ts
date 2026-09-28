import { Router } from 'express';
import { FabricService } from '../services/fabric.service.js';
import { IPFSService } from '../services/ipfs.service.js';
import { RatioCalculator, SettlementEvaluator, SinbadFuzzyEngine } from '@raiaas/fairness-engine';
import { EvidencePackage } from '@raiaas/shared';

export function createMetricsRouter(fabricService: FabricService, ipfsService: IPFSService): Router {
  const router = Router();
  const fuzzyEngine = new SinbadFuzzyEngine();

  router.post('/submit', async (req, res) => {
    try {
      const { slaID, periodID, platformID, rawMetrics, baseFee, bondAmount } = req.body;

      // 1. Calculate aggregated Exposure/Merit Ratio
      const aggregatedRatio = RatioCalculator.calculateAggregatedRatio(rawMetrics);

      // 2. Perform Fuzzy Evaluation (Sinbad² methodology)
      const fuzzyResult = fuzzyEngine.evaluateRatio(aggregatedRatio);

      // 3. Evaluate Graduated Settlement Action
      const settlementAction = SettlementEvaluator.evaluateSettlement(
        fuzzyResult,
        Number(baseFee || 1000),
        Number(bondAmount || 5000)
      );

      // 4. Construct Evidence Package
      const evidencePackage: EvidencePackage = {
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
        disputeStatus: 'NONE' as any,
        settlementExecuted: false
      });

      res.status(201).json({
        report,
        fuzzyResult,
        settlementAction,
        ipfsCID,
        evidenceHash
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}
