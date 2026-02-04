import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { HealthCheckResult, WebSocketEvent } from '../types';

export class WebSocketService {
  private io: SocketIOServer;
  private connectedClients: number = 0;

  constructor(server: HTTPServer, corsOrigin: string) {
    this.io = new SocketIOServer(server, {
      cors: { origin: corsOrigin, methods: ['GET', 'POST'] }
    });
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      this.connectedClients++;
      console.log(`Client connected (Total: ${this.connectedClients})`);
      socket.on('disconnect', () => {
        this.connectedClients--;
        console.log(`Client disconnected (Total: ${this.connectedClients})`);
      });
      socket.emit('connected', { message: 'Connected', timestamp: Date.now() });
    });
  }

  broadcastHealthCheck(result: HealthCheckResult): void {
    const event: WebSocketEvent = { type: 'health_check', data: result, timestamp: Date.now() };
    this.io.emit('health_check', event);
  }

  broadcastEndpointAdded(endpointId: string): void {
    const event: WebSocketEvent = { type: 'endpoint_added', data: { endpointId }, timestamp: Date.now() };
    this.io.emit('endpoint_added', event);
  }

  broadcastEndpointRemoved(endpointId: string): void {
    const event: WebSocketEvent = { type: 'endpoint_removed', data: { endpointId }, timestamp: Date.now() };
    this.io.emit('endpoint_removed', event);
  }

  getConnectedClients(): number {
    return this.connectedClients;
  }

  close(): void {
    this.io.close();
  }
}
