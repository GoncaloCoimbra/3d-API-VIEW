import axios, { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { APIEndpoint, HealthCheckResult } from '../types';
import { DatabaseService } from './database.service';
import { EventEmitter } from 'events';

export class HealthCheckService extends EventEmitter {
  private db: DatabaseService;
  private activeChecks: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;

  constructor(db: DatabaseService) {
    super();
    this.db = db;
  }

  startMonitoring(endpoint: APIEndpoint): void {
    this.stopMonitoring(endpoint.id);
    this.performHealthCheck(endpoint);
    const intervalId = setInterval(() => this.performHealthCheck(endpoint), endpoint.healthCheckInterval);
    this.activeChecks.set(endpoint.id, intervalId);
    console.log(`Started monitoring: ${endpoint.name}`);
  }

  stopMonitoring(endpointId: string): void {
    const intervalId = this.activeChecks.get(endpointId);
    if (intervalId) {
      clearInterval(intervalId);
      this.activeChecks.delete(endpointId);
    }
  }

  startAll(): void {
    if (this.isRunning) return;
    const endpoints = this.db.getAllEndpoints();
    endpoints.forEach(endpoint => this.startMonitoring(endpoint));
    this.isRunning = true;
  }

  stopAll(): void {
    this.activeChecks.forEach((intervalId) => clearInterval(intervalId));
    this.activeChecks.clear();
    this.isRunning = false;
  }

  private async performHealthCheck(endpoint: APIEndpoint): Promise<void> {
    const startTime = Date.now();
    const checkId = uuidv4();

    try {
      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        headers: endpoint.headers || {},
        timeout: endpoint.timeout || 10000,
        validateStatus: () => true
      });

      const responseTime = Date.now() - startTime;
      const expectedCode = endpoint.expectedStatusCode || 200;
      const isSuccess = response.status === expectedCode;

      const result: HealthCheckResult = {
        id: checkId,
        endpointId: endpoint.id,
        timestamp: Date.now(),
        status: isSuccess ? 'success' : 'error',
        statusCode: response.status,
        responseTime,
        errorMessage: isSuccess ? undefined : `Expected ${expectedCode}, got ${response.status}`
      };

      this.db.addHealthCheck(result);
      this.emit('healthCheck', result);
      console.log(`${endpoint.name}: ${response.status} (${responseTime}ms)`);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const axiosError = error as AxiosError;
      let status: 'error' | 'timeout' = 'error';
      let errorMessage = axiosError.message || 'Unknown error';

      if (axiosError.code === 'ECONNABORTED') {
        status = 'timeout';
        errorMessage = 'Request timeout';
      }

      const result: HealthCheckResult = {
        id: checkId,
        endpointId: endpoint.id,
        timestamp: Date.now(),
        status,
        responseTime,
        errorMessage
      };

      this.db.addHealthCheck(result);
      this.emit('healthCheck', result);
      console.log(`${endpoint.name}: ${errorMessage}`);
    }
  }

  async checkNow(endpointId: string): Promise<HealthCheckResult | null> {
    const endpoint = this.db.getEndpoint(endpointId);
    if (!endpoint) return null;
    await this.performHealthCheck(endpoint);
    const checks = this.db.getHealthChecks(endpointId, 1);
    return checks[0] || null;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      activeEndpoints: this.activeChecks.size,
      monitoredEndpoints: Array.from(this.activeChecks.keys())
    };
  }
}
