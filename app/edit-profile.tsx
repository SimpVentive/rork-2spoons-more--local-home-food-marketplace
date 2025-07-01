import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Camera,
  ChefHat,
  X,
  Edit3,
  Save,
  LogOut,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/auth-store';
import Input from '@/components/Input';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function EditProfileScreen() {
  const { user, updateProfile, logout } = useAuthStore();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [experience, setExperience] = useState(user?.experience || '');
  const [cuisineTypes, setCuisineTypes] = useState<string[]>(user?.cuisineTypes || []);
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [allowProfileDisplay, setAllowProfileDisplay] = useState(user?.allowProfileDisplay !== false);
  const [isChef, setIsChef] = useState(user?.isChef || false);
  const [commissionPercentage, setCommissionPercentage] = useState(user?.commissionPercentage || 10);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)');
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      setIsLoading(true);
      const success = await updateProfile({
        name,
        email,
        phone,
        address,
        experience,
        cuisineTypes,
        profileImage,
        allowProfileDisplay,
        isChef,
        commissionPercentage,
      });

      if (success) {
        Alert.alert('Success', 'Profile updated successfully');
        router.back();
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleAddCuisine = (cuisine: string) => {
    if (!cuisineTypes.includes(cuisine)) {
      setCuisineTypes([...cuisineTypes, cuisine]);
    } else {
      setCuisineTypes(cuisineTypes.filter(c => c !== cuisine));
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            logout();
            router.replace('/(auth)');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const cuisineOptions = [
    'South Indian',
    'North Indian',
    'Chinese',
    'Italian',
    'Mexican',
    'Thai',
    'Japanese',
    'Continental',
    'Middle Eastern',
    'Desserts',
  ];

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: profileImage || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167' }}
          style={styles.profileImage}
          contentFit="cover"
        />
        <TouchableOpacity style={styles.editImageButton} onPress={handlePickImage}>
          <Camera size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Input
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          leftIcon={<UserIcon size={20} color={colors.textLight} />}
        />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          leftIcon={<Mail size={20} color={colors.textLight} />}
        />

        <Input
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          leftIcon={<Phone size={20} color={colors.textLight} />}
        />

        <Input
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="Enter your address"
          leftIcon={<MapPin size={20} color={colors.textLight} />}
        />

        <View style={styles.switchContainer}>
          <View style={styles.switchRow}>
            <ChefHat size={20} color={colors.textLight} />
            <Text style={styles.switchLabel}>I am a Chef/Home Cook</Text>
            <Switch
              value={isChef}
              onValueChange={setIsChef}
              trackColor={{ false: colors.border, true: `${colors.primary}80` }}
              thumbColor={isChef ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {isChef && (
          <>
            <Input
              label="Cooking Experience"
              value={experience}
              onChangeText={setExperience}
              placeholder="Describe your cooking experience"
              multiline
              numberOfLines={3}
              leftIcon={<ChefHat size={20} color={colors.textLight} />}
            />

            <Text style={styles.sectionTitle}>Cuisine Types</Text>
            <View style={styles.cuisineContainer}>
              {cuisineOptions.map((cuisine) => (
                <TouchableOpacity
                  key={cuisine}
                  style={[
                    styles.cuisineTag,
                    cuisineTypes.includes(cuisine) && styles.selectedCuisineTag,
                  ]}
                  onPress={() => handleAddCuisine(cuisine)}
                >
                  <Text
                    style={[
                      styles.cuisineTagText,
                      cuisineTypes.includes(cuisine) && styles.selectedCuisineTagText,
                    ]}
                  >
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchRow}>
                <UserIcon size={20} color={colors.textLight} />
                <Text style={styles.switchLabel}>Allow Profile Display</Text>
                <Switch
                  value={allowProfileDisplay}
                  onValueChange={setAllowProfileDisplay}
                  trackColor={{ false: colors.border, true: `${colors.primary}80` }}
                  thumbColor={allowProfileDisplay ? colors.primary : '#f4f3f4'}
                />
              </View>
            </View>

            <View style={styles.commissionContainer}>
              <Text style={styles.commissionTitle}>Commission Percentage</Text>
              <Text style={styles.commissionValue}>{commissionPercentage}%</Text>
              <Text style={styles.commissionDescription}>
                This is the platform fee charged on each sale. Commission rates are set by the platform and cannot be modified by sellers.
              </Text>
            </View>
          </>
        )}

        <Button
          title="Save Changes"
          onPress={handleSave}
          style={styles.saveButton}
        />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.border,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: Platform.OS === 'web' ? '35%' : '30%',
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  formContainer: {
    padding: 16,
  },
  switchContainer: {
    marginVertical: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
  },
  switchLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  cuisineTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCuisineTag: {
    backgroundColor: colors.primary,
  },
  cuisineTagText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedCuisineTagText: {
    color: colors.white,
  },
  saveButton: {
    marginTop: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.error,
    fontWeight: '500',
  },
  commissionContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  commissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  commissionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  commissionDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
});