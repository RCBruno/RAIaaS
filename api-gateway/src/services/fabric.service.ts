import { Actor, ActorRole, ActorStatus, DisputeRecord, DisputeStatus, MetricReport, SLAContractState, SLAPlanType, SLAStatus, SLATerms } from '@raiaas/shared';

export class FabricService {
  private actors: Map<string, Actor> = new Map();
  private slas: Map<string, SLAContractState> = new Map();

  public async registerActor(
    id: string,
    role: ActorRole,
    name: string,
    stake: number,
    bond: number
  ): Promise<Actor> {
    const actor: Actor = {
      id,
      mspID: role === ActorRole.PLATFORM ? 'PlatformMSP' : role === ActorRole.PROVIDER ? 'ProviderMSP' : 'AuditorMSP',
      role,
      name,
      stakeBalance: stake,
      bondBalance: bond,
      status: ActorStatus.ACTIVE,
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.actors.set(id, actor);
    return actor;
  }

  public async getActor(id: string): Promise<Actor> {
    const actor = this.actors.get(id);
    if (!actor) {
      throw new Error(`Actor ${id} not found.`);
    }
    return actor;
  }

  public async createSLA(
    slaID: string,
    platformID: string,
    providerIDs: string[],
    planType: SLAPlanType,
    terms: SLATerms
  ): Promise<SLAContractState> {
    const sla: SLAContractState = {
      slaID,
      factoryID: 'FairnessSLAFactory_v1',
      platformID,
      providerIDs,
      planType,
      status: SLAStatus.ACTIVE,
      terms,
      reports: {},
      disputes: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.slas.set(slaID, sla);
    return sla;
  }

  public async getSLA(slaID: string): Promise<SLAContractState> {
    const sla = this.slas.get(slaID);
    if (!sla) {
      throw new Error(`SLA ${slaID} not found.`);
    }
    return sla;
  }

  public async submitMetricReport(
    slaID: string,
    report: MetricReport
  ): Promise<MetricReport> {
    const sla = await this.getSLA(slaID);
    sla.reports[report.periodID] = report;
    sla.updatedAt = new Date().toISOString();
    return report;
  }

  public async initiateDispute(
    slaID: string,
    periodID: string,
    disputingProviderID: string,
    counterEvidenceCID: string
  ): Promise<DisputeRecord> {
    const sla = await this.getSLA(slaID);
    const report = sla.reports[periodID];
    if (!report) {
      throw new Error(`Report ${periodID} not found.`);
    }

    const dispute: DisputeRecord = {
      periodID,
      disputingProviderID,
      counterEvidenceCID,
      openedAt: new Date().toISOString(),
      status: DisputeStatus.OPEN
    };

    sla.disputes[periodID] = dispute;
    report.disputeStatus = DisputeStatus.OPEN;
    sla.status = SLAStatus.DISPUTED;
    sla.updatedAt = new Date().toISOString();

    return dispute;
  }

  public async resolveDispute(
    slaID: string,
    periodID: string,
    auditorID: string,
    isPlatformAtFault: boolean,
    verdict: string,
    penaltyAmount: number
  ): Promise<DisputeRecord> {
    const sla = await this.getSLA(slaID);
    const dispute = sla.disputes[periodID];
    if (!dispute) {
      throw new Error(`Dispute for period ${periodID} not found.`);
    }

    dispute.auditorID = auditorID;
    dispute.auditorVerdict = verdict;
    dispute.resolvedAt = new Date().toISOString();

    if (isPlatformAtFault) {
      dispute.status = DisputeStatus.RESOLVED_PLATFORM_FAULT;
      dispute.penaltyAmount = penaltyAmount;
      sla.reports[periodID].disputeStatus = DisputeStatus.RESOLVED_PLATFORM_FAULT;

      const platform = this.actors.get(sla.platformID);
      if (platform) {
        platform.bondBalance = Math.max(0, platform.bondBalance - penaltyAmount);
      }
    } else {
      dispute.status = DisputeStatus.REJECTED;
      sla.reports[periodID].disputeStatus = DisputeStatus.REJECTED;
    }

    sla.status = SLAStatus.ACTIVE;
    sla.updatedAt = new Date().toISOString();

    return dispute;
  }

  public async executeSettlement(
    slaID: string,
    periodID: string
  ): Promise<MetricReport> {
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
