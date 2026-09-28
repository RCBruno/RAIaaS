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
exports.FairnessSLAFactoryContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
const shared_1 = require("@raiaas/shared");
let FairnessSLAFactoryContract = class FairnessSLAFactoryContract extends fabric_contract_api_1.Contract {
    constructor() {
        super('FairnessSLAFactoryContract');
    }
    async CreateSLA(ctx, slaID, platformID, providerIDsJson, // JSON string array of provider IDs
    planTypeStr, targetRatio, reportingIntervalHours, fuzzyScaleConfigJson, bondReq, stakeReq) {
        const key = `SLA_${slaID}`;
        const existingBytes = await ctx.stub.getState(key);
        if (existingBytes && existingBytes.length > 0) {
            throw new Error(`SLA contract ${slaID} already exists.`);
        }
        const providerIDs = JSON.parse(providerIDsJson);
        const fuzzyScaleConfig = JSON.parse(fuzzyScaleConfigJson);
        const planType = planTypeStr;
        const terms = {
            targetExposureMeritRatio: Number(targetRatio),
            reportingIntervalHours: Number(reportingIntervalHours),
            fuzzyScaleConfig,
            platformBondRequirement: Number(bondReq),
            providerStakeRequirement: Number(stakeReq)
        };
        const slaState = {
            slaID,
            factoryID: 'FairnessSLAFactory_v1',
            platformID,
            providerIDs,
            planType,
            status: shared_1.SLAStatus.ACTIVE,
            terms,
            reports: {},
            disputes: {},
            createdAt: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString(),
            updatedAt: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString()
        };
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(slaState)));
        ctx.stub.setEvent('SLACreated', Buffer.from(JSON.stringify({ slaID, platformID, providerCount: providerIDs.length, planType })));
        return JSON.stringify(slaState);
    }
    async GetSLA(ctx, slaID) {
        const key = `SLA_${slaID}`;
        const bytes = await ctx.stub.getState(key);
        if (!bytes || bytes.length === 0) {
            throw new Error(`SLA contract ${slaID} does not exist.`);
        }
        return Buffer.from(bytes).toString('utf8');
    }
    async DeactivateSLA(ctx, slaID) {
        const key = `SLA_${slaID}`;
        const bytes = await ctx.stub.getState(key);
        if (!bytes || bytes.length === 0) {
            throw new Error(`SLA contract ${slaID} does not exist.`);
        }
        const sla = JSON.parse(Buffer.from(bytes).toString('utf8'));
        sla.status = shared_1.SLAStatus.TERMINATED;
        sla.updatedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(sla)));
        ctx.stub.setEvent('SLADeactivated', Buffer.from(JSON.stringify({ slaID })));
    }
};
exports.FairnessSLAFactoryContract = FairnessSLAFactoryContract;
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String, Number, Number, String, Number, Number]),
    __metadata("design:returntype", Promise)
], FairnessSLAFactoryContract.prototype, "CreateSLA", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], FairnessSLAFactoryContract.prototype, "GetSLA", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], FairnessSLAFactoryContract.prototype, "DeactivateSLA", null);
exports.FairnessSLAFactoryContract = FairnessSLAFactoryContract = __decorate([
    (0, fabric_contract_api_1.Info)({ title: 'FairnessSLAFactoryContract', description: 'Instantiates and tracks single-provider and group-provider Fairness SLA contracts' }),
    __metadata("design:paramtypes", [])
], FairnessSLAFactoryContract);
//# sourceMappingURL=FairnessSLAFactoryContract.js.map