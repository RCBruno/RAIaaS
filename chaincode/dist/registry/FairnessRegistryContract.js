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
exports.FairnessRegistryContract = void 0;
const fabric_contract_api_1 = require("fabric-contract-api");
const shared_1 = require("@raiaas/shared");
let FairnessRegistryContract = class FairnessRegistryContract extends fabric_contract_api_1.Contract {
    constructor() {
        super('FairnessRegistryContract');
    }
    async InitLedger(ctx) {
        // Initialize default system thresholds if needed
        const defaultThreshold = {
            id: 'ETHICAL_THRESHOLD_STANDARD',
            metricName: 'Exposure/Merit Ratio',
            minRatio: 0.60,
            maxRatio: 1.40,
            active: true
        };
        await ctx.stub.putState('THRESHOLD_ETHICAL_THRESHOLD_STANDARD', Buffer.from(JSON.stringify(defaultThreshold)));
    }
    async RegisterActor(ctx, actorID, roleStr, name, initialStake, initialBond) {
        const key = `ACTOR_${actorID}`;
        const existingBytes = await ctx.stub.getState(key);
        if (existingBytes && existingBytes.length > 0) {
            throw new Error(`Actor ${actorID} is already registered.`);
        }
        const clientMSP = ctx.clientIdentity.getMSPID();
        const role = roleStr;
        const actor = {
            id: actorID,
            mspID: clientMSP || 'PlatformMSP',
            role,
            name,
            stakeBalance: Number(initialStake),
            bondBalance: Number(initialBond),
            status: shared_1.ActorStatus.ACTIVE,
            registeredAt: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString(),
            updatedAt: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString()
        };
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(actor)));
        ctx.stub.setEvent('ActorRegistered', Buffer.from(JSON.stringify({ actorID, role, mspID: clientMSP })));
        return JSON.stringify(actor);
    }
    async GetActor(ctx, actorID) {
        const key = `ACTOR_${actorID}`;
        const bytes = await ctx.stub.getState(key);
        if (!bytes || bytes.length === 0) {
            throw new Error(`Actor ${actorID} does not exist.`);
        }
        return Buffer.from(bytes).toString('utf8');
    }
    async DepositStake(ctx, actorID, amount) {
        const key = `ACTOR_${actorID}`;
        const bytes = await ctx.stub.getState(key);
        if (!bytes || bytes.length === 0) {
            throw new Error(`Actor ${actorID} does not exist.`);
        }
        const actor = JSON.parse(Buffer.from(bytes).toString('utf8'));
        actor.stakeBalance += Number(amount);
        actor.updatedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(actor)));
        ctx.stub.setEvent('StakeDeposited', Buffer.from(JSON.stringify({ actorID, newBalance: actor.stakeBalance })));
    }
    async DepositBond(ctx, actorID, amount) {
        const key = `ACTOR_${actorID}`;
        const bytes = await ctx.stub.getState(key);
        if (!bytes || bytes.length === 0) {
            throw new Error(`Actor ${actorID} does not exist.`);
        }
        const actor = JSON.parse(Buffer.from(bytes).toString('utf8'));
        actor.bondBalance += Number(amount);
        actor.updatedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(actor)));
        ctx.stub.setEvent('BondDeposited', Buffer.from(JSON.stringify({ actorID, newBalance: actor.bondBalance })));
    }
    async SetEthicalThreshold(ctx, thresholdID, metricName, minRatio, maxRatio) {
        const key = `THRESHOLD_${thresholdID}`;
        const threshold = {
            id: thresholdID,
            metricName,
            minRatio: Number(minRatio),
            maxRatio: Number(maxRatio),
            active: true
        };
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(threshold)));
        ctx.stub.setEvent('ThresholdUpdated', Buffer.from(JSON.stringify({ thresholdID, metricName })));
    }
};
exports.FairnessRegistryContract = FairnessRegistryContract;
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], FairnessRegistryContract.prototype, "InitLedger", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], FairnessRegistryContract.prototype, "RegisterActor", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    (0, fabric_contract_api_1.Returns)('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], FairnessRegistryContract.prototype, "GetActor", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, Number]),
    __metadata("design:returntype", Promise)
], FairnessRegistryContract.prototype, "DepositStake", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, Number]),
    __metadata("design:returntype", Promise)
], FairnessRegistryContract.prototype, "DepositBond", null);
__decorate([
    (0, fabric_contract_api_1.Transaction)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], FairnessRegistryContract.prototype, "SetEthicalThreshold", null);
exports.FairnessRegistryContract = FairnessRegistryContract = __decorate([
    (0, fabric_contract_api_1.Info)({ title: 'FairnessRegistryContract', description: 'Manages actor identities, MSP mappings, stakes, bonds, and global ethical thresholds' }),
    __metadata("design:paramtypes", [])
], FairnessRegistryContract);
//# sourceMappingURL=FairnessRegistryContract.js.map