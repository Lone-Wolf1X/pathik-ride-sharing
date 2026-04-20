import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Theme } from '../../theme/theme';
import { DollarSign, MapPin, Navigation, User } from 'lucide-react-native';
import OfflineMap from '../../components/common/OfflineMap';
import { useLocation } from '../../hooks/useLocation';
import { socketService } from '../../services/socket.service';

export default function RiderDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [tripStatus, setTripStatus] = useState<'none' | 'accepted' | 'arrived' | 'in_progress'>('none');
  const [currentRideId, setCurrentRideId] = useState<string | null>(null);
  const { location } = useLocation();

  // Connect socket on mount
  useEffect(() => {
    socketService.connect();

    // Listen for new ride requests targeting this vehicle type
    const offRequest = socketService.onNewRideRequest((data) => {
      if (isOnline && data.vehicleType === 'bike') {
        // Auto-accept for demo. In production, show a modal
        setCurrentRideId(data.rideId);
        setTripStatus('accepted');
        socketService.acceptRide(data.rideId, 'demo-rider-001', data.customerId);
      }
    });

    return () => { offRequest(); };
  }, [isOnline]);

  // Ping location every 4 seconds when on a trip
  useEffect(() => {
    if (tripStatus !== 'in_progress' || !location || !currentRideId) return;
    const interval = setInterval(() => {
      socketService.sendLocationPing(
        'demo-rider-001',
        currentRideId,
        location.coords.latitude,
        location.coords.longitude,
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [tripStatus, location, currentRideId]);

  const handleAction = () => {
    if (tripStatus === 'accepted') {
      setTripStatus('arrived');
      if (currentRideId) socketService.emitTripStatusUpdate(currentRideId, 'arrived', 'demo-rider-001');
    } else if (tripStatus === 'arrived') {
      setTripStatus('in_progress');
      if (currentRideId) socketService.emitTripStatusUpdate(currentRideId, 'in_progress', 'demo-rider-001');
    } else if (tripStatus === 'in_progress') {
      if (currentRideId) socketService.emitTripStatusUpdate(currentRideId, 'completed', 'demo-rider-001');
      setTripStatus('none');
      setCurrentRideId(null);
    }
  };

  const handleOnlineToggle = (value: boolean) => {
    setIsOnline(value);
    if (value && location) {
      socketService.goOnline('demo-rider-001', location.coords.latitude, location.coords.longitude, 'bike');
    } else {
      socketService.goOffline('demo-rider-001');
    }
  };

  const getActionButtonText = () => {
    switch (tripStatus) {
      case 'accepted': return 'Arrived at Pickup';
      case 'arrived': return 'Start Trip';
      case 'in_progress': return 'Finish Trip';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <OfflineMap
        initialRegion={{
          latitude: location?.coords.latitude || 27.7172,
          longitude: location?.coords.longitude || 85.324,
          zoom: 14,
        }}
      >
        {location && (
          <Mapbox.PointAnnotation
            id="riderLocation"
            coordinate={[location.coords.longitude, location.coords.latitude]}
          >
            <View style={styles.riderMarker}>
              <Navigation size={24} color={Theme.colors.primary} />
            </View>
          </Mapbox.PointAnnotation>
        )}
      </OfflineMap>

      <View style={styles.topBar}>
        <View style={styles.onlineStatusContainer}>
          <Text style={[styles.statusText, isOnline && styles.statusTextOnline]}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
          <Switch
            trackColor={{ false: Theme.colors.border, true: Theme.colors.primaryLight }}
            thumbColor={isOnline ? Theme.colors.primary : '#f4f3f4'}
            onValueChange={handleOnlineToggle}
            value={isOnline}
          />
        </View>

        <View style={styles.earningsContainer}>
          <DollarSign size={20} color={Theme.colors.primary} />
          <Text style={styles.earningsAmount}>Rs. 1,450</Text>
        </View>
      </View>

      {/* Dynamic Trip Action Card */}
      {tripStatus !== 'none' && (
        <View style={styles.tripCard}>
          <View style={styles.tripInfo}>
            <User size={24} color={Theme.colors.text} />
            <View style={styles.tripTextContainer}>
              <Text style={styles.customerName}>Abhisek Paswan</Text>
              <Text style={styles.tripSub}>{tripStatus === 'accepted' ? 'Picking up...' : 'Dropping off...'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={handleAction}>
            <Text style={styles.actionButtonText}>{getActionButtonText()}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isOnline && tripStatus === 'none' && (
        <View style={styles.offlineOverlay}>
          <View style={styles.offlineCard}>
            <Text style={styles.offlineTitle}>You are Offline</Text>
            <Text style={styles.offlineSub}>Go online to start receiving ride requests in your area.</Text>
            <TouchableOpacity
              style={styles.goOnlineButton}
              onPress={() => setIsOnline(true)}
            >
              <Text style={styles.goOnlineText}>Go Online</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isOnline && (
        <View style={styles.waitingContainer}>
          <View style={styles.pulseContainer}>
            {/* Simulation of a pulse animation could go here */}
            <View style={styles.pulseCircle} />
          </View>
          <Text style={styles.waitingText}>Finding rides nearby...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: Theme.spacing.lg,
    right: Theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onlineStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.round,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Theme.colors.textLight,
    marginRight: Theme.spacing.sm,
  },
  statusTextOnline: {
    color: Theme.colors.primary,
  },
  earningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.round,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  earningsAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginLeft: 4,
  },
  offlineOverlay: {
    position: 'absolute',
    bottom: 40,
    left: Theme.spacing.lg,
    right: Theme.spacing.lg,
  },
  offlineCard: {
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  offlineSub: {
    fontSize: 14,
    color: Theme.colors.textLight,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  goOnlineButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    width: '100%',
    alignItems: 'center',
  },
  goOnlineText: {
    color: Theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  riderMarker: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  waitingContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    alignItems: 'center',
  },
  pulseContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary,
    opacity: 0.2,
    marginBottom: Theme.spacing.md,
  },
  waitingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.primary,
    backgroundColor: Theme.colors.background,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.round,
  },
  tripCard: {
    position: 'absolute',
    bottom: 40,
    left: Theme.spacing.lg,
    right: Theme.spacing.lg,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  tripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  tripTextContainer: {
    marginLeft: Theme.spacing.md,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  tripSub: {
    fontSize: 14,
    color: Theme.colors.textLight,
  },
  actionButton: {
    backgroundColor: Theme.colors.primary,
    height: 56,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: Theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
