import { Actor, ActorRole, DisputeRecord, MetricReport, SLAContractState, SLAPlanType, SLATerms } from '@raiaas/shared';
export declare class FabricService {
    private actors;
    private slas;
    registerActor(id: string, role: ActorRole, name: string, stake: number, bond: number): Promise<Actor>;
    getActor(id: string): Promise<Actor>;
    createSLA(slaID: string, platformID: string, providerIDs: string[], planType: SLAPlanType, terms: SLATerms): Promise<SLAContractState>;
    getSLA(slaID: string): Promise<SLAContractState>;
    submitMetricReport(slaID: string, report: MetricReport): Promise<MetricReport>;
    initiateDispute(slaID: string, periodID: string, disputingProviderID: string, counterEvidenceCID: string): Promise<DisputeRecord>;
    resolveDispute(slaID: string, periodID: string, auditorID: string, isPlatformAtFault: boolean, verdict: string, penaltyAmount: number): Promise<DisputeRecord>;
    executeSettlement(slaID: string, periodID: string): Promise<MetricReport>;
}
//# sourceMappingURL=fabric.service.d.ts.map