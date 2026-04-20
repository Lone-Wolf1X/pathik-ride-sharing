import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Theme } from '../../theme/theme';
import { CheckCircle, AlertCircle, CreditCard } from 'lucide-react-native';

const API_BASE = 'http://localhost:3000'; // Change to real server IP for device testing

interface PaymentScreenProps {
  rideId: string;
  amount: number;         // In Rs. (e.g., 120)
  vehicleType: 'bike' | 'car';
  customerId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type PayState = 'idle' | 'loading' | 'success' | 'failed';

export default function PaymentScreen({
  rideId,
  amount,
  vehicleType,
  customerId,
  onSuccess,
  onCancel,
}: PaymentScreenProps) {
  const [state, setState] = useState<PayState>('idle');
  const [message, setMessage] = useState('');

  //
  // Step 1: Initiate payment → get Khalti payment URL → open it
  //
  const handlePay = async () => {
    setState('loading');
    try {
      const res = await fetch(`${API_BASE}/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId, amount, customerId, vehicleType }),
      });
      const data = await res.json();

      if (!data.payment_url) throw new Error('No payment URL received');

      // Open Khalti payment page in device browser / WebView
      await Linking.openURL(data.payment_url);

      // In production, handle deep-link callback (pathik://payment/callback?pidx=xxx)
      // For testing: show a manual verify button after redirect
      setState('idle');
      setMessage(`pidx: ${data.pidx}`);
    } catch (err) {
      setState('failed');
      setMessage('Could not initiate payment. Check server connection.');
    }
  };

  //
  // Step 2: After Khalti redirects back, verify with backend
  // (In real app, this is triggered by deep-link listener)
  //
  const handleVerify = async (pidx: string) => {
    setState('loading');
    try {
      const res = await fetch(`${API_BASE}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pidx, rideId }),
      });
      const data = await res.json();

      if (data.success) {
        setState('success');
        setMessage(`Payment of Rs. ${data.amount} confirmed! ✅`);
        setTimeout(onSuccess, 2000);
      } else {
        setState('failed');
        setMessage(`Payment status: ${data.status}`);
      }
    } catch {
      setState('failed');
      setMessage('Verification failed. Retry or contact support.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <CreditCard size={32} color={Theme.colors.primary} />
        <Text style={styles.title}>Pay for your Ride</Text>
        <Text style={styles.subtitle}>Secure payment powered by Khalti</Text>
      </View>

      {/* Amount Card */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Total Amount</Text>
        <Text style={styles.amountValue}>Rs. {amount}</Text>
        <Text style={styles.amountSub}>
          Pathik {vehicleType === 'bike' ? 'Bike' : 'Car'} • 1 ride
        </Text>
      </View>

      {/* === TEST GUIDE CARD (only visible in dev) === */}
      <View style={styles.testGuide}>
        <Text style={styles.testTitle}>🧪 Sandbox Test Mode</Text>
        <Text style={styles.testLine}>Phone: <Text style={styles.testValue}>9800000000</Text></Text>
        <Text style={styles.testLine}>MPIN:  <Text style={styles.testValue}>1111</Text></Text>
        <Text style={styles.testLine}>OTP:   <Text style={styles.testValue}>987654</Text></Text>
        <Text style={styles.testNote}>No real money deducted</Text>
      </View>

      {/* Status Feedback */}
      {state === 'loading' && (
        <View style={styles.feedbackRow}>
          <ActivityIndicator color={Theme.colors.primary} />
          <Text style={styles.feedbackText}>Processing...</Text>
        </View>
      )}
      {state === 'success' && (
        <View style={styles.feedbackRow}>
          <CheckCircle size={20} color={Theme.colors.success} />
          <Text style={[styles.feedbackText, { color: Theme.colors.success }]}>{message}</Text>
        </View>
      )}
      {state === 'failed' && (
        <View style={styles.feedbackRow}>
          <AlertCircle size={20} color={Theme.colors.error} />
          <Text style={[styles.feedbackText, { color: Theme.colors.error }]}>{message}</Text>
        </View>
      )}

      {/* Pay Button */}
      {state !== 'success' && (
        <TouchableOpacity
          style={[styles.payBtn, state === 'loading' && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={state === 'loading'}
        >
          <Text style={styles.payBtnText}>
            {state === 'loading' ? 'Opening Khalti...' : `Pay Rs. ${amount} via Khalti`}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    marginTop: Theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.text,
    marginTop: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.textLight,
    marginTop: 4,
  },
  amountCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.lg,
  },
  amountLabel: {
    fontSize: 13,
    color: Theme.colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: '900',
    color: Theme.colors.primary,
    marginVertical: 4,
  },
  amountSub: {
    fontSize: 14,
    color: Theme.colors.textLight,
  },
  testGuide: {
    backgroundColor: '#FFFDE7',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#FFF176',
  },
  testTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F57F17',
    marginBottom: Theme.spacing.xs,
  },
  testLine: {
    fontSize: 13,
    color: '#795548',
    marginBottom: 2,
  },
  testValue: {
    fontWeight: '700',
    color: '#212121',
  },
  testNote: {
    fontSize: 11,
    color: Theme.colors.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    gap: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: Theme.colors.text,
    flexShrink: 1,
  },
  payBtn: {
    backgroundColor: Theme.colors.primary,
    height: 58,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  payBtnDisabled: {
    opacity: 0.6,
  },
  payBtnText: {
    color: Theme.colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  cancelBtn: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: Theme.colors.textLight,
    fontSize: 15,
  },
});
