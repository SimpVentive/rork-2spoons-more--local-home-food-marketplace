import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Search, 
  Mail, 
  Bell, 
  MessageSquare,
  Calendar,
  Users,
  Send,
  Edit,
  Trash2,
  Plus,
  X,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react-native';
import { Campaign } from '@/types';
import { useCampaignsStore } from '@/store/campaigns-store';
import Button from '@/components/Button';
import Input from '@/components/Input';
import colors from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export default function CampaignsScreen() {
  const router = useRouter();
  
  const {
    campaigns: storeCampaigns,
    isLoading: storeLoading,
    fetchCampaigns,
    createCampaign,
    deleteCampaign,
    scheduleCampaign,
    sendCampaign,
  } = useCampaignsStore();

  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'sent'>('all');
  
  // New campaign modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    type: 'email' as Campaign['type'],
    targetAudience: 'all' as Campaign['targetAudience']
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [searchQuery, filter, storeCampaigns]);

  const loadCampaigns = async () => {
    setIsLoading(true);
    await fetchCampaigns();
    setIsLoading(false);
  };

  // Sync filtered campaigns when store campaigns change
  useEffect(() => {
    filterCampaigns();
  }, [storeCampaigns]);

  const filterCampaigns = () => {
    let result = [...storeCampaigns];
    
    // Apply filter
    if (filter !== 'all') {
      result = result.filter(campaign => campaign.status === filter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        campaign => 
          campaign.title.toLowerCase().includes(query) ||
          campaign.description.toLowerCase().includes(query)
      );
    }
    
    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    
    setFilteredCampaigns(result);
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.title || !newCampaign.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    const created = await createCampaign({
      title: newCampaign.title,
      description: newCampaign.description,
      type: newCampaign.type,
      targetAudience: newCampaign.targetAudience,
    });
    
    if (created) {
      setIsModalVisible(false);
      setNewCampaign({
        title: '',
        description: '',
        type: 'email',
        targetAudience: 'all'
      });
      Alert.alert('Success', 'Campaign created successfully');
    } else {
      Alert.alert('Error', 'Failed to create campaign. Please try again.');
    }
  };

  const handleDeleteCampaign = (id: string) => {
    Alert.alert(
      'Delete Campaign',
      'Are you sure you want to delete this campaign?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCampaign(id);
            Alert.alert('Success', 'Campaign deleted successfully');
          }
        }
      ]
    );
  };

  const handleScheduleCampaign = (id: string) => {
    Alert.alert(
      'Schedule Campaign',
      'Do you want to schedule this campaign for sending?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Schedule',
          onPress: async () => {
            const scheduledDate = new Date();
            scheduledDate.setDate(scheduledDate.getDate() + 1);
            await scheduleCampaign(id, scheduledDate.toISOString());
            Alert.alert('Success', 'Campaign scheduled successfully');
          }
        }
      ]
    );
  };

  const handleSendNow = (id: string) => {
    Alert.alert(
      'Send Campaign',
      'Are you sure you want to send this campaign now?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Send Now',
          onPress: async () => {
            await sendCampaign(id);
            Alert.alert('Success', 'Campaign sent successfully');
          }
        }
      ]
    );
  };

  const getTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'email':
        return <Mail size={16} color="#1976D2" />;
      case 'push':
        return <Bell size={16} color="#9C27B0" />;
      case 'in_app':
        return <MessageSquare size={16} color="#43A047" />;
      default:
        return <Mail size={16} color="#1976D2" />;
    }
  };

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'sent':
        return <CheckCircle size={16} color="#43A047" />;
      case 'scheduled':
        return <Calendar size={16} color="#1976D2" />;
      case 'draft':
        return <Edit size={16} color="#FF9800" />;
      case 'cancelled':
        return <X size={16} color="#E53935" />;
      default:
        return <Clock size={16} color="#757575" />;
    }
  };

  const getAudienceIcon = (audience: Campaign['targetAudience']) => {
    switch (audience) {
      case 'all':
        return <Users size={16} color="#1976D2" />;
      case 'buyers':
        return <Users size={16} color="#43A047" />;
      case 'sellers':
        return <Users size={16} color="#9C27B0" />;
      case 'inactive':
        return <Users size={16} color="#FF9800" />;
      default:
        return <Users size={16} color="#1976D2" />;
    }
  };

  const renderCampaignItem = ({ item }: { item: Campaign }) => (
    <View style={styles.campaignCard}>
      <View style={styles.campaignHeader}>
        <View style={styles.campaignType}>
          {getTypeIcon(item.type)}
          <Text style={styles.campaignTypeText}>
            {item.type === 'email' ? 'Email' : 
             item.type === 'push' ? 'Push Notification' : 'In-App Message'}
          </Text>
        </View>
        
        <View style={[
          styles.campaignStatus,
          { 
            backgroundColor: 
              item.status === 'sent' ? '#E8F5E9' : 
              item.status === 'scheduled' ? '#E3F2FD' : 
              item.status === 'draft' ? '#FFF3E0' : '#FFEBEE'
          }
        ]}>
          {getStatusIcon(item.status)}
          <Text style={[
            styles.campaignStatusText,
            { 
              color: 
                item.status === 'sent' ? '#43A047' : 
                item.status === 'scheduled' ? '#1976D2' : 
                item.status === 'draft' ? '#FF9800' : '#E53935'
            }
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.campaignTitle}>{item.title}</Text>
      <Text style={styles.campaignDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.campaignDetails}>
        <View style={styles.campaignAudience}>
          {getAudienceIcon(item.targetAudience)}
          <Text style={styles.campaignAudienceText}>
            {item.targetAudience === 'all' ? 'All Users' : 
             item.targetAudience === 'buyers' ? 'Buyers Only' : 
             item.targetAudience === 'sellers' ? 'Sellers Only' : 'Inactive Users'}
          </Text>
        </View>
        
        <Text style={styles.campaignDate}>
          {item.status === 'sent' ? 
            `Sent: ${new Date(item.sentAt!).toLocaleDateString()}` : 
           item.status === 'scheduled' ? 
            `Scheduled: ${new Date(item.scheduledFor!).toLocaleDateString()}` : 
            `Created: ${new Date(item.createdAt).toLocaleDateString()}`}
        </Text>
      </View>
      
      {item.metrics && (
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.metrics.sent}</Text>
            <Text style={styles.metricLabel}>Sent</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.metrics.delivered}</Text>
            <Text style={styles.metricLabel}>Delivered</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.metrics.opened}</Text>
            <Text style={styles.metricLabel}>Opened</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{item.metrics.clicked}</Text>
            <Text style={styles.metricLabel}>Clicked</Text>
          </View>
        </View>
      )}
      
      <View style={styles.campaignActions}>
        {item.status === 'draft' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#E3F2FD' }]}
              onPress={() => handleScheduleCampaign(item.id)}
            >
              <Calendar size={16} color="#1976D2" />
              <Text style={[styles.actionButtonText, { color: '#1976D2' }]}>Schedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#E8F5E9' }]}
              onPress={() => handleSendNow(item.id)}
            >
              <Send size={16} color="#43A047" />
              <Text style={[styles.actionButtonText, { color: '#43A047' }]}>Send Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FFEBEE' }]}
              onPress={() => handleDeleteCampaign(item.id)}
            >
              <Trash2 size={16} color="#E53935" />
              <Text style={[styles.actionButtonText, { color: '#E53935' }]}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
        
        {item.status === 'scheduled' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#E8F5E9' }]}
              onPress={() => handleSendNow(item.id)}
            >
              <Send size={16} color="#43A047" />
              <Text style={[styles.actionButtonText, { color: '#43A047' }]}>Send Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FFEBEE' }]}
              onPress={() => handleDeleteCampaign(item.id)}
            >
              <X size={16} color="#E53935" />
              <Text style={[styles.actionButtonText, { color: '#E53935' }]}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search campaigns..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'all' && styles.filterButtonTextActive
          ]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'draft' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('draft')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'draft' && styles.filterButtonTextActive
          ]}>Drafts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'scheduled' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('scheduled')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'scheduled' && styles.filterButtonTextActive
          ]}>Scheduled</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'sent' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('sent')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'sent' && styles.filterButtonTextActive
          ]}>Sent</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Create New Campaign</Text>
      </TouchableOpacity>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.adminAccent} />
          <Text style={styles.loadingText}>Loading campaigns...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCampaigns}
          renderItem={renderCampaignItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No campaigns found</Text>
            </View>
          }
        />
      )}
      
      {/* Create Campaign Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Campaign</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Input
                label="Campaign Title"
                placeholder="Enter campaign title"
                value={newCampaign.title}
                onChangeText={(text) => setNewCampaign({...newCampaign, title: text})}
              />
              
              <Input
                label="Campaign Description"
                placeholder="Enter campaign description"
                value={newCampaign.description}
                onChangeText={(text) => setNewCampaign({...newCampaign, description: text})}
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />
              
              <Text style={styles.inputLabel}>Campaign Type</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    newCampaign.type === 'email' && styles.optionButtonActive
                  ]}
                  onPress={() => setNewCampaign({...newCampaign, type: 'email'})}
                >
                  <Mail size={16} color={newCampaign.type === 'email' ? '#FFFFFF' : colors.text} />
                  <Text style={[
                    styles.optionButtonText,
                    newCampaign.type === 'email' && styles.optionButtonTextActive
                  ]}>Email</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    newCampaign.type === 'push' && styles.optionButtonActive
                  ]}
                  onPress={() => setNewCampaign({...newCampaign, type: 'push'})}
                >
                  <Bell size={16} color={newCampaign.type === 'push' ? '#FFFFFF' : colors.text} />
                  <Text style={[
                    styles.optionButtonText,
                    newCampaign.type === 'push' && styles.optionButtonTextActive
                  ]}>Push</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    newCampaign.type === 'in_app' && styles.optionButtonActive
                  ]}
                  onPress={() => setNewCampaign({...newCampaign, type: 'in_app'})}
                >
                  <MessageSquare size={16} color={newCampaign.type === 'in_app' ? '#FFFFFF' : colors.text} />
                  <Text style={[
                    styles.optionButtonText,
                    newCampaign.type === 'in_app' && styles.optionButtonTextActive
                  ]}>In-App</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.inputLabel}>Target Audience</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    newCampaign.targetAudience === 'all' && styles.optionButtonActive
                  ]}
                  onPress={() => setNewCampaign({...newCampaign, targetAudience: 'all'})}
                >
                  <Users size={16} color={newCampaign.targetAudience === 'all' ? '#FFFFFF' : colors.text} />
                  <Text style={[
                    styles.optionButtonText,
                    newCampaign.targetAudience === 'all' && styles.optionButtonTextActive
                  ]}>All Users</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    newCampaign.targetAudience === 'buyers' && styles.optionButtonActive
                  ]}
                  onPress={() => setNewCampaign({...newCampaign, targetAudience: 'buyers'})}
                >
                  <Users size={16} color={newCampaign.targetAudience === 'buyers' ? '#FFFFFF' : colors.text} />
                  <Text style={[
                    styles.optionButtonText,
                    newCampaign.targetAudience === 'buyers' && styles.optionButtonTextActive
                  ]}>Buyers</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    newCampaign.targetAudience === 'sellers' && styles.optionButtonActive
                  ]}
                  onPress={() => setNewCampaign({...newCampaign, targetAudience: 'sellers'})}
                >
                  <Users size={16} color={newCampaign.targetAudience === 'sellers' ? '#FFFFFF' : colors.text} />
                  <Text style={[
                    styles.optionButtonText,
                    newCampaign.targetAudience === 'sellers' && styles.optionButtonTextActive
                  ]}>Sellers</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    newCampaign.targetAudience === 'inactive' && styles.optionButtonActive
                  ]}
                  onPress={() => setNewCampaign({...newCampaign, targetAudience: 'inactive'})}
                >
                  <Users size={16} color={newCampaign.targetAudience === 'inactive' ? '#FFFFFF' : colors.text} />
                  <Text style={[
                    styles.optionButtonText,
                    newCampaign.targetAudience === 'inactive' && styles.optionButtonTextActive
                  ]}>Inactive</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setIsModalVisible(false)}
                  variant="outline"
                  style={styles.modalCancelButton}
                />
                
                <Button
                  title="Create Campaign"
                  onPress={handleCreateCampaign}
                  style={styles.modalCreateButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F1F5F9',
  },
  filterButtonActive: {
      backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: 16,
  },
  createButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
  listContainer: {
    padding: 16,
  },
  campaignCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  campaignType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campaignTypeText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
  },
  campaignStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  campaignStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  campaignDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
    lineHeight: 20,
  },
  campaignDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  campaignAudience: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campaignAudienceText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
  },
  campaignDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  campaignActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
  },
  optionButtonTextActive: {
    color: colors.white,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    marginBottom: 16,
  },
  modalCancelButton: {
    marginRight: 8,
  },
  modalCreateButton: {
    backgroundColor: colors.primary,
  },
});