import React from 'react';
import { Slot } from 'expo-router';

export default function RootLayout() {
  // Use only Slot at the root level to avoid navigation container conflicts
  // Child layouts will handle their specific navigation needs
  return <Slot />;
}