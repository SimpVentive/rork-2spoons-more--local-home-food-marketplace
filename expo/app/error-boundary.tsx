import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import colors from '@/constants/colors';

interface Props {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Simplified error handling for better Android compatibility
function logError(error: any, errorInfo?: any) {
  console.error('App Error:', error);
  if (errorInfo) {
    console.error('Error Info:', errorInfo);
  }
  
  // Android-specific error logging
  if (Platform.OS === 'android') {
    console.warn('Android Error Details:', {
      message: error?.message,
      name: error?.name,
      componentStack: errorInfo?.componentStack?.slice(0, 500), // Limit stack size
    });
  }
  
  // Only send to parent on web
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      window.parent.postMessage({
        type: 'ERROR',
        error: {
          message: error?.message || 'Unknown error',
          stack: error?.stack,
        }
      }, '*');
    } catch {
      // Ignore postMessage errors
    }
  }
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, errorInfo);
    
    // Android-specific error recovery
    if (Platform.OS === 'android') {
      // Try to recover from common Android errors
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 3000);
    }
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.subtitle}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <Text style={styles.description}>
              Please restart the app to continue.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
}); 

export default ErrorBoundary;