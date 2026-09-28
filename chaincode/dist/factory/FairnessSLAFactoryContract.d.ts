import { Context, Contract } from 'fabric-contract-api';
export declare class FairnessSLAFactoryContract extends Contract {
    constructor();
    CreateSLA(ctx: Context, slaID: string, platformID: string, providerIDsJson: string, // JSON string array of provider IDs
    planTypeStr: string, targetRatio: number, reportingIntervalHours: number, fuzzyScaleConfigJson: string, bondReq: number, stakeReq: number): Promise<string>;
    GetSLA(ctx: Context, slaID: string): Promise<string>;
    DeactivateSLA(ctx: Context, slaID: string): Promise<void>;
}
//# sourceMappingURL=FairnessSLAFactoryContract.d.ts.map