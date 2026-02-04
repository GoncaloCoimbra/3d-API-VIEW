import { Router, Request, Response } from 'express';
import { DatabaseService } from '../services/database.service';
import { DashboardStats } from '../types';

export function createMetricsRouter(db: DatabaseService): Router {
  const router = Router();

  router.get('/:endpointId', (req: Request, res: Response) => {
    const { endpointId } = req.params;
    const endpoint = db.getEndpoint(endpointId);
    if (!endpoint) return res.status(404).json({ success: false, error: 'Endpoint not found' });
    const metrics = db.getEndpointMetrics(endpointId, 24);
    res.json({ success: true, data: metrics });
  });

  router.get('/dashboard/stats', (req: Request, res: Response) => {
    const endpoints = db.getAllEndpoints();
    const recentChecks = db.getRecentHealthChecks(24);
    
    let onlineCount = 0, offlineCount = 0, degradedCount = 0;
    endpoints.forEach(endpoint => {
      const metrics = db.getEndpointMetrics(endpoint.id, 24);
      if (metrics.currentStatus === 'online') onlineCount++;
      else if (metrics.currentStatus === 'offline') offlineCount++;
      else degradedCount++;
    });

    const successfulChecks = recentChecks.filter(c => c.status === 'success').length;
    const successRate = recentChecks.length > 0 ? (successfulChecks / recentChecks.length) * 100 : 0;

    const stats: DashboardStats = {
      totalEndpoints: endpoints.length,
      onlineEndpoints: onlineCount,
      offlineEndpoints: offlineCount,
      degradedEndpoints: degradedCount,
      avgResponseTimeAll: 0,
      totalRequests24h: recentChecks.length,
      successRate24h: successRate
    };

    res.json({ success: true, data: stats });
  });

  return router;
}
