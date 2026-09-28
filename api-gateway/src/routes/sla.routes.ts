import { Router } from 'express';
import { FabricService } from '../services/fabric.service.js';
import { MembershipEvaluator } from '@raiaas/fairness-engine';

export function createSLARouter(fabricService: FabricService): Router {
  const router = Router();

  router.post('/create', async (req, res) => {
    try {
      const { slaID, platformID, providerIDs, planType, targetRatio, reportingIntervalHours, bondReq, stakeReq } = req.body;

      const terms = {
        targetExposureMeritRatio: Number(targetRatio || 1.0),
        reportingIntervalHours: Number(reportingIntervalHours || 24),
        fuzzyScaleConfig: MembershipEvaluator.getDefaultScaleConfig(),
        platformBondRequirement: Number(bondReq || 5000),
        providerStakeRequirement: Number(stakeReq || 500)
      };

      const sla = await fabricService.createSLA(slaID, platformID, providerIDs, planType, terms);
      res.status(201).json(sla);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const sla = await fabricService.getSLA(req.params.id);
      res.json(sla);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  return router;
}
