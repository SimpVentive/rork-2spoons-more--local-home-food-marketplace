import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import colors from '@/constants/colors';

// This is a placeholder screen that redirects to the create-listing modal
export default function CreateScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Add a new food listing</Text>
      <Button
        title="Create Listing"
        onPress={() => router.push('/create-listing')}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
    color: colors.text,
  },
  button: {
    width: 200,
  },
});