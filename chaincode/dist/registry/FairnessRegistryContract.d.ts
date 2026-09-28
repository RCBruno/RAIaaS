import { Context, Contract } from 'fabric-contract-api';
export declare class FairnessRegistryContract extends Contract {
    constructor();
    InitLedger(ctx: Context): Promise<void>;
    RegisterActor(ctx: Context, actorID: string, roleStr: string, name: string, initialStake: number, initialBond: number): Promise<string>;
    GetActor(ctx: Context, actorID: string): Promise<string>;
    DepositStake(ctx: Context, actorID: string, amount: number): Promise<void>;
    DepositBond(ctx: Context, actorID: string, amount: number): Promise<void>;
    SetEthicalThreshold(ctx: Context, thresholdID: string, metricName: string, minRatio: number, maxRatio: number): Promise<void>;
}
//# sourceMappingURL=FairnessRegistryContract.d.ts.map