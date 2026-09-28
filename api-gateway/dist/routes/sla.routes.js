"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSLARouter = createSLARouter;
const express_1 = require("express");
const fairness_engine_1 = require("@raiaas/fairness-engine");
function createSLARouter(fabricService) {
    const router = (0, express_1.Router)();
    router.post('/create', async (req, res) => {
        try {
            const { slaID, platformID, providerIDs, planType, targetRatio, reportingIntervalHours, bondReq, stakeReq } = req.body;
            const terms = {
                targetExposureMeritRatio: Number(targetRatio || 1.0),
                reportingIntervalHours: Number(reportingIntervalHours || 24),
                fuzzyScaleConfig: fairness_engine_1.MembershipEvaluator.getDefaultScaleConfig(),
                platformBondRequirement: Number(bondReq || 5000),
                providerStakeRequirement: Number(stakeReq || 500)
            };
            const sla = await fabricService.createSLA(slaID, platformID, providerIDs, planType, terms);
            res.status(201).json(sla);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
    router.get('/:id', async (req, res) => {
        try {
            const sla = await fabricService.getSLA(req.params.id);
            res.json(sla);
        }
        catch (err) {
            res.status(404).json({ error: err.message });
        }
    });
    return router;
}
//# sourceMappingURL=sla.routes.js.map