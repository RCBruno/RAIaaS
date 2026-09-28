import request from 'supertest';
import { createApp } from '../src/app.js';
import { ActorRole, SLAPlanType } from '@raiaas/shared';

describe('RAIaaS REST API Gateway End-to-End Flow', () => {
  const { app } = createApp();

  test('GET /health returns status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  test('Complete SLA Lifecycle via REST Endpoints', async () => {
    // 1. Register Platform Actor
    const platformRes = await request(app)
      .post('/api/v1/actors/register')
      .send({
        id: 'platform-art-1',
        role: ActorRole.PLATFORM,
        name: 'Artisan Marketplace',
        stake: 0,
        bond: 10000
      });
    expect(platformRes.status).toBe(201);
    expect(platformRes.body.id).toBe('platform-art-1');

    // 2. Register Provider Actor
    const providerRes = await request(app)
      .post('/api/v1/actors/register')
      .send({
        id: 'artist-indie-1',
        role: ActorRole.PROVIDER,
        name: 'Indie Artist Studio',
        stake: 1000,
        bond: 0
      });
    expect(providerRes.status).toBe(201);

    // 3. Create SLA Contract
    const slaRes = await request(app)
      .post('/api/v1/sla/create')
      .send({
        slaID: 'sla-artisan-2026',
        platformID: 'platform-art-1',
        providerIDs: ['artist-indie-1'],
        planType: SLAPlanType.STANDARD,
        targetRatio: 1.0,
        reportingIntervalHours: 24,
        bondReq: 5000,
        stakeReq: 500
      });
    expect(slaRes.status).toBe(201);
    expect(slaRes.body.slaID).toBe('sla-artisan-2026');

    // 4. Submit Metrics & Run Fuzzy Engine Evaluation + IPFS Upload
    const metricsRes = await request(app)
      .post('/api/v1/metrics/submit')
      .send({
        slaID: 'sla-artisan-2026',
        periodID: '2026-Q3-W1',
        platformID: 'platform-art-1',
        rawMetrics: [
          { providerID: 'artist-indie-1', exposureCount: 100, meritScore: 100 }
        ],
        baseFee: 1000,
        bondAmount: 5000
      });
    expect(metricsRes.status).toBe(201);
    expect(metricsRes.body.fuzzyResult.primaryLabel).toBe('EXCELLENT');
    expect(metricsRes.body.settlementAction.payoutPercentage).toBe(100);
    expect(metricsRes.body.ipfsCID).toBeDefined();

    // 5. Open Dispute
    const disputeOpenRes = await request(app)
      .post('/api/v1/dispute/open')
      .send({
        slaID: 'sla-artisan-2026',
        periodID: '2026-Q3-W1',
        disputingProviderID: 'artist-indie-1',
        counterEvidenceCID: 'bafybeicounterevidencecid123'
      });
    expect(disputeOpenRes.status).toBe(201);
    expect(disputeOpenRes.body.status).toBe('OPEN');

    // 6. Resolve Dispute
    const disputeResolveRes = await request(app)
      .post('/api/v1/dispute/resolve')
      .send({
        slaID: 'sla-artisan-2026',
        periodID: '2026-Q3-W1',
        auditorID: 'auditor-independent-1',
        isPlatformAtFault: false,
        verdict: 'Log verification shows exposure was fair',
        penaltyAmount: 0
      });
    expect(disputeResolveRes.status).toBe(200);
    expect(disputeResolveRes.body.status).toBe('REJECTED');

    // 7. Execute Settlement
    const settleRes = await request(app)
      .post('/api/v1/dispute/settle')
      .send({
        slaID: 'sla-artisan-2026',
        periodID: '2026-Q3-W1'
      });
    expect(settleRes.status).toBe(200);
    expect(settleRes.body.settlementExecuted).toBe(true);
  });
});
