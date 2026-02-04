export interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  status: "online" | "offline" | "slow" | "error";
  responseTime: number;
  lastChecked: string;
  uptime: number;
  errorRate: number;
  category?: string;
  tags?: string[];
  relatedEndpoints?: string[];
}

export interface HistoryPoint {
  timestamp: string;
  responseTime: number;
  status: ApiEndpoint["status"];
  errorRate: number;
}

export interface EndpointHistory {
  endpointId: string;
  points: HistoryPoint[];
}

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertType = "endpoint_down" | "slow_response" | "high_error_rate" | "endpoint_recovered";

export interface Alert {
  id: string;
  endpointId: string;
  endpointName: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  read: boolean;
}

export type ExportFormat = "pdf" | "csv";
