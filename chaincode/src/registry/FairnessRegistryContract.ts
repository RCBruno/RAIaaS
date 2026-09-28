import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Actor, ActorRole, ActorStatus } from '@raiaas/shared';

@Info({ title: 'FairnessRegistryContract', description: 'Manages actor identities, MSP mappings, stakes, bonds, and global ethical thresholds' })
export class FairnessRegistryContract extends Contract {
  constructor() {
    super('FairnessRegistryContract');
  }

  @Transaction()
  public async InitLedger(ctx: Context): Promise<void> {
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

  @Transaction()
  @Returns('string')
  public async RegisterActor(
    ctx: Context,
    actorID: string,
    roleStr: string,
    name: string,
    initialStake: number,
    initialBond: number
  ): Promise<string> {
    const key = `ACTOR_${actorID}`;
    const existingBytes = await ctx.stub.getState(key);
    if (existingBytes && existingBytes.length > 0) {
      throw new Error(`Actor ${actorID} is already registered.`);
    }

    const clientMSP = ctx.clientIdentity.getMSPID();
    const role = roleStr as ActorRole;

    const actor: Actor = {
      id: actorID,
      mspID: clientMSP || 'PlatformMSP',
      role,
      name,
      stakeBalance: Number(initialStake),
      bondBalance: Number(initialBond),
      status: ActorStatus.ACTIVE,
      registeredAt: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString(),
      updatedAt: new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString()
    };

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(actor)));
    ctx.stub.setEvent('ActorRegistered', Buffer.from(JSON.stringify({ actorID, role, mspID: clientMSP })));

    return JSON.stringify(actor);
  }

  @Transaction()
  @Returns('string')
  public async GetActor(ctx: Context, actorID: string): Promise<string> {
    const key = `ACTOR_${actorID}`;
    const bytes = await ctx.stub.getState(key);
    if (!bytes || bytes.length === 0) {
      throw new Error(`Actor ${actorID} does not exist.`);
    }
    return Buffer.from(bytes).toString('utf8');
  }

  @Transaction()
  public async DepositStake(ctx: Context, actorID: string, amount: number): Promise<void> {
    const key = `ACTOR_${actorID}`;
    const bytes = await ctx.stub.getState(key);
    if (!bytes || bytes.length === 0) {
      throw new Error(`Actor ${actorID} does not exist.`);
    }

    const actor: Actor = JSON.parse(Buffer.from(bytes).toString('utf8'));
    actor.stakeBalance += Number(amount);
    actor.updatedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(actor)));
    ctx.stub.setEvent('StakeDeposited', Buffer.from(JSON.stringify({ actorID, newBalance: actor.stakeBalance })));
  }

  @Transaction()
  public async DepositBond(ctx: Context, actorID: string, amount: number): Promise<void> {
    const key = `ACTOR_${actorID}`;
    const bytes = await ctx.stub.getState(key);
    if (!bytes || bytes.length === 0) {
      throw new Error(`Actor ${actorID} does not exist.`);
    }

    const actor: Actor = JSON.parse(Buffer.from(bytes).toString('utf8'));
    actor.bondBalance += Number(amount);
    actor.updatedAt = new Date(ctx.stub.getTxTimestamp().seconds.low * 1000).toISOString();

    await ctx.stub.putState(key, Buffer.from(JSON.stringify(actor)));
    ctx.stub.setEvent('BondDeposited', Buffer.from(JSON.stringify({ actorID, newBalance: actor.bondBalance })));
  }

  @Transaction()
  public async SetEthicalThreshold(
    ctx: Context,
    thresholdID: string,
    metricName: string,
    minRatio: number,
    maxRatio: number
  ): Promise<void> {
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
}
