import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { Theme } from '../../theme/theme';
import { User, Bike } from 'lucide-react-native';

interface RoleSwitcherProps {
  currentRole: 'customer' | 'rider';
  onRoleChange: (role: 'customer' | 'rider') => void;
}

export default function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.option,
          currentRole === 'customer' && styles.activeOption,
        ]}
        onPress={() => onRoleChange('customer')}
      >
        <User
          size={20}
          color={currentRole === 'customer' ? Theme.colors.white : Theme.colors.textLight}
        />
        <Text
          style={[
            styles.optionText,
            currentRole === 'customer' && styles.activeOptionText,
          ]}
        >
          Customer
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          currentRole === 'rider' && styles.activeOption,
        ]}
        onPress={() => onRoleChange('rider')}
      >
        <Bike
          size={20}
          color={currentRole === 'rider' ? Theme.colors.white : Theme.colors.textLight}
        />
        <Text
          style={[
            styles.optionText,
            currentRole === 'rider' && styles.activeOptionText,
          ]}
        >
          Rider
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    padding: 4,
    borderRadius: Theme.borderRadius.round,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    width: 240,
    alignSelf: 'center',
    marginTop: Theme.spacing.md,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.round,
  },
  activeOption: {
    backgroundColor: Theme.colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textLight,
    marginLeft: Theme.spacing.xs,
  },
  activeOptionText: {
    color: Theme.colors.white,
  },
});
