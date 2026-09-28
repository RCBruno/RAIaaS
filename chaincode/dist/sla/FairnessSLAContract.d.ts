import { Context, Contract } from 'fabric-contract-api';
export declare class FairnessSLAContract extends Contract {
    constructor();
    SubmitMetricReport(ctx: Context, slaID: string, periodID: string, ipfsCID: string, evidenceHash: string, exposureMeritRatio: number, fuzzyLabelStr: string, complianceDegree: number): Promise<string>;
    InitiateDispute(ctx: Context, slaID: string, periodID: string, disputingProviderID: string, counterEvidenceCID: string): Promise<string>;
    ResolveDispute(ctx: Context, slaID: string, periodID: string, auditorID: string, isPlatformAtFault: boolean, auditorVerdict: string, penaltyAmount: number): Promise<void>;
    ExecuteSettlement(ctx: Context, slaID: string, periodID: string, payoutPercentage: number, slashingTriggered: boolean, penaltyAmount: number): Promise<string>;
}
//# sourceMappingURL=FairnessSLAContract.d.ts.map