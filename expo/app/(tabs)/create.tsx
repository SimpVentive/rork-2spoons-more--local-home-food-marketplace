import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Camera, ChefHat, Clock, DollarSign, FileText, Image as ImageIcon, MapPin, Plus, Tag, Utensils, PlusCircle } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function CreateScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    
    switch (option) {
      case 'food':
        console.log("Navigating to create-listing");
        router.push('/create-listing' as any);
        break;
      case 'scan':
        console.log("Navigating to scan screen from create");
        router.push('/scan' as any);
        break;
      case 'order':
        Alert.alert('Coming Soon', 'This feature will be available soon!');
        break;
      default:
        break;
    }
  };

  const handleScanQR = () => {
    console.log("Navigating to scan screen from quick action");
    try {
      router.push('/scan' as any);
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert('Error', 'Failed to open QR scanner. Please try again.');
    }
  };
  
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Create',
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => {
              console.log("Header button pressed - navigating to create-listing");
              router.push('/create-listing' as any);
            }}
            style={styles.headerButton}
          >
            <PlusCircle size={24} color={colors.primary} />
          </TouchableOpacity>
        ),
      }} />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>What would you like to create?</Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.option, selectedOption === 'food' && styles.selectedOption]}
            onPress={() => handleOptionSelect('food')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
              <ChefHat size={24} color="#1976D2" />
            </View>
            <Text style={styles.optionTitle}>Food Listing</Text>
            <Text style={styles.optionDescription}>
              Create a new food listing to sell your homemade dishes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.option, selectedOption === 'scan' && styles.selectedOption]}
            onPress={() => handleOptionSelect('scan')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Camera size={24} color="#43A047" />
            </View>
            <Text style={styles.optionTitle}>Scan QR Code</Text>
            <Text style={styles.optionDescription}>
              Scan a QR code to quickly access orders or listings
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.option, selectedOption === 'order' && styles.selectedOption]}
            onPress={() => handleOptionSelect('order')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
              <FileText size={24} color="#EF6C00" />
            </View>
            <Text style={styles.optionTitle}>Create Order</Text>
            <Text style={styles.optionDescription}>
              Manually create an order for a customer (coming soon)
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => {
                console.log("Quick action - New Listing pressed");
                router.push('/create-listing' as any);
              }}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={styles.quickActionText}>New Listing</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={handleScanQR}
            >
              <Camera size={20} color={colors.primary} />
              <Text style={styles.quickActionText}>Scan QR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => {
                console.log("Quick action - Analytics pressed");
                router.push('/analytics' as any);
              }}
            >
              <Tag size={20} color={colors.primary} />
              <Text style={styles.quickActionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>Tips for Success</Text>
          
          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <ImageIcon size={20} color="#FFFFFF" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Use High-Quality Images</Text>
              <Text style={styles.tipDescription}>
                Clear, well-lit photos of your food increase sales by up to 40%
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <View style={[styles.tipIconContainer, { backgroundColor: '#9C27B0' }]}>
              <DollarSign size={20} color="#FFFFFF" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Price Competitively</Text>
              <Text style={styles.tipDescription}>
                Research similar dishes in your area to set the right price point
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <View style={[styles.tipIconContainer, { backgroundColor: '#43A047' }]}>
              <Clock size={20} color="#FFFFFF" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Set Realistic Timings</Text>
              <Text style={styles.tipDescription}>
                Be clear about preparation time and availability windows
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <View style={[styles.tipIconContainer, { backgroundColor: '#EF6C00' }]}>
              <Utensils size={20} color="#FFFFFF" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Detailed Descriptions</Text>
              <Text style={styles.tipDescription}>
                Include ingredients, spice levels, and any special preparation methods
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <View style={[styles.tipIconContainer, { backgroundColor: '#1976D2' }]}>
              <MapPin size={20} color="#FFFFFF" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Accurate Location</Text>
              <Text style={styles.tipDescription}>
                Set your exact location for better visibility to nearby customers
              </Text>
            </View>
          </View>
        </View>
        
        <Button
          title="Create New Food Listing"
          onPress={() => {
            console.log("Main button - Create New Food Listing pressed");
            router.push('/create-listing' as any);
          }}
          style={styles.createButton}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 120, // Increased padding to avoid tab bar overlap
  },
  headerButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  option: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    lineHeight: 20,
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
  },
  tipsContainer: {
    marginBottom: 32,
  },
  tipCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  createButton: {
    marginTop: 16,
    marginBottom: 32,
  },
});