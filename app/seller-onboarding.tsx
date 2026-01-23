import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { FileText, ExternalLink, ChefHat, Shield } from 'lucide-react-native';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function SellerOnboardingScreen() {
  const router = useRouter();
  const [showVideo, setShowVideo] = useState(false);
  
  const handleOpenFssaiLink = () => {
    Linking.openURL('https://www.fssaicertificate.org/how-to-get-fssai-license-for-home-kitchen/');
  };
  
  const handleContinue = () => {
    if (showVideo) {
      // Navigate to tabs
      router.replace('/(tabs)/home' as any);
    } else {
      setShowVideo(true);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!showVideo ? (
          <View style={styles.content}>
            <View style={styles.header}>
              <ChefHat size={40} color={colors.primary} />
              <Text style={styles.title}>Become a Home Chef</Text>
            </View>
            
            <View style={styles.card}>
              <Text style={styles.congratsText}>
                Congratulations on embarking on a Journey to Share your food with the world!
              </Text>
              
              <View style={styles.divider} />
              
              <Text style={styles.infoText}>
                In order to register as a Home Cook on the platform, there is a statutory requirement that you would have to fulfil. Not to worry, our agents will walk you and ensure that you comply with it.
              </Text>
              
              <Text style={styles.infoText}>
                You will have to get a basic Food Safety & Standards Authority of India, license the cost of getting this license will be borne by 2Spoons More.
              </Text>
              
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>
                  Kindly keep the following information ready to give our agents the same to apply and process your application:
                </Text>
                
                <View style={styles.requirementItem}>
                  <Shield size={20} color={colors.primary} />
                  <Text style={styles.requirementText}>
                    Address Proof (the place where you will be cooking)
                  </Text>
                </View>
                
                <View style={styles.requirementItem}>
                  <FileText size={20} color={colors.primary} />
                  <Text style={styles.requirementText}>
                    Aadhar Card (front and back, in case you are carrying the pocket version)
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.linkContainer}
                onPress={handleOpenFssaiLink}
              >
                <Text style={styles.linkText}>
                  While we will support you to get your required licenses and registration, we strongly recommend that you go through the FSSAI guidelines
                </Text>
                <ExternalLink size={16} color={colors.primary} />
              </TouchableOpacity>
              
              <View style={styles.signatureContainer}>
                <Text style={styles.signatureText}>Regards,</Text>
                <Text style={styles.signatureText}>Team</Text>
                <Text style={styles.brandText}>2SpoonsMore</Text>
              </View>
            </View>
            
            <Button
              title="OK"
              onPress={handleContinue}
              style={styles.button}
            />
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.header}>
              <ChefHat size={40} color={colors.primary} />
              <Text style={styles.title}>How 2SpoonsMore Works</Text>
            </View>
            
            <View style={styles.videoContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836' }}
                style={styles.videoPlaceholder}
                contentFit="cover"
              />
              <View style={styles.playButton}>
                <Text style={styles.playButtonText}>▶</Text>
              </View>
            </View>
            
            <View style={styles.stepsContainer}>
              <Text style={styles.stepsTitle}>Getting Started in 3 Simple Steps</Text>
              
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Create Your Profile</Text>
                  <Text style={styles.stepDescription}>
                    Complete your chef profile with your specialties, cuisine types, and cooking experience.
                  </Text>
                </View>
              </View>
              
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Add Your Dishes</Text>
                  <Text style={styles.stepDescription}>
                    Create listings for your signature dishes with photos, descriptions, and pricing.
                  </Text>
                </View>
              </View>
              
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Start Selling</Text>
                  <Text style={styles.stepDescription}>
                    Receive orders, prepare delicious food, and grow your home cooking business.
                  </Text>
                </View>
              </View>
            </View>
            
            <Button
              title="Get Started"
              onPress={handleContinue}
              style={styles.button}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  congratsText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    lineHeight: 24,
  },
  requirementsContainer: {
    backgroundColor: `${colors.primary}10`,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.info}10`,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  linkText: {
    fontSize: 14,
    color: colors.primary,
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  signatureContainer: {
    marginTop: 16,
  },
  signatureText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  button: {
    marginTop: 'auto',
  },
  videoContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  playButtonText: {
    color: colors.white,
    fontSize: 24,
  },
  stepsContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
});