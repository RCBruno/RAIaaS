import express from 'express';
import cors from 'cors';
import { FabricService } from './services/fabric.service.js';
import { IPFSService } from './services/ipfs.service.js';
import { createActorRouter } from './routes/actor.routes.js';
import { createSLARouter } from './routes/sla.routes.js';
import { createMetricsRouter } from './routes/metrics.routes.js';
import { createDisputeRouter } from './routes/dispute.routes.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const fabricService = new FabricService();
  const ipfsService = new IPFSService();

  app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'RAIaaS REST API Gateway' });
  });

  app.use('/api/v1/actors', createActorRouter(fabricService));
  app.use('/api/v1/sla', createSLARouter(fabricService));
  app.use('/api/v1/metrics', createMetricsRouter(fabricService, ipfsService));
  app.use('/api/v1/dispute', createDisputeRouter(fabricService));

  return { app, fabricService, ipfsService };
}

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  const { app } = createApp();
  app.listen(PORT, () => {
    console.log(`RAIaaS API Gateway running on port ${PORT}`);
  });
}
