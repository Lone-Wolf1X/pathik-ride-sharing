import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Theme } from '../../theme/theme';
import { Search, MapPin, Bike, Car, Navigation } from 'lucide-react-native';
import OfflineMap from '../../components/common/OfflineMap';
import { useLocation } from '../../hooks/useLocation';

export default function CustomerDashboard() {
  const { location } = useLocation();
  const [selectedService, setSelectedService] = useState<'bike' | 'car'>('bike');

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
            id="userLocation"
            coordinate={[location.coords.longitude, location.coords.latitude]}
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Mapbox.PointAnnotation>
        )}
      </OfflineMap>

      <View style={styles.overlay}>
        <View style={styles.searchBar}>
          <Search size={20} color={Theme.colors.textLight} />
          <Text style={styles.searchPlaceholder}>Where to go?</Text>
        </View>

        <View style={styles.serviceSelection}>
          <Text style={styles.sectionTitle}>Select Ride</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesList}>
            <TouchableOpacity 
              style={[styles.serviceCard, selectedService === 'bike' && styles.activeServiceCard]}
              onPress={() => setSelectedService('bike')}
            >
              <Bike size={32} color={selectedService === 'bike' ? Theme.colors.white : Theme.colors.primary} />
              <Text style={[styles.serviceName, selectedService === 'bike' && styles.serviceNameActive]}>Pathik Bike</Text>
              <Text style={[styles.servicePrice, selectedService === 'bike' && styles.servicePriceActive]}>Rs. 120</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.serviceCard, selectedService === 'car' && styles.activeServiceCard]}
              onPress={() => setSelectedService('car')}
            >
              <Car size={32} color={selectedService === 'car' ? Theme.colors.white : Theme.colors.primary} />
              <Text style={[styles.serviceName, selectedService === 'car' && styles.serviceNameActive]}>Pathik Car</Text>
              <Text style={[styles.servicePrice, selectedService === 'car' && styles.servicePriceActive]}>Rs. 450</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Confirm Pickup</Text>
        </TouchableOpacity>
      </View>
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
  overlay: {
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
    shadowRadius: 10,
    elevation: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.lg,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: Theme.colors.textLight,
    marginLeft: Theme.spacing.sm,
    fontWeight: '500',
  },
  serviceSelection: {
    marginTop: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  servicesList: {
    paddingRight: Theme.spacing.lg,
  },
  serviceCard: {
    width: 120,
    height: 140,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginRight: Theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  activeServiceCard: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text,
    marginTop: Theme.spacing.sm,
  },
  serviceNameActive: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.white,
    marginTop: Theme.spacing.sm,
  },
  servicePrice: {
    fontSize: 13,
    color: Theme.colors.textLight,
    marginTop: 2,
  },
  servicePriceActive: {
    fontSize: 13,
    color: Theme.colors.white,
    opacity: 0.9,
    marginTop: 2,
  },
  confirmButton: {
    backgroundColor: Theme.colors.primary,
    height: 56,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  confirmButtonText: {
    color: Theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  userMarker: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 140, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: Theme.colors.primary,
    borderWidth: 2,
    borderColor: Theme.colors.white,
  },
});
