import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Theme } from '../../theme/theme';
import { MapPin, Phone, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth.store';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (phoneNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await login(phoneNumber);
    } catch (error) {
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MapPin size={48} color={Theme.colors.primary} />
            <Text style={styles.appName}>Pathik</Text>
          </View>
          <Text style={styles.tagline}>Your companion on every journey</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+977</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="98XXXXXXXX"
              keyboardType="phone-pad"
              placeholderTextColor={Theme.colors.textLight}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              maxLength={10}
            />
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && { opacity: 0.7 }]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Verifying...' : 'Get OTP'}
            </Text>
            {!isLoading && <ArrowRight size={20} color={Theme.colors.white} />}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: Theme.colors.primary,
    marginLeft: Theme.spacing.xs,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: Theme.colors.textLight,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
    height: 56,
  },
  countryCode: {
    width: 70,
    backgroundColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  input: {
    flex: 1,
    paddingHorizontal: Theme.spacing.md,
    fontSize: 18,
    color: Theme.colors.text,
  },
  loginButton: {
    backgroundColor: Theme.colors.primary,
    height: 56,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: Theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: Theme.spacing.sm,
  },
  footer: {
    marginTop: Theme.spacing.xxl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
