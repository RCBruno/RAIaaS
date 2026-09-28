import { Router } from 'express';
import { FabricService } from '../services/fabric.service.js';

export function createActorRouter(fabricService: FabricService): Router {
  const router = Router();

  router.post('/register', async (req, res) => {
    try {
      const { id, role, name, stake, bond } = req.body;
      const actor = await fabricService.registerActor(id, role, name, Number(stake || 0), Number(bond || 0));
      res.status(201).json(actor);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const actor = await fabricService.getActor(req.params.id);
      res.json(actor);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  return router;
}
