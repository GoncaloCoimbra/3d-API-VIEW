export interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  healthCheckInterval: number;
  headers?: Record<string, string>;
  expectedStatusCode?: number;
  timeout?: number;
  createdAt: number;
  updatedAt: number;
}

export interface HealthCheckResult {
  id: string;
  endpointId: string;
  timestamp: number;
  status: 'success' | 'error' | 'timeout';
  statusCode?: number;
  responseTime: number;
  errorMessage?: string;
}

export interface EndpointMetrics {
  endpointId: string;
  uptime: number;
  avgResponseTime: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastCheckTime: number;
  currentStatus: 'online' | 'offline' | 'degraded';
}

export interface DashboardStats {
  totalEndpoints: number;
  onlineEndpoints: number;
  offlineEndpoints: number;
  degradedEndpoints: number;
  avgResponseTimeAll: number;
  totalRequests24h: number;
  successRate24h: number;
}

export interface AlertConfig {
  id: string;
  endpointId: string;
  type: 'downtime' | 'latency' | 'error_rate';
  threshold: number;
  enabled: boolean;
  notificationChannels: ('email' | 'slack' | 'webhook')[];
}

export interface WebSocketEvent {
  type: 'health_check' | 'endpoint_added' | 'endpoint_removed' | 'alert';
  data: any;
  timestamp: number;
}
