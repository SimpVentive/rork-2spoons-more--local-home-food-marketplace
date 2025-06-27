import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Linking,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChefHat, ExternalLink, FileText, Check, AlertCircle } from 'lucide-react-native';
import Button from '@/components/Button';
import colors from '@/constants/colors';

export default function SellerOnboardingScreen() {
  const router = useRouter();
  const [showVideo, setShowVideo] = useState(false);
  
  const handleOkPress = () => {
    setShowVideo(true);
  };
  
  const handleWatchVideo = () => {
    // Open video link in browser
    Linking.openURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  };
  
  const handleContinue = () => {
    // Navigate to profile or seller dashboard
    router.replace('/(tabs)/profile');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ChefHat size={40} color={colors.primary} />
          <Text style={styles.title}>
            Congratulations on embarking on a Journey to Share your food with the world
          </Text>
        </View>
        
        {!showVideo ? (
          <View style={styles.content}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                In order to register as a Home Cook on the platform, there is a statutory requirement that you would have to fulfil. Not to worry, our agents will walk you and ensure that you comply with it. You will have to get a basic Food Safety & Standards Authority of India, license the cost of getting this license will be borne by 2Spoons More.
              </Text>
            </View>
            
            <Text style={styles.sectionTitle}>Kindly keep the following information ready to give our agents the same to apply and process your application:</Text>
            
            <View style={styles.documentList}>
              <View style={styles.documentItem}>
                <FileText size={24} color={colors.primary} />
                <Text style={styles.documentText}>
                  Address Proof (the place where you will be cooking)
                </Text>
              </View>
              
              <View style={styles.documentItem}>
                <FileText size={24} color={colors.primary} />
                <Text style={styles.documentText}>
                  Aadhar Card (front and back, in case you are carrying the pocket version)
                </Text>
              </View>
            </View>
            
            <View style={styles.recommendationBox}>
              <AlertCircle size={24} color={colors.warning} />
              <Text style={styles.recommendationText}>
                While we will support you to get your required liceses and registration, we strongly recommend that you go through 
                <Text 
                  style={styles.link}
                  onPress={() => Linking.openURL('https://www.fssaicertificate.org/how-to-get-fssai-license-for-home-kitchen/')}
                >
                  {" https://www.fssaicertificate.org/how-to-get-fssai-license-for-home-kitchen/ "}
                </Text>
              </Text>
            </View>
            
            <Text style={styles.signatureText}>
              Regards{"\n"}
              Team{"\n"}
              2SpoonsMore
            </Text>
            
            <Button
              title="OK"
              onPress={handleOkPress}
              style={styles.okButton}
            />
          </View>
        ) : (
          <View style={styles.videoSection}>
            <Text style={styles.videoTitle}>Learn How 2SpoonsMore Works</Text>
            
            <View style={styles.videoCard}>
              <View style={styles.videoPlaceholder}>
                <ExternalLink size={40} color={colors.primary} />
                <Text style={styles.videoPlaceholderText}>Watch Video</Text>
              </View>
              
              <Button
                title="Watch Video"
                onPress={handleWatchVideo}
                style={styles.watchButton}
              />
            </View>
            
            <View style={styles.nextStepsCard}>
              <Text style={styles.nextStepsTitle}>Next Steps:</Text>
              
              <View style={styles.stepItem}>
                <Check size={20} color={colors.success} />
                <Text style={styles.stepText}>Our team will contact you within 24-48 hours</Text>
              </View>
              
              <View style={styles.stepItem}>
                <Check size={20} color={colors.success} />
                <Text style={styles.stepText}>We'll help you complete the FSSAI registration</Text>
              </View>
              
              <View style={styles.stepItem}>
                <Check size={20} color={colors.success} />
                <Text style={styles.stepText}>You'll receive training on food safety standards</Text>
              </View>
              
              <View style={styles.stepItem}>
                <Check size={20} color={colors.success} />
                <Text style={styles.stepText}>Start creating your first food listings!</Text>
              </View>
            </View>
            
            <Button
              title="Continue to Dashboard"
              onPress={handleContinue}
              style={styles.continueButton}
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
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 32,
  },
  content: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  documentList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  documentText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  recommendationBox: {
    backgroundColor: `${colors.warning}10`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 24,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  signatureText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 32,
    lineHeight: 24,
  },
  okButton: {
    marginTop: 16,
  },
  videoSection: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  videoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.card,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  videoPlaceholderText: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 8,
    fontWeight: '500',
  },
  watchButton: {
    width: '100%',
  },
  nextStepsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  continueButton: {
    marginTop: 16,
  },
});