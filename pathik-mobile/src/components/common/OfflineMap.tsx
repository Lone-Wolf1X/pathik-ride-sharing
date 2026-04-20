import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Theme } from '../../theme/theme';

// Public Mapbox token for development testing
// Replace with your own token from: https://account.mapbox.com (free account)
// IMPORTANT: Replace with your own token from: https://account.mapbox.com
Mapbox.setAccessToken('YOUR_MAPBOX_ACCESS_TOKEN_HERE');


interface OfflineMapProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
  onMapLoaded?: () => void;
  children?: React.ReactNode;
}

const OfflineMap = ({ initialRegion, onMapLoaded, children }: OfflineMapProps) => {
  const cameraRef = useRef<Mapbox.Camera>(null);

  useEffect(() => {
    // Initialization logic for offline tiles would go here
    // e.g. Mapbox.offlineManager.createPack(...)
  }, []);

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Light} // Fallback to light style, would eventually be local style.json
        onDidFinishLoadingMap={onMapLoaded}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={initialRegion?.zoom || 12}
          centerCoordinate={[initialRegion?.longitude || 85.324, initialRegion?.latitude || 27.7172]}
          animationMode="flyTo"
          animationDuration={2000}
        />
        {children}
      </Mapbox.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default OfflineMap;
