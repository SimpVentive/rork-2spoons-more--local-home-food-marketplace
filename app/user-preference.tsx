import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag, ChefHat } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function UserPreferenceScreen() {
  const [selectedOption, setSelectedOption] = useState<'buyer' | 'seller' | null>(null);
  const { updateUserPreference, user } = useAuthStore();
  const router = useRouter();

  const handleContinue = async () => {
    if (!selectedOption) return;
    
    await updateUserPreference(selectedOption);
    
    if (selectedOption === 'buyer') {
      router.replace('/(tabs)');
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How will you use HomeCook?</Text>
        <Text style={styles.subtitle}>You can change this later in your profile settings</Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedOption === 'buyer' && styles.selectedCard
            ]}
            onPress={() => setSelectedOption('buyer')}
          >
            <View style={[
              styles.iconContainer,
              selectedOption === 'buyer' && styles.selectedIconContainer
            ]}>
              <ShoppingBag 
                size={32} 
                color={selectedOption === 'buyer' ? colors.white : colors.primary} 
              />
            </View>
            <Text style={styles.optionTitle}>I Buy Home Cooked Food</Text>
            <Text style={styles.optionDescription}>
              Browse and order delicious homemade food from local chefs
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedOption === 'seller' && styles.selectedCard
            ]}
            onPress={() => setSelectedOption('seller')}
          >
            <View style={[
              styles.iconContainer,
              selectedOption === 'seller' && styles.selectedIconContainer
            ]}>
              <ChefHat 
                size={32} 
                color={selectedOption === 'seller' ? colors.white : colors.primary} 
              />
            </View>
            <Text style={styles.optionTitle}>I Sell Home Cooked Food</Text>
            <Text style={styles.optionDescription}>
              Share your culinary creations and earn by selling homemade food
            </Text>
          </TouchableOpacity>
        </View>
        
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedOption}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 20,
    marginBottom: 40,
  },
  optionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedIconContainer: {
    backgroundColor: colors.primary,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  continueButton: {
    marginTop: 20,
  },
});