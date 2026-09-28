"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FabricService = void 0;
const shared_1 = require("@raiaas/shared");
class FabricService {
    actors = new Map();
    slas = new Map();
    async registerActor(id, role, name, stake, bond) {
        const actor = {
            id,
            mspID: role === shared_1.ActorRole.PLATFORM ? 'PlatformMSP' : role === shared_1.ActorRole.PROVIDER ? 'ProviderMSP' : 'AuditorMSP',
            role,
            name,
            stakeBalance: stake,
            bondBalance: bond,
            status: shared_1.ActorStatus.ACTIVE,
            registeredAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.actors.set(id, actor);
        return actor;
    }
    async getActor(id) {
        const actor = this.actors.get(id);
        if (!actor) {
            throw new Error(`Actor ${id} not found.`);
        }
        return actor;
    }
    async createSLA(slaID, platformID, providerIDs, planType, terms) {
        const sla = {
            slaID,
            factoryID: 'FairnessSLAFactory_v1',
            platformID,
            providerIDs,
            planType,
            status: shared_1.SLAStatus.ACTIVE,
            terms,
            reports: {},
            disputes: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.slas.set(slaID, sla);
        return sla;
    }
    async getSLA(slaID) {
        const sla = this.slas.get(slaID);
        if (!sla) {
            throw new Error(`SLA ${slaID} not found.`);
        }
        return sla;
    }
    async submitMetricReport(slaID, report) {
        const sla = await this.getSLA(slaID);
        sla.reports[report.periodID] = report;
        sla.updatedAt = new Date().toISOString();
        return report;
    }
    async initiateDispute(slaID, periodID, disputingProviderID, counterEvidenceCID) {
        const sla = await this.getSLA(slaID);
        const report = sla.reports[periodID];
        if (!report) {
            throw new Error(`Report ${periodID} not found.`);
        }
        const dispute = {
            periodID,
            disputingProviderID,
            counterEvidenceCID,
            openedAt: new Date().toISOString(),
            status: shared_1.DisputeStatus.OPEN
        };
        sla.disputes[periodID] = dispute;
        report.disputeStatus = shared_1.DisputeStatus.OPEN;
        sla.status = shared_1.SLAStatus.DISPUTED;
        sla.updatedAt = new Date().toISOString();
        return dispute;
    }
    async resolveDispute(slaID, periodID, auditorID, isPlatformAtFault, verdict, penaltyAmount) {
        const sla = await this.getSLA(slaID);
        const dispute = sla.disputes[periodID];
        if (!dispute) {
            throw new Error(`Dispute for period ${periodID} not found.`);
        }
        dispute.auditorID = auditorID;
        dispute.auditorVerdict = verdict;
        dispute.resolvedAt = new Date().toISOString();
        if (isPlatformAtFault) {
            dispute.status = shared_1.DisputeStatus.RESOLVED_PLATFORM_FAULT;
            dispute.penaltyAmount = penaltyAmount;
            sla.reports[periodID].disputeStatus = shared_1.DisputeStatus.RESOLVED_PLATFORM_FAULT;
            const platform = this.actors.get(sla.platformID);
            if (platform) {
                platform.bondBalance = Math.max(0, platform.bondBalance - penaltyAmount);
            }
        }
        else {
            dispute.status = shared_1.DisputeStatus.REJECTED;
            sla.reports[periodID].disputeStatus = shared_1.DisputeStatus.REJECTED;
        }
        sla.status = shared_1.SLAStatus.ACTIVE;
        sla.updatedAt = new Date().toISOString();
        return dispute;
    }
    async executeSettlement(slaID, periodID) {
        const sla = await this.getSLA(slaID);
        const report = sla.reports[periodID];
        if (!report) {
            throw new Error(`Report ${periodID} not found.`);
        }
        report.settlementExecuted = true;
        sla.updatedAt = new Date().toISOString();
        return report;
    }
}
exports.FabricService = FabricService;
//# sourceMappingURL=fabric.service.js.map