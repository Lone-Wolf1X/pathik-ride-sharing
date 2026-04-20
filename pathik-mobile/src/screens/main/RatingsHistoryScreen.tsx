import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Theme } from '../../theme/theme';
import { Star, MapPin, Clock, RotateCcw } from 'lucide-react-native';

// ── Star Rating Component ─────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onChange(star)}>
          <Star
            size={36}
            color={star <= value ? Theme.colors.primary : Theme.colors.border}
            fill={star <= value ? Theme.colors.primary : 'transparent'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Mock past trips data ──────────────────────────────────────
const PAST_TRIPS = [
  {
    id: 'trip_001',
    date: 'Apr 19, 2026 • 10:42 AM',
    from: 'New Baneshwor, Kathmandu',
    to: 'Patan Dhoka, Lalitpur',
    vehicle: 'Bike',
    fare: 120,
    status: 'completed',
    rating: 5,
  },
  {
    id: 'trip_002',
    date: 'Apr 18, 2026 • 7:15 PM',
    from: 'Thamel, Kathmandu',
    to: 'Chabahil, Kathmandu',
    vehicle: 'Car',
    fare: 450,
    status: 'completed',
    rating: 4,
  },
  {
    id: 'trip_003',
    date: 'Apr 16, 2026 • 2:30 PM',
    from: 'Koteshwor, Kathmandu',
    to: 'Bhaktapur Durbar Square',
    vehicle: 'Bike',
    fare: 180,
    status: 'completed',
    rating: 0,
  },
];

export default function RatingsAndHistoryScreen() {
  const [activeTab, setActiveTab] = useState<'history' | 'rate'>('history');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitRating = () => {
    if (rating === 0) return;
    setSubmitted(true);
  };

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Trip History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rate' && styles.activeTab]}
          onPress={() => setActiveTab('rate')}
        >
          <Text style={[styles.tabText, activeTab === 'rate' && styles.activeTabText]}>
            Rate Rider
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && (
        <ScrollView contentContainerStyle={styles.list}>
          {PAST_TRIPS.map((trip) => (
            <View key={trip.id} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <View style={[
                  styles.vehicleBadge,
                  { backgroundColor: trip.vehicle === 'Bike' ? '#FFF3E0' : '#E3F2FD' }
                ]}>
                  <Text style={[
                    styles.vehicleText,
                    { color: trip.vehicle === 'Bike' ? Theme.colors.primary : '#1565C0' }
                  ]}>
                    {trip.vehicle}
                  </Text>
                </View>
                <Text style={styles.tripDate}>{trip.date}</Text>
              </View>

              <View style={styles.routeRow}>
                <View style={styles.routeDots}>
                  <View style={styles.dotFilled} />
                  <View style={styles.routeLine} />
                  <View style={styles.dotEmpty} />
                </View>
                <View style={styles.routeLabels}>
                  <Text style={styles.routeText} numberOfLines={1}>{trip.from}</Text>
                  <Text style={styles.routeText} numberOfLines={1}>{trip.to}</Text>
                </View>
              </View>

              <View style={styles.tripFooter}>
                <Text style={styles.fareText}>Rs. {trip.fare}</Text>
                <View style={styles.ratingRow}>
                  {trip.rating > 0 ? (
                    <>
                      <Star size={14} color={Theme.colors.primary} fill={Theme.colors.primary} />
                      <Text style={styles.ratingText}>{trip.rating}.0</Text>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.rateNowBtn}
                      onPress={() => setActiveTab('rate')}
                    >
                      <Text style={styles.rateNowText}>Rate Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── RATE TAB ── */}
      {activeTab === 'rate' && (
        <ScrollView contentContainerStyle={styles.rateContainer}>
          {submitted ? (
            <View style={styles.successCard}>
              <Text style={styles.successEmoji}>🙏</Text>
              <Text style={styles.successTitle}>Thank you!</Text>
              <Text style={styles.successSub}>
                Your rating helps us improve Pathik for all riders.
              </Text>
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => { setSubmitted(false); setRating(0); setReview(''); setActiveTab('history'); }}
              >
                <Text style={styles.doneBtnText}>Back to History</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.rateTitle}>How was your last ride?</Text>
              <Text style={styles.rateSub}>Trip from New Baneshwor → Patan Dhoka</Text>

              <StarRating value={rating} onChange={setRating} />

              <Text style={styles.ratingHint}>
                {rating === 0 ? 'Tap a star to rate' :
                 rating === 1 ? '😞 Very Poor' :
                 rating === 2 ? '😐 Fair' :
                 rating === 3 ? '🙂 Good' :
                 rating === 4 ? '😊 Great' : '🤩 Excellent!'}
              </Text>

              <TextInput
                style={styles.reviewInput}
                placeholder="Leave a comment (optional)..."
                placeholderTextColor={Theme.colors.textLight}
                multiline
                numberOfLines={4}
                value={review}
                onChangeText={setReview}
              />

              <TouchableOpacity
                style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
                onPress={handleSubmitRating}
                disabled={rating === 0}
              >
                <Text style={styles.submitBtnText}>Submit Rating</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderColor: Theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: Theme.colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.textLight,
  },
  activeTabText: { color: Theme.colors.primary },
  list: { padding: Theme.spacing.lg, gap: 12 },
  tripCard: {
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  vehicleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.round,
  },
  vehicleText: { fontSize: 12, fontWeight: '700' },
  tripDate: { fontSize: 12, color: Theme.colors.textLight },
  routeRow: { flexDirection: 'row', marginBottom: Theme.spacing.md },
  routeDots: { alignItems: 'center', marginRight: 12, paddingTop: 4 },
  dotFilled: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Theme.colors.primary,
  },
  routeLine: {
    width: 2, height: 24, backgroundColor: Theme.colors.border, marginVertical: 2,
  },
  dotEmpty: {
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 2, borderColor: Theme.colors.primary,
  },
  routeLabels: { flex: 1, justifyContent: 'space-between', height: 50 },
  routeText: { fontSize: 14, color: Theme.colors.text },
  tripFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fareText: { fontSize: 18, fontWeight: '800', color: Theme.colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '600', color: Theme.colors.text },
  rateNowBtn: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Theme.borderRadius.round,
  },
  rateNowText: { color: Theme.colors.primary, fontSize: 12, fontWeight: '700' },
  rateContainer: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
    paddingTop: Theme.spacing.xxl,
  },
  rateTitle: {
    fontSize: 24, fontWeight: '800',
    color: Theme.colors.text, marginBottom: 4, textAlign: 'center',
  },
  rateSub: {
    fontSize: 14, color: Theme.colors.textLight,
    marginBottom: Theme.spacing.xl, textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row', gap: 8, marginBottom: Theme.spacing.md,
  },
  ratingHint: {
    fontSize: 18, fontWeight: '600',
    color: Theme.colors.primary, marginBottom: Theme.spacing.xl,
  },
  reviewInput: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.md,
    fontSize: 15,
    color: Theme.colors.text,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: Theme.spacing.xl,
  },
  submitBtn: {
    backgroundColor: Theme.colors.primary,
    width: '100%',
    height: 56,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: Theme.colors.white, fontSize: 17, fontWeight: '700' },
  successCard: { alignItems: 'center', paddingTop: Theme.spacing.xxl },
  successEmoji: { fontSize: 64, marginBottom: Theme.spacing.md },
  successTitle: {
    fontSize: 28, fontWeight: '900',
    color: Theme.colors.text, marginBottom: 8,
  },
  successSub: {
    fontSize: 15, color: Theme.colors.textLight,
    textAlign: 'center', marginBottom: Theme.spacing.xl, lineHeight: 22,
  },
  doneBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.xxl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  doneBtnText: { color: Theme.colors.white, fontSize: 16, fontWeight: '700' },
});
