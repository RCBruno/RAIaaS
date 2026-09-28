import { FairnessRegistryContract } from '../src/registry/FairnessRegistryContract.js';
import { FairnessSLAFactoryContract } from '../src/factory/FairnessSLAFactoryContract.js';
import { FairnessSLAContract } from '../src/sla/FairnessSLAContract.js';
import { ActorRole, SLAPlanType } from '@raiaas/shared';

// Create a mock Fabric Context & ChaincodeStub
function createMockContext() {
  const stateMap = new Map<string, Buffer>();
  const eventsMap = new Map<string, Buffer>();

  const stub = {
    getState: jest.fn(async (key: string) => stateMap.get(key) || null),
    putState: jest.fn(async (key: string, value: Buffer) => { stateMap.set(key, value); }),
    setEvent: jest.fn((name: string, payload: Buffer) => { eventsMap.set(name, payload); }),
    getTxTimestamp: jest.fn(() => ({ seconds: { low: 1700000000 } }))
  };

  const clientIdentity = {
    getMSPID: jest.fn(() => 'PlatformMSP')
  };

  return {
    ctx: { stub, clientIdentity } as any,
    stateMap,
    eventsMap
  };
}

describe('Hyperledger Fabric Chaincode Contracts', () => {
  const registry = new FairnessRegistryContract();
  const factory = new FairnessSLAFactoryContract();
  const slaContract = new FairnessSLAContract();

  test('FairnessRegistry registers platform and provider actors', async () => {
    const { ctx, stateMap, eventsMap } = createMockContext();

    const platformJson = await registry.RegisterActor(
      ctx,
      'platform-1',
      ActorRole.PLATFORM,
      'ArtMarketplace AI',
      0,
      10000
    );

    const platformObj = JSON.parse(platformJson);
    expect(platformObj.id).toBe('platform-1');
    expect(platformObj.bondBalance).toBe(10000);
    expect(stateMap.has('ACTOR_platform-1')).toBe(true);
    expect(eventsMap.has('ActorRegistered')).toBe(true);
  });

  test('FairnessSLAFactory instantiates an SLA contract', async () => {
    const { ctx, stateMap } = createMockContext();

    const fuzzyConfig = {
      name: 'DefaultScale',
      labels: ['POOR', 'ACCEPTABLE', 'GOOD', 'EXCELLENT'],
      membershipFunctions: []
    };

    const slaJson = await factory.CreateSLA(
      ctx,
      'sla-100',
      'platform-1',
      JSON.stringify(['provider-a', 'provider-b']),
      SLAPlanType.STANDARD,
      1.0,
      24,
      JSON.stringify(fuzzyConfig),
      5000,
      500
    );

    const slaObj = JSON.parse(slaJson);
    expect(slaObj.slaID).toBe('sla-100');
    expect(slaObj.providerIDs).toEqual(['provider-a', 'provider-b']);
    expect(stateMap.has('SLA_sla-100')).toBe(true);
  });

  test('FairnessSLAContract manages metric reporting, disputes, and settlement', async () => {
    const { ctx } = createMockContext();

    const fuzzyConfig = { name: 'Scale', labels: [], membershipFunctions: [] };
    await factory.CreateSLA(
      ctx,
      'sla-100',
      'platform-1',
      JSON.stringify(['provider-a']),
      SLAPlanType.STANDARD,
      1.0,
      24,
      JSON.stringify(fuzzyConfig),
      5000,
      500
    );

    // Submit Metric Report
    const reportJson = await slaContract.SubmitMetricReport(
      ctx,
      'sla-100',
      'period-1',
      'QmHash123IPFS',
      'sha256HashPayload',
      1.0,
      'EXCELLENT',
      1.0
    );
    const reportObj = JSON.parse(reportJson);
    expect(reportObj.periodID).toBe('period-1');
    expect(reportObj.ipfsCID).toBe('QmHash123IPFS');

    // Initiate Dispute
    const disputeJson = await slaContract.InitiateDispute(
      ctx,
      'sla-100',
      'period-1',
      'provider-a',
      'QmCounterEvidenceCID'
    );
    const disputeObj = JSON.parse(disputeJson);
    expect(disputeObj.status).toBe('OPEN');

    // Resolve Dispute
    await slaContract.ResolveDispute(
      ctx,
      'sla-100',
      'period-1',
      'auditor-1',
      true,
      'Platform ranking bias confirmed',
      1000
    );

    // Execute Settlement
    const settlementJson = await slaContract.ExecuteSettlement(
      ctx,
      'sla-100',
      'period-1',
      0,
      true,
      1000
    );
    const settlementObj = JSON.parse(settlementJson);
    expect(settlementObj.slashingTriggered).toBe(true);
  });
});
