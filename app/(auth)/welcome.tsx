import React from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe' }}
        style={styles.backgroundImage}
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appName}>2Spoons More</Text>
          <Text style={styles.tagline}>Homemade food, shared with love</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.description}>
            Connect with home chefs in your neighborhood and discover delicious homemade meals
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Login"
              onPress={() => router.push('/(auth)/login' as any)}
              variant="primary"
              style={styles.button}
            />
            
            <Button
              title="Create Account"
              onPress={() => router.push('/(auth)/register' as any)}
              variant="outline"
              style={styles.registerButton}
              textStyle={styles.registerButtonText}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  header: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: colors.white,
    opacity: 0.9,
  },
  footer: {
    width: '100%',
  },
  description: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
  },
  registerButton: {
    borderColor: colors.white,
    width: '100%',
  },
  registerButtonText: {
    color: colors.white,
  },
});