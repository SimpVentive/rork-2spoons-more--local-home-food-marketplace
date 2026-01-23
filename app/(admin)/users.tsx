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
  Switch
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { 
  Search, 
  User, 
  ChefHat, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  ShoppingBag,
  MoreVertical,
  Ban,
  Edit,
  Trash,
  CheckCircle,
  Shield
} from 'lucide-react-native';
import { mockUsers } from '@/mocks/data';
import { User as UserType } from '@/types';
import colors from '@/constants/colors';

export default function ManageUsers() {
  const router = useRouter();
  
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buyers' | 'chefs' | 'admins'>('all');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filter, users]);

  const loadUsers = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    setIsLoading(false);
  };

  const filterUsers = () => {
    let result = [...users];
    
    // Apply filter
    if (filter === 'buyers') {
      result = result.filter(user => !user.isChef && !user.isAdmin);
    } else if (filter === 'chefs') {
      result = result.filter(user => user.isChef);
    } else if (filter === 'admins') {
      result = result.filter(user => user.isAdmin);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user => 
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(result);
  };

  const handleUserAction = (user: UserType, action: 'view' | 'edit' | 'ban' | 'delete') => {
    setShowActionMenu(null);
    
    if (action === 'view') {
      router.push(`/admin/user-details/${user.id}` as any);
    } else if (action === 'edit') {
      router.push(`/admin/edit-user/${user.id}` as any);
    } else if (action === 'ban') {
      Alert.alert(
        "Ban User",
        `Are you sure you want to ban ${user.name}?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Ban", 
            style: "destructive",
            onPress: () => {
              // In a real app, this would call an API
              Alert.alert("User Banned", `${user.name} has been banned.`);
            }
          }
        ]
      );
    } else if (action === 'delete') {
      Alert.alert(
        "Delete User",
        `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: () => {
              // In a real app, this would call an API
              const updatedUsers = users.filter(item => item.id !== user.id);
              setUsers(updatedUsers);
              Alert.alert("User Deleted", `${user.name} has been deleted.`);
            }
          }
        ]
      );
    }
  };

  const toggleVerification = (userId: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          isVerified: !user.isVerified
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
  };

  const renderUserItem = ({ item }: { item: UserType }) => (
    <TouchableOpacity 
      style={styles.userCard}
      onPress={() => handleUserAction(item, 'view')}
    >
      <Image
        source={{ uri: item.profileImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d' }}
        style={styles.userImage}
        contentFit="cover"
      />
      
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          {item.isChef && (
            <View style={styles.chefBadge}>
              <ChefHat size={12} color={colors.white} />
              <Text style={styles.chefBadgeText}>Chef</Text>
            </View>
          )}
          {item.isAdmin && (
            <View style={[styles.chefBadge, { backgroundColor: colors.adminPrimary }]}>
              <Shield size={12} color={colors.white} />
              <Text style={styles.chefBadgeText}>Admin</Text>
            </View>
          )}
        </View>
        
        <View style={styles.userDetails}>
          <View style={styles.userDetail}>
            <Mail size={14} color={colors.textLight} />
            <Text style={styles.userDetailText}>{item.email}</Text>
          </View>
          
          <View style={styles.userDetail}>
            <Phone size={14} color={colors.textLight} />
            <Text style={styles.userDetailText}>{item.phone}</Text>
          </View>
          
          <View style={styles.userDetail}>
            <MapPin size={14} color={colors.textLight} />
            <Text style={styles.userDetailText} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>
        
        {item.isChef && (
          <View style={styles.chefStats}>
            <View style={styles.chefStat}>
              <Star size={14} color="#FFD700" />
              <Text style={styles.chefStatText}>{item.rating} ({item.reviewCount})</Text>
            </View>
            
            <View style={styles.chefStat}>
              <ShoppingBag size={14} color={colors.primary} />
              <Text style={styles.chefStatText}>42 orders</Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.userActions}>
        {showActionMenu === item.id ? (
          <View style={styles.actionMenu}>
            <TouchableOpacity 
              style={styles.actionMenuItem}
              onPress={() => handleUserAction(item, 'edit')}
            >
              <Edit size={16} color={colors.text} />
              <Text style={styles.actionMenuItemText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionMenuItem}
              onPress={() => handleUserAction(item, 'ban')}
            >
              <Ban size={16} color={colors.error} />
              <Text style={[styles.actionMenuItemText, { color: colors.error }]}>Ban</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionMenuItem}
              onPress={() => handleUserAction(item, 'delete')}
            >
              <Trash size={16} color={colors.error} />
              <Text style={[styles.actionMenuItemText, { color: colors.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowActionMenu(item.id)}
          >
            <MoreVertical size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
        
        {item.isChef && (
          <View style={styles.verificationContainer}>
            <Text style={styles.verificationText}>Verified</Text>
            <Switch
              value={item.isVerified}
              onValueChange={() => toggleVerification(item.id)}
              trackColor={{ false: '#E0E0E0', true: `${colors.adminSuccess}50` }}
              thumbColor={item.isVerified ? colors.adminSuccess : '#BDBDBD'}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
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
            filter === 'buyers' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('buyers')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'buyers' && styles.filterButtonTextActive
          ]}>Buyers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'chefs' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('chefs')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'chefs' && styles.filterButtonTextActive
          ]}>Chefs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'admins' && styles.filterButtonActive
          ]}
          onPress={() => setFilter('admins')}
        >
          <Text style={[
            styles.filterButtonText,
            filter === 'admins' && styles.filterButtonTextActive
          ]}>Admins</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
        />
      )}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/admin/add-user' as any)}
      >
        <Text style={styles.addButtonText}>+ Add New User</Text>
      </TouchableOpacity>
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
    backgroundColor: colors.adminPrimary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
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
    paddingBottom: 80,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  chefBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  chefBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
    marginLeft: 2,
  },
  userDetails: {
    marginBottom: 8,
  },
  userDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userDetailText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  chefStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chefStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  chefStatText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
  },
  userActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  actionButton: {
    padding: 4,
  },
  actionMenu: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
  },
  actionMenuItemText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  verificationText: {
    fontSize: 12,
    color: colors.textLight,
    marginRight: 8,
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
  addButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.adminPrimary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});