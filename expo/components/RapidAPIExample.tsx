import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { RapidAPIClient } from '@/utils/rapidapi';
import { useWeatherAPI } from '@/utils/useRapidAPI';
import { trpc } from '@/lib/trpc';

interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
    };
  };
}

export function RapidAPIExample() {
  const [location, setLocation] = useState<string>('London');
  const [manualWeather, setManualWeather] = useState<WeatherData | null>(null);
  const [manualLoading, setManualLoading] = useState<boolean>(false);

  // Method 1: Using custom hook
  const { data: hookWeather, loading: hookLoading, error: hookError } = useWeatherAPI(
    location,
    process.env.EXPO_PUBLIC_RAPIDAPI_KEY || '',
    !!location
  );

  // Method 2: Using tRPC (backend integration)
  const weatherQuery = trpc.rapidapi.weather.useQuery(
    { location },
    { enabled: !!location }
  );

  // Method 3: Manual API call using RapidAPIClient
  const handleManualFetch = async () => {
    if (!process.env.EXPO_PUBLIC_RAPIDAPI_KEY) {
      Alert.alert('Error', 'RapidAPI key not configured');
      return;
    }

    setManualLoading(true);
    try {
      const weatherAPI = new RapidAPIClient({
        host: 'weatherapi-com.p.rapidapi.com',
        key: process.env.EXPO_PUBLIC_RAPIDAPI_KEY,
      });

      const data = await weatherAPI.get<WeatherData>('/current.json', {
        q: location,
      });

      setManualWeather(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch weather data');
      console.error('Manual fetch error:', error);
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RapidAPI Integration Examples</Text>
      
      <Input
        label="Location"
        value={location}
        onChangeText={setLocation}
        placeholder="Enter city name"
        style={styles.input}
      />

      {/* Method 1: Custom Hook */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Method 1: Custom Hook</Text>
        {hookLoading && <ActivityIndicator />}
        {hookError && <Text style={styles.error}>Error: {hookError}</Text>}
        {hookWeather && (
          <View style={styles.weatherCard}>
            <Text style={styles.weatherLocation}>
              {hookWeather.location?.name}, {hookWeather.location?.country}
            </Text>
            <Text style={styles.weatherTemp}>
              {hookWeather.current?.temp_c}°C
            </Text>
            <Text style={styles.weatherCondition}>
              {hookWeather.current?.condition?.text}
            </Text>
          </View>
        )}
      </View>

      {/* Method 2: tRPC */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Method 2: tRPC Backend</Text>
        {weatherQuery.isLoading && <ActivityIndicator />}
        {weatherQuery.error && (
          <Text style={styles.error}>Error: {weatherQuery.error.message}</Text>
        )}
        {weatherQuery.data && (
          <View style={styles.weatherCard}>
            <Text style={styles.weatherLocation}>
              {weatherQuery.data.location?.name}
            </Text>
            <Text style={styles.weatherTemp}>
              {weatherQuery.data.current?.temp_c}°C
            </Text>
          </View>
        )}
      </View>

      {/* Method 3: Manual Client */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Method 3: Manual Client</Text>
        <Button
          title="Fetch Weather Manually"
          onPress={handleManualFetch}
          disabled={manualLoading}
        />
        {manualLoading && <ActivityIndicator style={styles.loader} />}
        {manualWeather && (
          <View style={styles.weatherCard}>
            <Text style={styles.weatherLocation}>
              {manualWeather.location?.name}, {manualWeather.location?.country}
            </Text>
            <Text style={styles.weatherTemp}>
              {manualWeather.current?.temp_c}°C
            </Text>
            <Text style={styles.weatherCondition}>
              {manualWeather.current?.condition?.text}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  weatherCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  weatherLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  weatherTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginVertical: 5,
  },
  weatherCondition: {
    fontSize: 14,
    color: '#666',
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 5,
  },
  loader: {
    marginTop: 10,
  },
});