import fs from 'fs';
import path from 'path';
import { APIEndpoint, HealthCheckResult, EndpointMetrics } from '../types';

export class DatabaseService {
  private dbPath: string;
  private endpoints: Map<string, APIEndpoint> = new Map();
  private healthChecks: Map<string, HealthCheckResult[]> = new Map();

  constructor(dbPath: string = './data/db.json') {
    this.dbPath = dbPath;
    this.loadData();
  }

  private loadData(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf-8'));
        this.endpoints = new Map(Object.entries(data.endpoints || {}));
        this.healthChecks = new Map(Object.entries(data.healthChecks || {}).map(([k, v]) => [k, v as HealthCheckResult[]]));
      }
    } catch (error) {
      console.log('Creating new database...');
      this.saveData();
    }
  }

  private saveData(): void {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = {
      endpoints: Object.fromEntries(this.endpoints),
      healthChecks: Object.fromEntries(this.healthChecks)
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
  }

  addEndpoint(endpoint: APIEndpoint): void {
    this.endpoints.set(endpoint.id, endpoint);
    this.saveData();
  }

  getEndpoint(id: string): APIEndpoint | null {
    return this.endpoints.get(id) || null;
  }

  getAllEndpoints(): APIEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  updateEndpoint(id: string, updates: Partial<APIEndpoint>): boolean {
    const endpoint = this.endpoints.get(id);
    if (!endpoint) return false;
    this.endpoints.set(id, { ...endpoint, ...updates, updatedAt: Date.now() });
    this.saveData();
    return true;
  }

  deleteEndpoint(id: string): boolean {
    const deleted = this.endpoints.delete(id);
    this.healthChecks.delete(id);
    this.saveData();
    return deleted;
  }

  addHealthCheck(check: HealthCheckResult): void {
    const checks = this.healthChecks.get(check.endpointId) || [];
    checks.push(check);
    this.healthChecks.set(check.endpointId, checks);
    this.saveData();
  }

  getHealthChecks(endpointId: string, limit: number = 100): HealthCheckResult[] {
    const checks = this.healthChecks.get(endpointId) || [];
    return checks.slice(-limit).reverse();
  }

  getRecentHealthChecks(hours: number = 24): HealthCheckResult[] {
    const timestamp = Date.now() - (hours * 60 * 60 * 1000);
    const all: HealthCheckResult[] = [];
    this.healthChecks.forEach(checks => {
      all.push(...checks.filter(c => c.timestamp > timestamp));
    });
    return all.sort((a, b) => b.timestamp - a.timestamp);
  }

  getEndpointMetrics(endpointId: string, hours: number = 24): EndpointMetrics {
    const timestamp = Date.now() - (hours * 60 * 60 * 1000);
    const checks = this.healthChecks.get(endpointId) || [];
    const recent = checks.filter(c => c.timestamp > timestamp);
    
    const totalRequests = recent.length;
    const successfulRequests = recent.filter(c => c.status === 'success').length;
    const failedRequests = totalRequests - successfulRequests;
    const uptime = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    
    const successfulChecks = recent.filter(c => c.status === 'success');
    const avgResponseTime = successfulChecks.length > 0
      ? successfulChecks.reduce((sum, c) => sum + c.responseTime, 0) / successfulChecks.length
      : 0;

    let currentStatus: 'online' | 'offline' | 'degraded' = 'offline';
    if (uptime >= 99) currentStatus = 'online';
    else if (uptime >= 90) currentStatus = 'degraded';

    return {
      endpointId,
      uptime,
      avgResponseTime,
      totalRequests,
      successfulRequests,
      failedRequests,
      lastCheckTime: recent.length > 0 ? recent[recent.length - 1].timestamp : 0,
      currentStatus
    };
  }

  cleanOldHealthChecks(daysToKeep: number = 30): number {
    const timestamp = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    let deleted = 0;
    this.healthChecks.forEach((checks, endpointId) => {
      const filtered = checks.filter(c => c.timestamp > timestamp);
      deleted += checks.length - filtered.length;
      this.healthChecks.set(endpointId, filtered);
    });
    this.saveData();
    return deleted;
  }

  close(): void {
    this.saveData();
  }
}
