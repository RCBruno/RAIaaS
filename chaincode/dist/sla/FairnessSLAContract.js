"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FairnessSLAContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
const shared_1 = require("@raiaas/shared");
let FairnessSLAContract = class FairnessSLAContract extends fabric_contract_api_1.Contract {
    constructor() {
        super('FairnessSLAContract');
    }
    async SubmitMetricReport(ctx, slaID, periodID, ipfsCID, evidenceHash, exposureMeritRatio, fuzzyLabelStr, complianceDegree) {
        const key = `SLA_${slaID}`;
        const bytes = await ctx.stub.getState(key);
        if (!bytes || bytes.length === 0) {
            throw new Error(`SLA contract ${slaID} does not exist.`);
        }
        const sla = JSON.parse(Buffer.from(bytes).toString('utf8'));
        if (sla.status === shared_1.SLAStatus.TERMINATED) {
            throw new Error(`SLA contract ${slaID} is terminated.`);
        }
        const fuzzyLabel = fuzzyLabelStr;
        const report = {
            periodID,
            timestamp: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString(),
            ipfsCID,
            evidenceHash,
            exposureMeritRatio: Number(exposureMeritRatio),
            fuzzyLabel,
            complianceDegree: Number(complianceDegree),
            disputeStatus: shared_1.DisputeStatus.NONE,
            settlementExecuted: false
        };
        sla.reports[periodID] = report;
        sla.updatedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(sla)));
        ctx.stub.setEvent('MetricReportSubmitted', Buffer.from(JSON.stringify({ slaID, periodID, ipfsCID, exposureMeritRatio, fuzzyLabel, complianceDegree })));
        return JSON.stringify(report);
    }
    async InitiateDispute(ctx, slaID, periodID, disputingProviderID, counterEvidenceCID) {
        const key = `SLA_${slaID}`;
        const bytes = await ctx.stub.getState(key);
        if (!bytes || bytes.length === 0) {
            throw new Error(`SLA contract ${slaID} does not exist.`);
        }
        const sla = JSON.parse(Buffer.from(bytes).toString('utf8'));
        const report = sla.reports[periodID];
        if (!report) {
            throw new Error(`Report for period ${periodID} does not exist in SLA ${slaID}.`);
        }
        if (report.settlementExecuted) {
            throw new Error(`Period ${periodID} has already been settled and cannot be disputed.`);
        }
        const dispute = {
            periodID,
            disputingProviderID,
            counterEvidenceCID,
            openedAt: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString(),
            status: shared_1.DisputeStatus.OPEN
        };
        sla.disputes[periodID] = dispute;
        report.disputeStatus = shared_1.DisputeStatus.OPEN;
        sla.status = shared_1.SLAStatus.DISPUTED;
        sla.updatedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(sla)));
        ctx.stub.setEvent('DisputeOpened', Buffer.from(JSON.stringify({ slaID, periodID, disputingProviderID, counterEvidenceCID })));
        return JSON.stringify(dispute);
    }
    async ResolveDispute(ctx, slaID, periodID, auditorID, isPlatformAtFault, auditorVerdict, penaltyAmount) {
        const key = `SLA_${slaID}`;
        const bytes = await ctx.stub.getState(key);
        if (!bytes || bytes.length === 0) {
            throw new Error(`SLA contract ${slaID} does not exist.`);
        }
        const sla = JSON.parse(Buffer.from(bytes).toString('utf8'));
        const dispute = sla.disputes[periodID];
        if (!dispute) {
            throw new Error(`No dispute found for period ${periodID} in SLA ${slaID}.`);
        }
        dispute.auditorID = auditorID;
        dispute.auditorVerdict = auditorVerdict;
        dispute.resolvedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        if (isPlatformAtFault) {
            dispute.status = shared_1.DisputeStatus.RESOLVED_PLATFORM_FAULT;
            dispute.penaltyAmount = Number(penaltyAmount);
            sla.reports[periodID].disputeStatus = shared_1.DisputeStatus.RESOLVED_PLATFORM_FAULT;
            // Deduct penalty from platform bond in FairnessRegistry if available
            const platformActorKey = `ACTOR_${sla.platformID}`;
            const platformBytes = await ctx.stub.getState(platformActorKey);
            if (platformBytes && platformBytes.length > 0) {
                const platformActor = JSON.parse(Buffer.from(platformBytes).toString('utf8'));
                platformActor.bondBalance = Math.max(0, platformActor.bondBalance - Number(penaltyAmount));
                await ctx.stub.putState(platformActorKey, Buffer.from(JSON.stringify(platformActor)));
            }
        }
        else {
            dispute.status = shared_1.DisputeStatus.REJECTED;
            sla.reports[periodID].disputeStatus = shared_1.DisputeStatus.REJECTED;
        }
        sla.status = shared_1.SLAStatus.ACTIVE;
        sla.updatedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(sla)));
        ctx.stub.setEvent('DisputeResolved', Buffer.from(JSON.stringify({ slaID, periodID, isPlatformAtFault, penaltyAmount })));
    }
    async ExecuteSettlement(ctx, slaID, periodID, payoutPercentage, slashingTriggered, penaltyAmount) {
        const key = `SLA_${slaID}`;
        const bytes = await ctx.stub.getState(key);
        if (!bytes || bytes.length === 0) {
            throw new Error(`SLA contract ${slaID} does not exist.`);
        }
        const sla = JSON.parse(Buffer.from(bytes).toString('utf8'));
        const report = sla.reports[periodID];
        if (!report) {
            throw new Error(`Report for period ${periodID} does not exist.`);
        }
        if (report.disputeStatus === shared_1.DisputeStatus.OPEN) {
            throw new Error(`Cannot execute settlement while dispute is open for period ${periodID}.`);
        }
        report.settlementExecuted = true;
        sla.updatedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        const settlementResult = {
            slaID,
            periodID,
            payoutPercentage: Number(payoutPercentage),
            slashingTriggered: Boolean(slashingTriggered),
            penaltyAmount: Number(penaltyAmount),
            settledAt: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString()
        };
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(sla)));
        ctx.stub.setEvent('SettlementExecuted', Buffer.from(JSON.stringify(settlementResult)));
        return JSON.stringify(settlementResult);
    }
};
exports.FairnessSLAContract = FairnessSLAContract;
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String, Number, String, Number]),
    __metadata("design:returntype", Promise)
], FairnessSLAContract.prototype, "SubmitMetricReport", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FairnessSLAContract.prototype, "InitiateDispute", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, Boolean, String, Number]),
    __metadata("design:returntype", Promise)
], FairnessSLAContract.prototype, "ResolveDispute", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, Number, Boolean, Number]),
    __metadata("design:returntype", Promise)
], FairnessSLAContract.prototype, "ExecuteSettlement", null);
exports.FairnessSLAContract = FairnessSLAContract = __decorate([
    (0, fabric_contract_api_1.Info)({ title: 'FairnessSLAContract', description: 'Manages reporting periods, IPFS evidence links, disputes, and graduated fuzzy settlements' }),
    __metadata("design:paramtypes", [])
], FairnessSLAContract);
//# sourceMappingURL=FairnessSLAContract.js.map