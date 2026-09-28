"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDisputeRouter = createDisputeRouter;
const express_1 = require("express");
function createDisputeRouter(fabricService) {
    const router = (0, express_1.Router)();
    router.post('/open', async (req, res) => {
        try {
            const { slaID, periodID, disputingProviderID, counterEvidenceCID } = req.body;
            const dispute = await fabricService.initiateDispute(slaID, periodID, disputingProviderID, counterEvidenceCID);
            res.status(201).json(dispute);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
    router.post('/resolve', async (req, res) => {
        try {
            const { slaID, periodID, auditorID, isPlatformAtFault, verdict, penaltyAmount } = req.body;
            const dispute = await fabricService.resolveDispute(slaID, periodID, auditorID, Boolean(isPlatformAtFault), verdict, Number(penaltyAmount || 0));
            res.json(dispute);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
    router.post('/settle', async (req, res) => {
        try {
            const { slaID, periodID } = req.body;
            const report = await fabricService.executeSettlement(slaID, periodID);
            res.json(report);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
    return router;
}
//# sourceMappingURL=dispute.routes.js.map