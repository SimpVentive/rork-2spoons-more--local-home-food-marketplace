import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';
import { Leaf } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    isVegetarianOnly: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { register } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (!/^\+?\d{10,13}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid mobile number';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email || `${formData.phone.replace(/\D/g, '')}@homecook.app`,
        phone: formData.phone,
        password: formData.password,
        cuisineTypes: [],
        paymentMethods: [],
        location: { latitude: 17.4123, longitude: 78.2679 },
        address: '',
        isChef: false,
      } as any);
      router.replace('/user-preference' as any);
    } catch (error) {
      console.log('Registration error:', error);
      setErrors({
        general: 'Registration failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🍳</Text>
            </View>
          </View>
          <Text style={styles.title}>Join HomeCook</Text>
          <Text style={styles.subtitle}>
            Create your account to discover delicious homemade food
          </Text>
        </View>
        
        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(text) => updateFormData('name', text)}
            error={errors.name}
          />
          
          <Input
            label="Mobile Number"
            placeholder="+91 9876543210"
            value={formData.phone}
            onChangeText={(text) => updateFormData('phone', text)}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <Input
            label="Email (Optional)"
            placeholder="you@example.com"
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          
          <Input
            label="Password"
            placeholder="Create a password (min 6 chars)"
            value={formData.password}
            onChangeText={(text) => updateFormData('password', text)}
            isPassword
            error={errors.password}
            secureTextEntry={true}
          />
          
          <View style={styles.vegToggle}>
            <View style={styles.vegToggleLeft}>
              <View style={styles.vegIconWrap}>
                <Leaf size={18} color={colors.vegetarian} />
              </View>
              <Text style={styles.vegLabel}>Vegetarian preference</Text>
            </View>
            <Switch
              value={formData.isVegetarianOnly}
              onValueChange={(value) => updateFormData('isVegetarianOnly', value)}
              trackColor={{ false: colors.border, true: `${colors.vegetarian}80` }}
              thumbColor={formData.isVegetarianOnly ? colors.vegetarian : '#f4f3f4'}
            />
          </View>
        </View>
        
        {errors.general && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        )}
        
        <Button
          title="Create Account"
          onPress={handleRegister}
          style={styles.registerButton}
          isLoading={isLoading}
        />

        <Text style={styles.termsText}>
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href={"/(auth)/login" as any} asChild>
            <TouchableOpacity>
              <Text style={styles.loginText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 8,
  },
  vegToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  vegToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vegIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.vegetarian}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  vegLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500' as const,
  },
  errorBanner: {
    backgroundColor: `${colors.error}12`,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${colors.error}25`,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  registerButton: {
    marginBottom: 16,
  },
  termsText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingVertical: 16,
  },
  footerText: {
    color: colors.textLight,
    fontSize: 15,
  },
  loginText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700' as const,
  },
});
