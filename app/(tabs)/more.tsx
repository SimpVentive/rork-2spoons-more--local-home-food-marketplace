import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';

// This is a placeholder screen that won't be directly navigated to
// It's just here to satisfy the tab navigator requirements
export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>More Options</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 18,
    color: colors.text,
  },
});