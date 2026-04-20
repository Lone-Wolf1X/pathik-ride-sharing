import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000/pathik'; // Change to prod URL when deploying

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('[Pathik Socket] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('[Pathik Socket] Disconnected');
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  // ─── RIDER ACTIONS ────────────────────────────────────────────────────────

  goOnline(userId: string, lat: number, lng: number, vehicleType: string) {
    this.socket?.emit('riderOnline', { userId, lat, lng, vehicleType });
  }

  goOffline(userId: string) {
    this.socket?.emit('riderOffline', { userId });
  }

  sendLocationPing(userId: string, rideId: string, lat: number, lng: number) {
    this.socket?.emit('locationPing', { userId, rideId, lat, lng });
  }

  emitTripStatusUpdate(rideId: string, status: string, riderId: string) {
    this.socket?.emit('updateTripStatus', { rideId, status, riderId });
  }

  acceptRide(rideId: string, riderId: string, customerId: string) {
    this.socket?.emit('acceptRide', { rideId, riderId, customerId });
  }

  // ─── CUSTOMER ACTIONS ─────────────────────────────────────────────────────

  requestRide(data: {
    rideId: string;
    customerId: string;
    pickup: { lat: number; lng: number };
    dropoff: { lat: number; lng: number };
    vehicleType: string;
  }) {
    this.socket?.emit('requestRide', data);
  }

  fetchActiveRiders() {
    this.socket?.emit('getActiveRiders');
  }

  // ─── LISTENERS ────────────────────────────────────────────────────────────

  onRiderLocationUpdate(cb: (data: { lat: number; lng: number; rideId: string }) => void) {
    this.socket?.on('riderLocationUpdate', cb);
    return () => this.socket?.off('riderLocationUpdate', cb);
  }

  onTripStatusChanged(cb: (data: { rideId: string; status: string }) => void) {
    this.socket?.on('tripStatusChanged', cb);
    return () => this.socket?.off('tripStatusChanged', cb);
  }

  onRideAccepted(cb: (data: { rideId: string; riderId: string }) => void) {
    this.socket?.on('rideAccepted', cb);
    return () => this.socket?.off('rideAccepted', cb);
  }

  onNewRideRequest(cb: (data: any) => void) {
    this.socket?.on('newRideRequest', cb);
    return () => this.socket?.off('newRideRequest', cb);
  }

  onActiveRidersUpdate(cb: (riders: any[]) => void) {
    this.socket?.on('activeRidersUpdate', cb);
    return () => this.socket?.off('activeRidersUpdate', cb);
  }
}

export const socketService = new SocketService();
