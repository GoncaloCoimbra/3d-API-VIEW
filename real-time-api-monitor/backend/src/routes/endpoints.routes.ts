import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../services/database.service';
import { HealthCheckService } from '../services/healthCheck.service';
import { WebSocketService } from '../services/websocket.service';
import { APIEndpoint } from '../types';

export function createEndpointsRouter(db: DatabaseService, healthCheckService: HealthCheckService, wsService: WebSocketService): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    const endpoints = db.getAllEndpoints();
    res.json({ success: true, data: endpoints, count: endpoints.length });
  });

  router.get('/:id', (req: Request, res: Response) => {
    const endpoint = db.getEndpoint(req.params.id);
    if (!endpoint) return res.status(404).json({ success: false, error: 'Endpoint not found' });
    res.json({ success: true, data: endpoint });
  });

  router.post('/', (req: Request, res: Response) => {
    const { name, url, method, healthCheckInterval, headers, expectedStatusCode, timeout } = req.body;
    if (!name || !url || !method) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const endpoint: APIEndpoint = {
      id: uuidv4(),
      name,
      url,
      method: method.toUpperCase(),
      healthCheckInterval: healthCheckInterval || 30000,
      headers: headers || {},
      expectedStatusCode: expectedStatusCode || 200,
      timeout: timeout || 10000,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    db.addEndpoint(endpoint);
    healthCheckService.startMonitoring(endpoint);
    wsService.broadcastEndpointAdded(endpoint.id);
    res.status(201).json({ success: true, data: endpoint });
  });

  router.delete('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const endpoint = db.getEndpoint(id);
    if (!endpoint) return res.status(404).json({ success: false, error: 'Endpoint not found' });
    
    healthCheckService.stopMonitoring(id);
    db.deleteEndpoint(id);
    wsService.broadcastEndpointRemoved(id);
    res.json({ success: true, message: 'Endpoint deleted' });
  });

  return router;
}
