import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { DisputeRecord, DisputeStatus, LinguisticLabel, MetricReport, SLAContractState, SLAStatus } from '@raiaas/shared';

@Info({ title: 'FairnessSLAContract', description: 'Manages reporting periods, IPFS evidence links, disputes, and graduated fuzzy settlements' })
export class FairnessSLAContract extends Contract {
  constructor() {
    super('FairnessSLAContract');
  }

  @Transaction()
  @Returns('string')
  public async SubmitMetricReport(
    ctx: Context,
    slaID: string,
    periodID: string,
    ipfsCID: string,
    evidenceHash: string,
    exposureMeritRatio: number,
    fuzzyLabelStr: string,
    complianceDegree: number
  ): Promise<string> {
    const key = `SLA_${slaID}`;
    const bytes = await ctx.stub.getState(key);
    if (!bytes || bytes.length === 0) {
      throw new Error(`SLA contract ${slaID} does not exist.`);
    }

    const sla: SLAContractState = JSON.parse(Buffer.from(bytes).toString('utf8'));
    if (sla.status === SLAStatus.TERMINATED) {
      throw new Error(`SLA contract ${slaID} is terminated.`);
    }

    const fuzzyLabel = fuzzyLabelStr as LinguisticLabel;

    const report: MetricReport = {
      periodID,
      timestamp: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString(),
      ipfsCID,
      evidenceHash,
      exposureMeritRatio: Number(exposureMeritRatio),
      fuzzyLabel,
      complianceDegree: Number(complianceDegree),
      disputeStatus: DisputeStatus.NONE,
      settlementExecuted: false
    };

    sla.reports[periodID] = report;
    sla.updatedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(sla)));
    ctx.stub.setEvent('MetricReportSubmitted', Buffer.from(JSON.stringify({ slaID, periodID, ipfsCID, exposureMeritRatio, fuzzyLabel, complianceDegree })));

    return JSON.stringify(report);
  }

  @Transaction()
  @Returns('string')
  public async InitiateDispute(
    ctx: Context,
    slaID: string,
    periodID: string,
    disputingProviderID: string,
    counterEvidenceCID: string
  ): Promise<string> {
    const key = `SLA_${slaID}`;
    const bytes = await ctx.stub.getState(key);
    if (!bytes || bytes.length === 0) {
      throw new Error(`SLA contract ${slaID} does not exist.`);
    }

    const sla: SLAContractState = JSON.parse(Buffer.from(bytes).toString('utf8'));
    const report = sla.reports[periodID];
    if (!report) {
      throw new Error(`Report for period ${periodID} does not exist in SLA ${slaID}.`);
    }

    if (report.settlementExecuted) {
      throw new Error(`Period ${periodID} has already been settled and cannot be disputed.`);
    }

    const dispute: DisputeRecord = {
      periodID,
      disputingProviderID,
      counterEvidenceCID,
      openedAt: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString(),
      status: DisputeStatus.OPEN
    };

    sla.disputes[periodID] = dispute;
    report.disputeStatus = DisputeStatus.OPEN;
    sla.status = SLAStatus.DISPUTED;
    sla.updatedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(sla)));
    ctx.stub.setEvent('DisputeOpened', Buffer.from(JSON.stringify({ slaID, periodID, disputingProviderID, counterEvidenceCID })));

    return JSON.stringify(dispute);
  }

  @Transaction()
  public async ResolveDispute(
    ctx: Context,
    slaID: string,
    periodID: string,
    auditorID: string,
    isPlatformAtFault: boolean,
    auditorVerdict: string,
    penaltyAmount: number
  ): Promise<void> {
    const key = `SLA_${slaID}`;
    const bytes = await ctx.stub.getState(key);
    if (!bytes || bytes.length === 0) {
      throw new Error(`SLA contract ${slaID} does not exist.`);
    }

    const sla: SLAContractState = JSON.parse(Buffer.from(bytes).toString('utf8'));
    const dispute = sla.disputes[periodID];
    if (!dispute) {
      throw new Error(`No dispute found for period ${periodID} in SLA ${slaID}.`);
    }

    dispute.auditorID = auditorID;
    dispute.auditorVerdict = auditorVerdict;
    dispute.resolvedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

    if (isPlatformAtFault) {
      dispute.status = DisputeStatus.RESOLVED_PLATFORM_FAULT;
      dispute.penaltyAmount = Number(penaltyAmount);
      sla.reports[periodID].disputeStatus = DisputeStatus.RESOLVED_PLATFORM_FAULT;

      // Deduct penalty from platform bond in FairnessRegistry if available
      const platformActorKey = `ACTOR_${sla.platformID}`;
      const platformBytes = await ctx.stub.getState(platformActorKey);
      if (platformBytes && platformBytes.length > 0) {
        const platformActor = JSON.parse(Buffer.from(platformBytes).toString('utf8'));
        platformActor.bondBalance = Math.max(0, platformActor.bondBalance - Number(penaltyAmount));
        await ctx.stub.putState(platformActorKey, Buffer.from(JSON.stringify(platformActor)));
      }
    } else {
      dispute.status = DisputeStatus.REJECTED;
      sla.reports[periodID].disputeStatus = DisputeStatus.REJECTED;
    }

    sla.status = SLAStatus.ACTIVE;
    sla.updatedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(sla)));
    ctx.stub.setEvent('DisputeResolved', Buffer.from(JSON.stringify({ slaID, periodID, isPlatformAtFault, penaltyAmount })));
  }

  @Transaction()
  @Returns('string')
  public async ExecuteSettlement(
    ctx: Context,
    slaID: string,
    periodID: string,
    payoutPercentage: number,
    slashingTriggered: boolean,
    penaltyAmount: number
  ): Promise<string> {
    const key = `SLA_${slaID}`;
    const bytes = await ctx.stub.getState(key);
    if (!bytes || bytes.length === 0) {
      throw new Error(`SLA contract ${slaID} does not exist.`);
    }

    const sla: SLAContractState = JSON.parse(Buffer.from(bytes).toString('utf8'));
    const report = sla.reports[periodID];
    if (!report) {
      throw new Error(`Report for period ${periodID} does not exist.`);
    }

    if (report.disputeStatus === DisputeStatus.OPEN) {
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
}
