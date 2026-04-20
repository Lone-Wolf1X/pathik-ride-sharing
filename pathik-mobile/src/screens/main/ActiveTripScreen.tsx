import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Theme } from '../../theme/theme';
import { MapPin, Phone, X, CheckCircle } from 'lucide-react-native';
import OfflineMap from '../../components/common/OfflineMap';
import { useLocation } from '../../hooks/useLocation';
import { socketService } from '../../services/socket.service';

type TripPhase = 'idle' | 'searching' | 'accepted' | 'in_progress' | 'completed';

interface RiderMarker {
  lat: number;
  lng: number;
}

export default function ActiveTripScreen() {
  const { location } = useLocation();
  const [phase, setPhase] = useState<TripPhase>('idle');
  const [riderPos, setRiderPos] = useState<RiderMarker | null>(null);
  const [currentRideId] = useState('demo-ride-001'); // Would come from navigation params
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cameraRef = useRef<Mapbox.Camera>(null);

  // Pulse animation while searching
  useEffect(() => {
    if (phase !== 'searching') return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [phase]);

  // Socket listeners
  useEffect(() => {
    socketService.connect();

    // Listen for rider accepting
    const offAccepted = socketService.onRideAccepted(({ rideId }) => {
      if (rideId === currentRideId) setPhase('accepted');
    });

    // Live location update from rider
    const offLocation = socketService.onRiderLocationUpdate(({ lat, lng, rideId }) => {
      if (rideId === currentRideId) {
        const newPos = { lat, lng };
        setRiderPos(newPos);
        // Animate camera to follow rider
        cameraRef.current?.setCamera({
          centerCoordinate: [lng, lat],
          animationMode: 'easeTo',
          animationDuration: 1000,
        });
      }
    });

    // Listen for trip status changes
    const offStatus = socketService.onTripStatusChanged(({ rideId, status }) => {
      if (rideId !== currentRideId) return;
      if (status === 'in_progress') setPhase('in_progress');
      if (status === 'completed') setPhase('completed');
    });

    return () => {
      offAccepted();
      offLocation();
      offStatus();
    };
  }, []);

  const handleRequestRide = () => {
    setPhase('searching');
    if (!location) return;
    socketService.requestRide({
      rideId: currentRideId,
      customerId: 'demo-customer-001',
      pickup: { lat: location.coords.latitude, lng: location.coords.longitude },
      dropoff: { lat: 27.6727, lng: 85.3124 }, // Example: Patan
      vehicleType: 'bike',
    });
  };

  const handleCancel = () => {
    setPhase('idle');
    setRiderPos(null);
  };

  return (
    <View style={styles.container}>
      <OfflineMap
        initialRegion={{
          latitude: location?.coords.latitude || 27.7172,
          longitude: location?.coords.longitude || 85.324,
          zoom: 14,
        }}
        onMapLoaded={() => console.log('[Pathik] Map ready')}
      >
        {/* Camera ref for animated following */}
        <Mapbox.Camera ref={cameraRef} />

        {/* Customer's own position */}
        {location && (
          <Mapbox.PointAnnotation
            id="customerPin"
            coordinate={[location.coords.longitude, location.coords.latitude]}
          >
            <View style={styles.customerMarker}>
              <View style={styles.customerDot} />
            </View>
          </Mapbox.PointAnnotation>
        )}

        {/* Live rider position */}
        {riderPos && (
          <Mapbox.PointAnnotation
            id="riderPin"
            coordinate={[riderPos.lng, riderPos.lat]}
          >
            <View style={styles.riderLiveMarker}>
              <MapPin size={28} color={Theme.colors.primary} />
            </View>
          </Mapbox.PointAnnotation>
        )}
      </OfflineMap>

      {/* ── IDLE: Request button ── */}
      {phase === 'idle' && (
        <View style={styles.bottomCard}>
          <Text style={styles.cardTitle}>Ready to ride?</Text>
          <Text style={styles.cardSub}>Your current location has been detected.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleRequestRide}>
            <Text style={styles.primaryBtnText}>Confirm Pickup</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── SEARCHING: Pulse animation ── */}
      {phase === 'searching' && (
        <View style={styles.bottomCard}>
          <View style={styles.pulseRow}>
            <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
            <View style={styles.pulseCore} />
          </View>
          <Text style={styles.cardTitle}>Finding your rider...</Text>
          <Text style={styles.cardSub}>Connecting you to a nearby driver</Text>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <X size={16} color={Theme.colors.primary} />
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── ACCEPTED: Rider is coming ── */}
      {phase === 'accepted' && (
        <View style={styles.bottomCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusLabel}>Rider is on the way</Text>
          </View>
          <Text style={styles.cardTitle}>Your ride is confirmed!</Text>
          <Text style={styles.cardSub}>Watch the rider approach on the map.</Text>
          <TouchableOpacity style={styles.outlineBtn}>
            <Phone size={18} color={Theme.colors.primary} />
            <Text style={styles.outlineBtnText}>Call Rider</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── IN PROGRESS ── */}
      {phase === 'in_progress' && (
        <View style={styles.bottomCard}>
          <View style={[styles.statusRow, { backgroundColor: '#FFF3E0' }]}>
            <View style={[styles.statusDot, { backgroundColor: Theme.colors.primary }]} />
            <Text style={styles.statusLabel}>Trip in progress</Text>
          </View>
          <Text style={styles.cardTitle}>Enjoy your ride!</Text>
          <Text style={styles.cardSub}>Heading to your destination.</Text>
        </View>
      )}

      {/* ── COMPLETED ── */}
      {phase === 'completed' && (
        <View style={styles.bottomCard}>
          <CheckCircle size={48} color={Theme.colors.success} style={{ alignSelf: 'center', marginBottom: 12 }} />
          <Text style={[styles.cardTitle, { textAlign: 'center' }]}>You've arrived!</Text>
          <Text style={[styles.cardSub, { textAlign: 'center' }]}>Thank you for riding with Pathik.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setPhase('idle')}>
            <Text style={styles.primaryBtnText}>Rate Your Rider</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl + 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: Theme.colors.textLight,
    marginBottom: Theme.spacing.lg,
  },
  primaryBtn: {
    backgroundColor: Theme.colors.primary,
    height: 56,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: {
    color: Theme.colors.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
  cancelBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
  },
  cancelBtnText: {
    color: Theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  outlineBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
  },
  outlineBtnText: {
    color: Theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  pulseRow: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginBottom: Theme.spacing.md,
  },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,140,0,0.2)',
  },
  pulseCore: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.success,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  customerMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,140,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Theme.colors.primary,
    borderWidth: 2,
    borderColor: Theme.colors.white,
  },
  riderLiveMarker: {
    backgroundColor: Theme.colors.white,
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
