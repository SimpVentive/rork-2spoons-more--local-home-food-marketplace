import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  Alert,
  TextInput
} from 'react-native';
import { 
  Bell, 
  Mail, 
  DollarSign, 
  Percent, 
  Shield, 
  Lock, 
  Database, 
  RefreshCw,
  Save,
  AlertTriangle
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function AdminSettings() {
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [complaintAlerts, setComplaintAlerts] = useState(true);
  
  // Platform settings
  const [platformFee, setPlatformFee] = useState('10');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowNewRegistrations, setAllowNewRegistrations] = useState(true);
  const [autoApproveListings, setAutoApproveListings] = useState(false);
  
  // Security settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [logFailedLogins, setLogFailedLogins] = useState(true);
  
  const handleSaveSettings = () => {
    // In a real app, this would call an API to save settings
    Alert.alert(
      "Settings Saved",
      "Your admin settings have been saved successfully.",
      [{ text: "OK" }]
    );
  };
  
  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear the application cache?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear", 
          onPress: () => {
            // In a real app, this would call an API to clear cache
            Alert.alert("Cache Cleared", "Application cache has been cleared successfully.");
          }
        }
      ]
    );
  };
  
  const handleBackupData = () => {
    // In a real app, this would call an API to backup data
    Alert.alert(
      "Backup Started",
      "Data backup has been initiated. You will be notified when it's complete.",
      [{ text: "OK" }]
    );
  };
  
  const handleEnterMaintenanceMode = () => {
    Alert.alert(
      "Maintenance Mode",
      "Are you sure you want to put the application in maintenance mode? This will prevent users from accessing the app.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Enable", 
          onPress: () => {
            setMaintenanceMode(true);
            Alert.alert("Maintenance Mode Enabled", "The application is now in maintenance mode.");
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Settings</Text>
        <Text style={styles.headerSubtitle}>Configure platform settings and preferences</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Mail size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingDescription}>Receive admin alerts via email</Text>
            </View>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={emailNotifications ? colors.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Bell size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive admin alerts via push notifications</Text>
            </View>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={pushNotifications ? colors.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Bell size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Order Alerts</Text>
              <Text style={styles.settingDescription}>Get notified about new and problematic orders</Text>
            </View>
          </View>
          <Switch
            value={orderAlerts}
            onValueChange={setOrderAlerts}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={orderAlerts ? colors.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <AlertTriangle size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Complaint Alerts</Text>
              <Text style={styles.settingDescription}>Get notified about new complaints</Text>
            </View>
          </View>
          <Switch
            value={complaintAlerts}
            onValueChange={setComplaintAlerts}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={complaintAlerts ? colors.primary : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platform Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Percent size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Platform Fee (%)</Text>
              <Text style={styles.settingDescription}>Fee charged on each transaction</Text>
            </View>
          </View>
          <TextInput
            style={styles.textInput}
            value={platformFee}
            onChangeText={setPlatformFee}
            keyboardType="numeric"
            maxLength={2}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Shield size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Maintenance Mode</Text>
              <Text style={styles.settingDescription}>Temporarily disable app access for users</Text>
            </View>
          </View>
          <Switch
            value={maintenanceMode}
            onValueChange={setMaintenanceMode}
            trackColor={{ false: colors.border, true: `${colors.error}80` }}
            thumbColor={maintenanceMode ? colors.error : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Shield size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Allow New Registrations</Text>
              <Text style={styles.settingDescription}>Enable or disable new user sign-ups</Text>
            </View>
          </View>
          <Switch
            value={allowNewRegistrations}
            onValueChange={setAllowNewRegistrations}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={allowNewRegistrations ? colors.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Shield size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Auto-Approve Listings</Text>
              <Text style={styles.settingDescription}>Automatically approve new food listings</Text>
            </View>
          </View>
          <Switch
            value={autoApproveListings}
            onValueChange={setAutoApproveListings}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={autoApproveListings ? colors.primary : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Lock size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
              <Text style={styles.settingDescription}>Require 2FA for admin logins</Text>
            </View>
          </View>
          <Switch
            value={twoFactorAuth}
            onValueChange={setTwoFactorAuth}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={twoFactorAuth ? colors.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Lock size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Session Timeout (minutes)</Text>
              <Text style={styles.settingDescription}>Auto-logout after inactivity</Text>
            </View>
          </View>
          <TextInput
            style={styles.textInput}
            value={sessionTimeout}
            onChangeText={setSessionTimeout}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Lock size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Log Failed Logins</Text>
              <Text style={styles.settingDescription}>Track unsuccessful login attempts</Text>
            </View>
          </View>
          <Switch
            value={logFailedLogins}
            onValueChange={setLogFailedLogins}
            trackColor={{ false: colors.border, true: `${colors.primary}80` }}
            thumbColor={logFailedLogins ? colors.primary : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Operations</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleClearCache}
        >
          <RefreshCw size={20} color={colors.white} />
          <Text style={styles.actionButtonText}>Clear Application Cache</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleBackupData}
        >
          <Database size={20} color={colors.white} />
          <Text style={styles.actionButtonText}>Backup Platform Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={handleEnterMaintenanceMode}
        >
          <AlertTriangle size={20} color={colors.white} />
          <Text style={styles.actionButtonText}>Enter Maintenance Mode</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSaveSettings}
      >
        <Save size={20} color={colors.white} />
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    backgroundColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#CBD5E1',
  },
  section: {
    padding: 20,
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  textInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 16,
    color: colors.text,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    margin: 20,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 18,
  },
});