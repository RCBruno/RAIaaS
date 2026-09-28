import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { FuzzyScaleConfig, SLAContractState, SLAPlanType, SLAStatus, SLATerms } from '@raiaas/shared';

@Info({ title: 'FairnessSLAFactoryContract', description: 'Instantiates and tracks single-provider and group-provider Fairness SLA contracts' })
export class FairnessSLAFactoryContract extends Contract {
  constructor() {
    super('FairnessSLAFactoryContract');
  }

  @Transaction()
  @Returns('string')
  public async CreateSLA(
    ctx: Context,
    slaID: string,
    platformID: string,
    providerIDsJson: string, // JSON string array of provider IDs
    planTypeStr: string,
    targetRatio: number,
    reportingIntervalHours: number,
    fuzzyScaleConfigJson: string,
    bondReq: number,
    stakeReq: number
  ): Promise<string> {
    const key = `SLA_${slaID}`;
    const existingBytes = await ctx.stub.getState(key);
    if (existingBytes && existingBytes.length > 0) {
      throw new Error(`SLA contract ${slaID} already exists.`);
    }

    const providerIDs: string[] = JSON.parse(providerIDsJson);
    const fuzzyScaleConfig: FuzzyScaleConfig = JSON.parse(fuzzyScaleConfigJson);
    const planType = planTypeStr as SLAPlanType;

    const terms: SLATerms = {
      targetExposureMeritRatio: Number(targetRatio),
      reportingIntervalHours: Number(reportingIntervalHours),
      fuzzyScaleConfig,
      platformBondRequirement: Number(bondReq),
      providerStakeRequirement: Number(stakeReq)
    };

    const slaState: SLAContractState = {
      slaID,
      factoryID: 'FairnessSLAFactory_v1',
      platformID,
      providerIDs,
      planType,
      status: SLAStatus.ACTIVE,
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

  @Transaction()
  @Returns('string')
  public async GetSLA(ctx: Context, slaID: string): Promise<string> {
    const key = `SLA_${slaID}`;
    const bytes = await ctx.stub.getState(key);
    if (!bytes || bytes.length === 0) {
      throw new Error(`SLA contract ${slaID} does not exist.`);
    }
    return Buffer.from(bytes).toString('utf8');
  }

  @Transaction()
  @Returns('string')
  public async DeactivateSLA(ctx: Context, slaID: string): Promise<void> {
    const key = `SLA_${slaID}`;
    const bytes = await ctx.stub.getState(key);
    if (!bytes || bytes.length === 0) {
      throw new Error(`SLA contract ${slaID} does not exist.`);
    }

    const sla: SLAContractState = JSON.parse(Buffer.from(bytes).toString('utf8'));
    sla.status = SLAStatus.TERMINATED;
    sla.updatedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(sla)));
    ctx.stub.setEvent('SLADeactivated', Buffer.from(JSON.stringify({ slaID })));
  }
}
