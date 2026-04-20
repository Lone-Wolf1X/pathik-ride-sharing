import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ActiveRider {
  userId: string;
  lat: number;
  lng: number;
  vehicleType: string;
  socketId: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'pathik',
})
export class MapGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // In-memory store: userId -> ActiveRider
  private activeRiders = new Map<string, ActiveRider>();
  // Trip rooms: rideId -> { customerId, riderId }
  private activeRooms = new Map<string, { customerId: string; riderId: string }>();

  handleConnection(client: Socket) {
    console.log(`[Pathik Socket] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Pathik Socket] Client disconnected: ${client.id}`);
    // Remove the rider from the active list on disconnect
    for (const [userId, rider] of this.activeRiders.entries()) {
      if (rider.socketId === client.id) {
        this.activeRiders.delete(userId);
        // Notify customers that rider went offline
        this.server.emit('riderWentOffline', { userId });
        break;
      }
    }
  }

  // ─── RIDER ────────────────────────────────────────────────────────────────

  /** Rider goes online and broadcasts their location */
  @SubscribeMessage('riderOnline')
  handleRiderOnline(
    @MessageBody() data: { userId: string; lat: number; lng: number; vehicleType: string },
    @ConnectedSocket() client: Socket,
  ) {
    const rider: ActiveRider = { ...data, socketId: client.id };
    this.activeRiders.set(data.userId, rider);
    // Announce to all customers
    this.server.emit('activeRidersUpdate', Array.from(this.activeRiders.values()));
    console.log(`[Pathik] Rider ${data.userId} is online`);
  }

  /** Rider goes offline */
  @SubscribeMessage('riderOffline')
  handleRiderOffline(@MessageBody() data: { userId: string }) {
    this.activeRiders.delete(data.userId);
    this.server.emit('activeRidersUpdate', Array.from(this.activeRiders.values()));
  }

  /** Rider sends location ping every few seconds during a trip */
  @SubscribeMessage('locationPing')
  handleLocationPing(
    @MessageBody() data: { userId: string; rideId: string; lat: number; lng: number },
  ) {
    // Update in-memory store
    const rider = this.activeRiders.get(data.userId);
    if (rider) {
      rider.lat = data.lat;
      rider.lng = data.lng;
    }
    // Emit only to the room for this trip
    const room = this.activeRooms.get(data.rideId);
    if (room) {
      this.server.to(`ride_${data.rideId}`).emit('riderLocationUpdate', {
        lat: data.lat,
        lng: data.lng,
        rideId: data.rideId,
      });
    }
  }

  /** Rider updates the trip status (arrived, in_progress, completed) */
  @SubscribeMessage('updateTripStatus')
  handleTripStatusUpdate(
    @MessageBody() data: { rideId: string; status: string; riderId: string },
  ) {
    this.server.to(`ride_${data.rideId}`).emit('tripStatusChanged', {
      rideId: data.rideId,
      status: data.status,
    });
  }

  // ─── CUSTOMER ─────────────────────────────────────────────────────────────

  /** Customer requests a ride — emits to all active riders nearby */
  @SubscribeMessage('requestRide')
  handleRequestRide(
    @MessageBody() data: {
      rideId: string;
      customerId: string;
      pickup: { lat: number; lng: number };
      dropoff: { lat: number; lng: number };
      vehicleType: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    // Customer joins their ride room
    client.join(`ride_${data.rideId}`);
    // Broadcast to all riders (in production, filter by proximity and vehicle type)
    this.server.emit('newRideRequest', data);
    console.log(`[Pathik] Ride ${data.rideId} requested by ${data.customerId}`);
  }

  /** Rider accepts a ride — join room and notify customer */
  @SubscribeMessage('acceptRide')
  handleAcceptRide(
    @MessageBody() data: { rideId: string; riderId: string; customerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Rider joins the trip room
    client.join(`ride_${data.rideId}`);
    // Register room
    this.activeRooms.set(data.rideId, { customerId: data.customerId, riderId: data.riderId });
    // Notify customer
    this.server.to(`ride_${data.rideId}`).emit('rideAccepted', {
      rideId: data.rideId,
      riderId: data.riderId,
    });
    console.log(`[Pathik] Ride ${data.rideId} accepted by rider ${data.riderId}`);
  }

  /** Get list of all current active riders (used on app load) */
  @SubscribeMessage('getActiveRiders')
  handleGetActiveRiders(@ConnectedSocket() client: Socket) {
    client.emit('activeRidersUpdate', Array.from(this.activeRiders.values()));
  }
}
