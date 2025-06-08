import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
  Modal,
  ScrollView,
  Platform,
  Share,
  Dimensions,
  KeyboardAvoidingView
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { 
  Search, 
  Star, 
  DollarSign, 
  Clock, 
  User,
  MapPin,
  MoreVertical,
  Edit,
  Trash,
  Eye,
  CheckCircle,
  XCircle,
  Leaf,
  Plus,
  Download,
  Filter,
  ChevronDown,
  X,
  FileText,
  ToggleLeft,
  ToggleRight,
  Info,
  Calendar,
  Tag,
  Utensils,
  AlertTriangle,
  Check
} from 'lucide-react-native';
import { mockListings, CUISINE_TYPES } from '@/mocks/data';
import { FoodListing } from '@/types';
import colors from '@/constants/colors';
import { useListingsStore } from '@/store/listings-store';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function ManageListings() {
  const router = useRouter();
  const listingsStore = useListingsStore();
  const { width } = Dimensions.get('window');
  
  // State
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<FoodListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'featured' | 'pending'>('all');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentListing, setCurrentListing] = useState<FoodListing | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  // Advanced filters
  const [filterBySeller, setFilterBySeller] = useState('');
  const [filterByCuisine, setFilterByCuisine] = useState('');
  const [filterByPrice, setFilterByPrice] = useState<{min?: number, max?: number}>({});
  const [filterByApproval, setFilterByApproval] = useState<'all' | 'approved' | 'pending'>('all');
  const [filterByVegetarian, setFilterByVegetarian] = useState<'all' | 'veg' | 'non-veg'>('all');
  
  // New listing form
  const [newListing, setNewListing] = useState({
    dishName: '',
    price: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    isVegetarian: false,
    cuisineType: '',
    ingredients: '',
    allergens: '',
    availableQuantity: '',
    availableFrom: '',
    availableUntil: '',
    calories: '',
    portionSize: '',
    preparationTime: '',
    dietaryTags: [] as string[],
    sellerId: 'user1', // Default seller for demo
    sellerName: 'John Doe', // Default seller for demo
    sellerImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
      address: '123 Main St, Bangalore',
    }
  });
  
  // Edit form
  const [editForm, setEditForm] = useState<any>({});
  
  // Dietary tags options
  const dietaryTagOptions = [
    'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Vegan', 'Keto', 'Low-Carb', 'Paleo', 'Sugar-Free'
  ];
  
  // Refs
  const actionMenuRef = useRef<any>(null);
  
  useEffect(() => {
    loadListings();
  }, []);
  
  useEffect(() => {
    filterListings();
  }, [
    searchQuery, 
    filter, 
    listings, 
    filterBySeller, 
    filterByCuisine, 
    filterByPrice, 
    filterByApproval,
    filterByVegetarian
  ]);
  
  useEffect(() => {
    if (selectAll) {
      setSelectedListings(filteredListings.map(listing => listing.id));
    } else if (selectedListings.length === filteredListings.length) {
      // If user manually selected all items and then deselects one
      setSelectAll(false);
    }
  }, [selectAll, filteredListings]);
  
  const loadListings = async () => {
    setIsLoading(true);
    
    try {
      await listingsStore.fetchListings();
      
      // Add additional properties to listings for admin features
      const enhancedListings = listingsStore.listings.map((listing, index) => ({
        ...listing,
        isFeatured: listing.isFeatured || index === 0, // Just for demo
        isActive: listing.isActive !== undefined ? listing.isActive : new Date(listing.availableUntil) > new Date(),
        isApproved: listing.isApproved !== undefined ? listing.isApproved : true,
        calories: listing.calories || Math.floor(Math.random() * 500) + 200,
        portionSize: listing.portionSize || `${Math.floor(Math.random() * 300) + 100}g`,
        preparationTime: listing.preparationTime || `${Math.floor(Math.random() * 30) + 10} mins`,
        dietaryTags: listing.dietaryTags || []
      }));
      
      setListings(enhancedListings);
      setFilteredListings(enhancedListings);
    } catch (error) {
      Alert.alert('Error', 'Failed to load listings');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterListings = () => {
    let result = [...listings];
    
    // Apply main filter
    if (filter === 'active') {
      result = result.filter(listing => listing.isActive);
    } else if (filter === 'expired') {
      result = result.filter(listing => !listing.isActive);
    } else if (filter === 'featured') {
      result = result.filter(listing => listing.isFeatured);
    } else if (filter === 'pending') {
      result = result.filter(listing => !listing.isApproved);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        listing => 
          listing.dishName.toLowerCase().includes(query) ||
          listing.sellerName.toLowerCase().includes(query) ||
          (listing.description && listing.description.toLowerCase().includes(query))
      );
    }
    
    // Apply advanced filters
    if (filterBySeller) {
      result = result.filter(listing => 
        listing.sellerName.toLowerCase().includes(filterBySeller.toLowerCase())
      );
    }
    
    if (filterByCuisine) {
      result = result.filter(listing => 
        listing.cuisineType?.toLowerCase() === filterByCuisine.toLowerCase()
      );
    }
    
    if (filterByPrice.min !== undefined) {
      result = result.filter(listing => listing.price >= (filterByPrice.min || 0));
    }
    
    if (filterByPrice.max !== undefined) {
      result = result.filter(listing => listing.price <= (filterByPrice.max || Infinity));
    }
    
    if (filterByApproval !== 'all') {
      result = result.filter(listing => 
        filterByApproval === 'approved' ? listing.isApproved : !listing.isApproved
      );
    }
    
    if (filterByVegetarian !== 'all') {
      result = result.filter(listing => 
        filterByVegetarian === 'veg' ? listing.isVegetarian : !listing.isVegetarian
      );
    }
    
    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredListings(result);
  };
  
  const handleListingAction = (listing: FoodListing, action: 'view' | 'edit' | 'delete' | 'feature' | 'activate') => {
    setShowActionMenu(null);
    
    if (action === 'view') {
      setCurrentListing(listing);
      setShowDetailsModal(true);
    } else if (action === 'edit') {
      setCurrentListing(listing);
      setEditForm({
        dishName: listing.dishName,
        price: listing.price.toString(),
        description: listing.description || '',
        image: listing.image,
        isVegetarian: listing.isVegetarian,
        cuisineType: listing.cuisineType || '',
        ingredients: listing.ingredients.join(', '),
        allergens: listing.allergens.join(', '),
        availableQuantity: listing.availableQuantity.toString(),
        availableFrom: listing.availableFrom,
        availableUntil: listing.availableUntil,
        calories: listing.calories?.toString() || '',
        portionSize: listing.portionSize || '',
        preparationTime: listing.preparationTime || '',
        dietaryTags: listing.dietaryTags || [],
        isActive: listing.isActive,
        isApproved: listing.isApproved,
        isFeatured: listing.isFeatured
      });
      setShowEditModal(true);
    } else if (action === 'delete') {
      Alert.alert(
        "Delete Listing",
        `Are you sure you want to delete "${listing.dishName}"? This action cannot be undone.`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: () => {
              deleteListing(listing.id);
            }
          }
        ]
      );
    } else if (action === 'feature') {
      toggleFeature(listing.id);
    } else if (action === 'activate') {
      toggleActive(listing.id);
    }
  };
  
  const toggleApproval = (listingId: string) => {
    const updatedListings = listings.map(listing => {
      if (listing.id === listingId) {
        return {
          ...listing,
          isApproved: !listing.isApproved
        };
      }
      return listing;
    });
    
    setListings(updatedListings);
    
    // In a real app, this would call an API
    // listingsStore.updateListing(listingId, { isApproved: !listing.isApproved });
  };
  
  const toggleFeature = (listingId: string) => {
    const updatedListings = listings.map(listing => {
      if (listing.id === listingId) {
        const newValue = !listing.isFeatured;
        return {
          ...listing,
          isFeatured: newValue
        };
      }
      return listing;
    });
    
    setListings(updatedListings);
    
    const listing = listings.find(l => l.id === listingId);
    if (listing) {
      if (!listing.isFeatured) {
        Alert.alert("Listing Featured", `"${listing.dishName}" is now featured.`);
      } else {
        Alert.alert("Listing Unfeatured", `"${listing.dishName}" is no longer featured.`);
      }
    }
  };
  
  const toggleActive = (listingId: string) => {
    const updatedListings = listings.map(listing => {
      if (listing.id === listingId) {
        const newValue = !listing.isActive;
        return {
          ...listing,
          isActive: newValue
        };
      }
      return listing;
    });
    
    setListings(updatedListings);
    
    const listing = listings.find(l => l.id === listingId);
    if (listing) {
      if (!listing.isActive) {
        Alert.alert("Listing Activated", `"${listing.dishName}" is now active.`);
      } else {
        Alert.alert("Listing Deactivated", `"${listing.dishName}" is now inactive.`);
      }
    }
  };
  
  const deleteListing = (listingId: string) => {
    const updatedListings = listings.filter(listing => listing.id !== listingId);
    setListings(updatedListings);
    
    // Remove from selected if it was selected
    if (selectedListings.includes(listingId)) {
      setSelectedListings(selectedListings.filter(id => id !== listingId));
    }
    
    const listing = listings.find(l => l.id === listingId);
    if (listing) {
      Alert.alert("Listing Deleted", `"${listing.dishName}" has been deleted.`);
    }
    
    // In a real app, this would call an API
    // listingsStore.deleteListing(listingId);
  };
  
  const toggleSelectListing = (listingId: string) => {
    if (selectedListings.includes(listingId)) {
      setSelectedListings(selectedListings.filter(id => id !== listingId));
    } else {
      setSelectedListings([...selectedListings, listingId]);
    }
  };
  
  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedListings(filteredListings.map(listing => listing.id));
    } else {
      setSelectedListings([]);
    }
  };
  
  const handleBulkAction = (action: 'approve' | 'reject' | 'activate' | 'deactivate' | 'delete' | 'feature' | 'unfeature') => {
    if (selectedListings.length === 0) {
      Alert.alert('No Listings Selected', 'Please select at least one listing to perform this action.');
      return;
    }
    
    let confirmMessage = '';
    let successMessage = '';
    
    switch (action) {
      case 'approve':
        confirmMessage = `Approve ${selectedListings.length} selected listings?`;
        successMessage = `${selectedListings.length} listings approved.`;
        break;
      case 'reject':
        confirmMessage = `Reject ${selectedListings.length} selected listings?`;
        successMessage = `${selectedListings.length} listings rejected.`;
        break;
      case 'activate':
        confirmMessage = `Activate ${selectedListings.length} selected listings?`;
        successMessage = `${selectedListings.length} listings activated.`;
        break;
      case 'deactivate':
        confirmMessage = `Deactivate ${selectedListings.length} selected listings?`;
        successMessage = `${selectedListings.length} listings deactivated.`;
        break;
      case 'delete':
        confirmMessage = `Delete ${selectedListings.length} selected listings? This action cannot be undone.`;
        successMessage = `${selectedListings.length} listings deleted.`;
        break;
      case 'feature':
        confirmMessage = `Feature ${selectedListings.length} selected listings?`;
        successMessage = `${selectedListings.length} listings featured.`;
        break;
      case 'unfeature':
        confirmMessage = `Remove ${selectedListings.length} listings from featured?`;
        successMessage = `${selectedListings.length} listings unfeatured.`;
        break;
    }
    
    Alert.alert(
      'Confirm Action',
      confirmMessage,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Confirm',
          onPress: () => {
            const updatedListings = [...listings];
            
            selectedListings.forEach(id => {
              const index = updatedListings.findIndex(listing => listing.id === id);
              if (index !== -1) {
                switch (action) {
                  case 'approve':
                    updatedListings[index] = { ...updatedListings[index], isApproved: true };
                    break;
                  case 'reject':
                    updatedListings[index] = { ...updatedListings[index], isApproved: false };
                    break;
                  case 'activate':
                    updatedListings[index] = { ...updatedListings[index], isActive: true };
                    break;
                  case 'deactivate':
                    updatedListings[index] = { ...updatedListings[index], isActive: false };
                    break;
                  case 'feature':
                    updatedListings[index] = { ...updatedListings[index], isFeatured: true };
                    break;
                  case 'unfeature':
                    updatedListings[index] = { ...updatedListings[index], isFeatured: false };
                    break;
                }
              }
            });
            
            if (action === 'delete') {
              const newListings = updatedListings.filter(listing => !selectedListings.includes(listing.id));
              setListings(newListings);
            } else {
              setListings(updatedListings);
            }
            
            setSelectedListings([]);
            setSelectAll(false);
            Alert.alert('Success', successMessage);
          }
        }
      ]
    );
  };
  
  const exportListings = async () => {
    try {
      let exportData;
      let fileName;
      
      if (exportFormat === 'csv') {
        // Create CSV
        const headers = 'ID,Dish Name,Seller,Price,Vegetarian,Cuisine,Status,Approved,Featured,Created At\n';
        const rows = filteredListings.map(listing => {
          return `${listing.id},"${listing.dishName}","${listing.sellerName}",${listing.price},${listing.isVegetarian},${listing.cuisineType || ''},${listing.isActive ? 'Active' : 'Inactive'},${listing.isApproved ? 'Yes' : 'No'},${listing.isFeatured ? 'Yes' : 'No'},${listing.createdAt}`;
        }).join('\n');
        
        exportData = headers + rows;
        fileName = `listings_export_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        // Create JSON
        exportData = JSON.stringify(filteredListings, null, 2);
        fileName = `listings_export_${new Date().toISOString().split('T')[0]}.json`;
      }
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([exportData], { type: exportFormat === 'csv' ? 'text/csv' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // For mobile, use Share API
        await Share.share({
          title: fileName,
          message: exportData,
        });
      }
      
      setShowExportOptions(false);
      Alert.alert('Success', `Listings exported as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'There was an error exporting the listings.');
    }
  };
  
  const handleAddListing = () => {
    if (!newListing.dishName || !newListing.price || !newListing.availableQuantity) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    const listing: any = {
      id: `listing-${Date.now()}`,
      sellerId: newListing.sellerId,
      sellerName: newListing.sellerName,
      sellerImage: newListing.sellerImage,
      dishName: newListing.dishName,
      description: newListing.description,
      price: parseFloat(newListing.price),
      image: newListing.image,
      isVegetarian: newListing.isVegetarian,
      cuisineType: newListing.cuisineType,
      ingredients: newListing.ingredients.split(',').map(i => i.trim()),
      allergens: newListing.allergens.split(',').map(a => a.trim()),
      availableQuantity: parseInt(newListing.availableQuantity),
      remainingQuantity: parseInt(newListing.availableQuantity),
      availableFrom: newListing.availableFrom || new Date().toISOString(),
      availableUntil: newListing.availableUntil || new Date(Date.now() + 86400000).toISOString(),
      location: newListing.location,
      calories: newListing.calories ? parseInt(newListing.calories) : undefined,
      portionSize: newListing.portionSize,
      preparationTime: newListing.preparationTime,
      dietaryTags: newListing.dietaryTags,
      createdAt: new Date().toISOString(),
      isApproved: true,
      isActive: true,
      isFeatured: false,
      rating: 0,
      reviewCount: 0,
      orderCount: 0
    };
    
    setListings([listing, ...listings]);
    setShowAddModal(false);
    
    // Reset form
    setNewListing({
      dishName: '',
      price: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      isVegetarian: false,
      cuisineType: '',
      ingredients: '',
      allergens: '',
      availableQuantity: '',
      availableFrom: '',
      availableUntil: '',
      calories: '',
      portionSize: '',
      preparationTime: '',
      dietaryTags: [],
      sellerId: 'user1',
      sellerName: 'John Doe',
      sellerImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
      location: {
        latitude: 12.9716,
        longitude: 77.5946,
        address: '123 Main St, Bangalore',
      }
    });
    
    Alert.alert('Success', 'New listing added successfully.');
  };
  
  const handleUpdateListing = () => {
    if (!currentListing) return;
    
    const updatedListing = {
      ...currentListing,
      dishName: editForm.dishName,
      price: parseFloat(editForm.price),
      description: editForm.description,
      image: editForm.image,
      isVegetarian: editForm.isVegetarian,
      cuisineType: editForm.cuisineType,
      ingredients: editForm.ingredients.split(',').map((i: string) => i.trim()),
      allergens: editForm.allergens.split(',').map((a: string) => a.trim()),
      availableQuantity: parseInt(editForm.availableQuantity),
      availableFrom: editForm.availableFrom,
      availableUntil: editForm.availableUntil,
      calories: editForm.calories ? parseInt(editForm.calories) : undefined,
      portionSize: editForm.portionSize,
      preparationTime: editForm.preparationTime,
      dietaryTags: editForm.dietaryTags,
      isActive: editForm.isActive,
      isApproved: editForm.isApproved,
      isFeatured: editForm.isFeatured
    };
    
    const updatedListings = listings.map(listing => 
      listing.id === currentListing.id ? updatedListing : listing
    );
    
    setListings(updatedListings);
    setShowEditModal(false);
    Alert.alert('Success', 'Listing updated successfully.');
  };
  
  const toggleDietaryTag = (tag: string) => {
    if (showEditModal) {
      if (editForm.dietaryTags.includes(tag)) {
        setEditForm({
          ...editForm,
          dietaryTags: editForm.dietaryTags.filter((t: string) => t !== tag)
        });
      } else {
        setEditForm({
          ...editForm,
          dietaryTags: [...editForm.dietaryTags, tag]
        });
      }
    } else {
      if (newListing.dietaryTags.includes(tag)) {
        setNewListing({
          ...newListing,
          dietaryTags: newListing.dietaryTags.filter(t => t !== tag)
        });
      } else {
        setNewListing({
          ...newListing,
          dietaryTags: [...newListing.dietaryTags, tag]
        });
      }
    }
  };
  
  const renderListingItem = ({ item }: { item: FoodListing }) => {
    const isExpired = new Date(item.availableUntil) <= new Date();
    const isSelected = selectedListings.includes(item.id);
    
    return (
      <View style={[
        styles.listingCard,
        isExpired && !item.isActive && styles.expiredCard,
        isSelected && styles.selectedCard
      ]}>
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => toggleSelectListing(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[
            styles.checkbox,
            isSelected && styles.checkboxSelected
          ]}>
            {isSelected && <Check size={16} color={colors.white} />}
          </View>
        </TouchableOpacity>
        
        <Image
          source={{ uri: item.image }}
          style={styles.listingImage}
          contentFit="cover"
        />
        
        <View style={styles.listingInfo}>
          <View style={styles.listingHeader}>
            <Text style={styles.listingName}>{item.dishName}</Text>
            <View style={styles.badgeContainer}>
              {item.isVegetarian && (
                <View style={styles.vegBadge}>
                  <Leaf size={12} color={colors.white} />
                  <Text style={styles.vegBadgeText}>Veg</Text>
                </View>
              )}
              {item.isFeatured && (
                <View style={styles.featuredBadge}>
                  <Star size={12} color={colors.white} />
                  <Text style={styles.featuredBadgeText}>Featured</Text>
                </View>
              )}
              {!item.isActive && (
                <View style={styles.inactiveBadge}>
                  <XCircle size={12} color={colors.white} />
                  <Text style={styles.inactiveBadgeText}>Inactive</Text>
                </View>
              )}
              {!item.isApproved && (
                <View style={styles.pendingBadge}>
                  <AlertTriangle size={12} color={colors.white} />
                  <Text style={styles.pendingBadgeText}>Pending</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.listingDetails}>
            <View style={styles.listingDetail}>
              <User size={14} color={colors.textLight} />
              <Text style={styles.listingDetailText}>{item.sellerName}</Text>
            </View>
            
            <View style={styles.listingDetail}>
              <DollarSign size={14} color={colors.textLight} />
              <Text style={styles.listingDetailText}>₹{item.price}</Text>
            </View>
            
            <View style={styles.listingDetail}>
              <MapPin size={14} color={colors.textLight} />
              <Text style={styles.listingDetailText} numberOfLines={1}>{item.location.address}</Text>
            </View>
            
            <View style={styles.listingDetail}>
              <Clock size={14} color={isExpired ? colors.error : colors.textLight} />
              <Text style={[
                styles.listingDetailText,
                isExpired && { color: colors.error }
              ]}>
                {isExpired ? 'Expired' : 'Available until'} {new Date(item.availableUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
          
          <View style={styles.listingStats}>
            <View style={styles.listingStat}>
              <Star size={14} color="#FFD700" />
              <Text style={styles.listingStatText}>{item.rating} ({item.reviewCount})</Text>
            </View>
            
            <View style={styles.listingStat}>
              <Text style={styles.listingStatText}>{item.remainingQuantity}/{item.availableQuantity} left</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.listingActions}>
          {showActionMenu === item.id ? (
            <View style={styles.actionMenu}>
              <TouchableOpacity 
                style={styles.actionMenuItem}
                onPress={() => handleListingAction(item, 'view')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Eye size={16} color={colors.text} />
                <Text style={styles.actionMenuItemText}>View</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionMenuItem}
                onPress={() => handleListingAction(item, 'edit')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Edit size={16} color={colors.text} />
                <Text style={styles.actionMenuItemText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionMenuItem}
                onPress={() => handleListingAction(item, 'feature')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Star size={16} color={colors.adminWarning} />
                <Text style={[styles.actionMenuItemText, { color: colors.adminWarning }]}>
                  {item.isFeatured ? 'Unfeature' : 'Feature'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionMenuItem}
                onPress={() => handleListingAction(item, 'activate')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {item.isActive ? (
                  <>
                    <ToggleRight size={16} color={colors.adminPrimary} />
                    <Text style={[styles.actionMenuItemText, { color: colors.adminPrimary }]}>Deactivate</Text>
                  </>
                ) : (
                  <>
                    <ToggleLeft size={16} color={colors.adminSuccess} />
                    <Text style={[styles.actionMenuItemText, { color: colors.adminSuccess }]}>Activate</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionMenuItem}
                onPress={() => handleListingAction(item, 'delete')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash size={16} color={colors.error} />
                <Text style={[styles.actionMenuItemText, { color: colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowActionMenu(item.id)}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <MoreVertical size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
          
          <View style={styles.approvalContainer}>
            <Text style={styles.approvalText}>Approved</Text>
            <Switch
              value={item.isApproved}
              onValueChange={() => toggleApproval(item.id)}
              trackColor={{ false: '#E0E0E0', true: `${colors.adminSuccess}50` }}
              thumbColor={item.isApproved ? colors.adminSuccess : '#BDBDBD'}
            />
          </View>
        </View>
      </View>
    );
  };
  
  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Advanced Filters</Text>
            <TouchableOpacity 
              onPress={() => setShowFilterModal(false)}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.filterSectionTitle}>Seller</Text>
            <Input
              placeholder="Filter by seller name"
              value={filterBySeller}
              onChangeText={setFilterBySeller}
            />
            
            <Text style={styles.filterSectionTitle}>Cuisine Type</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => {
                  // In a real app, this would open a picker
                  Alert.alert(
                    "Select Cuisine Type",
                    "This would open a cuisine type picker in a real app."
                  );
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.pickerButtonText}>
                  {filterByCuisine || "Select cuisine type"}
                </Text>
                <ChevronDown size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <View style={styles.priceRangeContainer}>
              <Input
                placeholder="Min"
                value={filterByPrice.min?.toString() || ''}
                onChangeText={(text) => setFilterByPrice({...filterByPrice, min: text ? parseInt(text) : undefined})}
                keyboardType="numeric"
                containerStyle={styles.priceInput}
              />
              <Text style={styles.priceRangeSeparator}>to</Text>
              <Input
                placeholder="Max"
                value={filterByPrice.max?.toString() || ''}
                onChangeText={(text) => setFilterByPrice({...filterByPrice, max: text ? parseInt(text) : undefined})}
                keyboardType="numeric"
                containerStyle={styles.priceInput}
              />
            </View>
            
            <Text style={styles.filterSectionTitle}>Approval Status</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setFilterByApproval('all')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={[
                  styles.radioButton,
                  filterByApproval === 'all' && styles.radioButtonSelected
                ]}>
                  {filterByApproval === 'all' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setFilterByApproval('approved')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={[
                  styles.radioButton,
                  filterByApproval === 'approved' && styles.radioButtonSelected
                ]}>
                  {filterByApproval === 'approved' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>Approved</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setFilterByApproval('pending')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={[
                  styles.radioButton,
                  filterByApproval === 'pending' && styles.radioButtonSelected
                ]}>
                  {filterByApproval === 'pending' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>Pending</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.filterSectionTitle}>Food Type</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setFilterByVegetarian('all')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={[
                  styles.radioButton,
                  filterByVegetarian === 'all' && styles.radioButtonSelected
                ]}>
                  {filterByVegetarian === 'all' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setFilterByVegetarian('veg')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={[
                  styles.radioButton,
                  filterByVegetarian === 'veg' && styles.radioButtonSelected
                ]}>
                  {filterByVegetarian === 'veg' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>Vegetarian</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setFilterByVegetarian('non-veg')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={[
                  styles.radioButton,
                  filterByVegetarian === 'non-veg' && styles.radioButtonSelected
                ]}>
                  {filterByVegetarian === 'non-veg' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={styles.radioLabel}>Non-Vegetarian</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="Reset Filters"
              onPress={() => {
                setFilterBySeller('');
                setFilterByCuisine('');
                setFilterByPrice({});
                setFilterByApproval('all');
                setFilterByVegetarian('all');
              }}
              variant="outline"
              style={styles.resetButton}
            />
            <Button
              title="Apply Filters"
              onPress={() => setShowFilterModal(false)}
              style={styles.applyButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
  
  const renderDetailsModal = () => {
    if (!currentListing) return null;
    
    return (
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Listing Details</Text>
              <TouchableOpacity 
                onPress={() => setShowDetailsModal(false)}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Image
                source={{ uri: currentListing.image }}
                style={styles.detailsImage}
                contentFit="cover"
              />
              
              <View style={styles.detailsHeader}>
                <Text style={styles.detailsTitle}>{currentListing.dishName}</Text>
                <View style={styles.badgeContainer}>
                  {currentListing.isVegetarian && (
                    <View style={styles.vegBadge}>
                      <Leaf size={12} color={colors.white} />
                      <Text style={styles.vegBadgeText}>Veg</Text>
                    </View>
                  )}
                  {currentListing.isFeatured && (
                    <View style={styles.featuredBadge}>
                      <Star size={12} color={colors.white} />
                      <Text style={styles.featuredBadgeText}>Featured</Text>
                    </View>
                  )}
                  {!currentListing.isActive && (
                    <View style={styles.inactiveBadge}>
                      <XCircle size={12} color={colors.white} />
                      <Text style={styles.inactiveBadgeText}>Inactive</Text>
                    </View>
                  )}
                  {!currentListing.isApproved && (
                    <View style={styles.pendingBadge}>
                      <AlertTriangle size={12} color={colors.white} />
                      <Text style={styles.pendingBadgeText}>Pending</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Basic Information</Text>
                
                <View style={styles.detailsRow}>
                  <View style={styles.detailsItem}>
                    <DollarSign size={16} color={colors.textLight} />
                    <Text style={styles.detailsLabel}>Price:</Text>
                    <Text style={styles.detailsValue}>₹{currentListing.price}</Text>
                  </View>
                  
                  <View style={styles.detailsItem}>
                    <User size={16} color={colors.textLight} />
                    <Text style={styles.detailsLabel}>Seller:</Text>
                    <Text style={styles.detailsValue}>{currentListing.sellerName}</Text>
                  </View>
                </View>
                
                <View style={styles.detailsRow}>
                  <View style={styles.detailsItem}>
                    <Tag size={16} color={colors.textLight} />
                    <Text style={styles.detailsLabel}>Cuisine:</Text>
                    <Text style={styles.detailsValue}>{currentListing.cuisineType || 'Not specified'}</Text>
                  </View>
                  
                  <View style={styles.detailsItem}>
                    <Calendar size={16} color={colors.textLight} />
                    <Text style={styles.detailsLabel}>Created:</Text>
                    <Text style={styles.detailsValue}>{new Date(currentListing.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>
              </View>
              
              {currentListing.description && (
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Description</Text>
                  <Text style={styles.detailsDescription}>{currentListing.description}</Text>
                </View>
              )}
              
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Availability</Text>
                
                <View style={styles.detailsRow}>
                  <View style={styles.detailsItem}>
                    <Clock size={16} color={colors.textLight} />
                    <Text style={styles.detailsLabel}>From:</Text>
                    <Text style={styles.detailsValue}>
                      {new Date(currentListing.availableFrom).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  
                  <View style={styles.detailsItem}>
                    <Clock size={16} color={colors.textLight} />
                    <Text style={styles.detailsLabel}>Until:</Text>
                    <Text style={styles.detailsValue}>
                      {new Date(currentListing.availableUntil).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailsRow}>
                  <View style={styles.detailsItem}>
                    <Info size={16} color={colors.textLight} />
                    <Text style={styles.detailsLabel}>Total:</Text>
                    <Text style={styles.detailsValue}>{currentListing.availableQuantity} units</Text>
                  </View>
                  
                  <View style={styles.detailsItem}>
                    <Info size={16} color={colors.textLight} />
                    <Text style={styles.detailsLabel}>Remaining:</Text>
                    <Text style={styles.detailsValue}>{currentListing.remainingQuantity} units</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Nutrition & Preparation</Text>
                
                <View style={styles.detailsRow}>
                  {currentListing.calories && (
                    <View style={styles.detailsItem}>
                      <Info size={16} color={colors.textLight} />
                      <Text style={styles.detailsLabel}>Calories:</Text>
                      <Text style={styles.detailsValue}>{currentListing.calories} kcal</Text>
                    </View>
                  )}
                  
                  {currentListing.portionSize && (
                    <View style={styles.detailsItem}>
                      <Info size={16} color={colors.textLight} />
                      <Text style={styles.detailsLabel}>Portion:</Text>
                      <Text style={styles.detailsValue}>{currentListing.portionSize}</Text>
                    </View>
                  )}
                </View>
                
                {currentListing.preparationTime && (
                  <View style={styles.detailsRow}>
                    <View style={styles.detailsItem}>
                      <Clock size={16} color={colors.textLight} />
                      <Text style={styles.detailsLabel}>Prep Time:</Text>
                      <Text style={styles.detailsValue}>{currentListing.preparationTime}</Text>
                    </View>
                  </View>
                )}
                
                {currentListing.dietaryTags && currentListing.dietaryTags.length > 0 && (
                  <View style={styles.dietaryTagsContainer}>
                    <Text style={styles.detailsLabel}>Dietary Tags:</Text>
                    <View style={styles.dietaryTags}>
                      {currentListing.dietaryTags.map((tag, index) => (
                        <View key={index} style={styles.dietaryTag}>
                          <Text style={styles.dietaryTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Ingredients & Allergens</Text>
                
                <View style={styles.listContainer}>
                  <Text style={styles.detailsLabel}>Ingredients:</Text>
                  {currentListing.ingredients.map((ingredient, index) => (
                    <Text key={index} style={styles.listItem}>• {ingredient}</Text>
                  ))}
                </View>
                
                {currentListing.allergens.length > 0 && (
                  <View style={styles.listContainer}>
                    <Text style={styles.detailsLabel}>Allergens:</Text>
                    {currentListing.allergens.map((allergen, index) => (
                      <Text key={index} style={styles.listItem}>• {allergen}</Text>
                    ))}
                  </View>
                )}
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Location</Text>
                <Text style={styles.detailsAddress}>{currentListing.location.address}</Text>
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Stats</Text>
                
                <View style={styles.detailsRow}>
                  <View style={styles.detailsItem}>
                    <Star size={16} color={colors.textLight} />
                    <Text style={styles.detailsLabel}>Rating:</Text>
                    <Text style={styles.detailsValue}>{currentListing.rating} ({currentListing.reviewCount} reviews)</Text>
                  </View>
                  
                  <View style={styles.detailsItem}>
                    <Info size={16} color={colors.textLight} />
                    <Text style={styles.detailsLabel}>Orders:</Text>
                    <Text style={styles.detailsValue}>{currentListing.orderCount || 0}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Edit Listing"
                onPress={() => {
                  setShowDetailsModal(false);
                  handleListingAction(currentListing, 'edit');
                }}
                variant="outline"
                style={styles.resetButton}
              />
              <Button
                title="Close"
                onPress={() => setShowDetailsModal(false)}
                style={styles.applyButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  const renderEditModal = () => {
    if (!currentListing) return null;
    
    return (
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Listing</Text>
              <TouchableOpacity 
                onPress={() => setShowEditModal(false)}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Input
                label="Dish Name"
                placeholder="Enter dish name"
                value={editForm.dishName}
                onChangeText={(text) => setEditForm({...editForm, dishName: text})}
              />
              
              <Input
                label="Price (₹)"
                placeholder="Enter price"
                value={editForm.price}
                onChangeText={(text) => setEditForm({...editForm, price: text})}
                keyboardType="numeric"
              />
              
              <Input
                label="Description"
                placeholder="Enter description"
                value={editForm.description}
                onChangeText={(text) => setEditForm({...editForm, description: text})}
                multiline
                numberOfLines={3}
              />
              
              <Input
                label="Image URL"
                placeholder="Enter image URL"
                value={editForm.image}
                onChangeText={(text) => setEditForm({...editForm, image: text})}
              />
              
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Vegetarian</Text>
                <Switch
                  value={editForm.isVegetarian}
                  onValueChange={(value) => setEditForm({...editForm, isVegetarian: value})}
                  trackColor={{ false: '#E0E0E0', true: `${colors.vegetarian}50` }}
                  thumbColor={editForm.isVegetarian ? colors.vegetarian : '#BDBDBD'}
                />
              </View>
              
              <Input
                label="Cuisine Type"
                placeholder="Enter cuisine type"
                value={editForm.cuisineType}
                onChangeText={(text) => setEditForm({...editForm, cuisineType: text})}
              />
              
              <Input
                label="Ingredients (comma separated)"
                placeholder="Enter ingredients"
                value={editForm.ingredients}
                onChangeText={(text) => setEditForm({...editForm, ingredients: text})}
              />
              
              <Input
                label="Allergens (comma separated)"
                placeholder="Enter allergens"
                value={editForm.allergens}
                onChangeText={(text) => setEditForm({...editForm, allergens: text})}
              />
              
              <Input
                label="Available Quantity"
                placeholder="Enter quantity"
                value={editForm.availableQuantity}
                onChangeText={(text) => setEditForm({...editForm, availableQuantity: text})}
                keyboardType="numeric"
              />
              
              <Input
                label="Available From"
                placeholder="YYYY-MM-DDTHH:MM:SSZ"
                value={editForm.availableFrom}
                onChangeText={(text) => setEditForm({...editForm, availableFrom: text})}
              />
              
              <Input
                label="Available Until"
                placeholder="YYYY-MM-DDTHH:MM:SSZ"
                value={editForm.availableUntil}
                onChangeText={(text) => setEditForm({...editForm, availableUntil: text})}
              />
              
              <Text style={styles.sectionTitle}>Additional Attributes</Text>
              
              <Input
                label="Calories"
                placeholder="Enter calories"
                value={editForm.calories}
                onChangeText={(text) => setEditForm({...editForm, calories: text})}
                keyboardType="numeric"
              />
              
              <Input
                label="Portion Size"
                placeholder="Enter portion size (e.g., 250g)"
                value={editForm.portionSize}
                onChangeText={(text) => setEditForm({...editForm, portionSize: text})}
              />
              
              <Input
                label="Preparation Time"
                placeholder="Enter prep time (e.g., 15 mins)"
                value={editForm.preparationTime}
                onChangeText={(text) => setEditForm({...editForm, preparationTime: text})}
              />
              
              <Text style={styles.formLabel}>Dietary Tags</Text>
              <View style={styles.tagsContainer}>
                {dietaryTagOptions.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.tagButton,
                      editForm.dietaryTags.includes(tag) && styles.tagButtonSelected
                    ]}
                    onPress={() => toggleDietaryTag(tag)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[
                      styles.tagButtonText,
                      editForm.dietaryTags.includes(tag) && styles.tagButtonTextSelected
                    ]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.sectionTitle}>Status</Text>
              
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Active</Text>
                <Switch
                  value={editForm.isActive}
                  onValueChange={(value) => setEditForm({...editForm, isActive: value})}
                  trackColor={{ false: '#E0E0E0', true: `${colors.adminSuccess}50` }}
                  thumbColor={editForm.isActive ? colors.adminSuccess : '#BDBDBD'}
                />
              </View>
              
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Approved</Text>
                <Switch
                  value={editForm.isApproved}
                  onValueChange={(value) => setEditForm({...editForm, isApproved: value})}
                  trackColor={{ false: '#E0E0E0', true: `${colors.adminSuccess}50` }}
                  thumbColor={editForm.isApproved ? colors.adminSuccess : '#BDBDBD'}
                />
              </View>
              
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Featured</Text>
                <Switch
                  value={editForm.isFeatured}
                  onValueChange={(value) => setEditForm({...editForm, isFeatured: value})}
                  trackColor={{ false: '#E0E0E0', true: `${colors.adminWarning}50` }}
                  thumbColor={editForm.isFeatured ? colors.adminWarning : '#BDBDBD'}
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => setShowEditModal(false)}
                variant="outline"
                style={styles.resetButton}
              />
              <Button
                title="Save Changes"
                onPress={handleUpdateListing}
                style={styles.applyButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };
  
  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAddModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Listing</Text>
            <TouchableOpacity 
              onPress={() => setShowAddModal(false)}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Input
              label="Dish Name *"
              placeholder="Enter dish name"
              value={newListing.dishName}
              onChangeText={(text) => setNewListing({...newListing, dishName: text})}
            />
            
            <Input
              label="Price (₹) *"
              placeholder="Enter price"
              value={newListing.price}
              onChangeText={(text) => setNewListing({...newListing, price: text})}
              keyboardType="numeric"
            />
            
            <Input
              label="Description"
              placeholder="Enter description"
              value={newListing.description}
              onChangeText={(text) => setNewListing({...newListing, description: text})}
              multiline
              numberOfLines={3}
            />
            
            <Input
              label="Image URL"
              placeholder="Enter image URL"
              value={newListing.image}
              onChangeText={(text) => setNewListing({...newListing, image: text})}
            />
            
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Vegetarian</Text>
              <Switch
                value={newListing.isVegetarian}
                onValueChange={(value) => setNewListing({...newListing, isVegetarian: value})}
                trackColor={{ false: '#E0E0E0', true: `${colors.vegetarian}50` }}
                thumbColor={newListing.isVegetarian ? colors.vegetarian : '#BDBDBD'}
              />
            </View>
            
            <Input
              label="Cuisine Type"
              placeholder="Enter cuisine type"
              value={newListing.cuisineType}
              onChangeText={(text) => setNewListing({...newListing, cuisineType: text})}
            />
            
            <Input
              label="Ingredients (comma separated)"
              placeholder="Enter ingredients"
              value={newListing.ingredients}
              onChangeText={(text) => setNewListing({...newListing, ingredients: text})}
            />
            
            <Input
              label="Allergens (comma separated)"
              placeholder="Enter allergens"
              value={newListing.allergens}
              onChangeText={(text) => setNewListing({...newListing, allergens: text})}
            />
            
            <Input
              label="Available Quantity *"
              placeholder="Enter quantity"
              value={newListing.availableQuantity}
              onChangeText={(text) => setNewListing({...newListing, availableQuantity: text})}
              keyboardType="numeric"
            />
            
            <Text style={styles.sectionTitle}>Additional Attributes</Text>
            
            <Input
              label="Calories"
              placeholder="Enter calories"
              value={newListing.calories}
              onChangeText={(text) => setNewListing({...newListing, calories: text})}
              keyboardType="numeric"
            />
            
            <Input
              label="Portion Size"
              placeholder="Enter portion size (e.g., 250g)"
              value={newListing.portionSize}
              onChangeText={(text) => setNewListing({...newListing, portionSize: text})}
            />
            
            <Input
              label="Preparation Time"
              placeholder="Enter prep time (e.g., 15 mins)"
              value={newListing.preparationTime}
              onChangeText={(text) => setNewListing({...newListing, preparationTime: text})}
            />
            
            <Text style={styles.formLabel}>Dietary Tags</Text>
            <View style={styles.tagsContainer}>
              {dietaryTagOptions.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tagButton,
                    newListing.dietaryTags.includes(tag) && styles.tagButtonSelected
                  ]}
                  onPress={() => toggleDietaryTag(tag)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[
                    styles.tagButtonText,
                    newListing.dietaryTags.includes(tag) && styles.tagButtonTextSelected
                  ]}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => setShowAddModal(false)}
              variant="outline"
              style={styles.resetButton}
            />
            <Button
              title="Add Listing"
              onPress={handleAddListing}
              style={styles.applyButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search listings..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      <View style={styles.actionBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'all' && styles.filterButtonActive
              ]}
              onPress={() => setFilter('all')}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <Text style={[
                styles.filterButtonText,
                filter === 'all' && styles.filterButtonTextActive
              ]}>All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'active' && styles.filterButtonActive
              ]}
              onPress={() => setFilter('active')}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <Text style={[
                styles.filterButtonText,
                filter === 'active' && styles.filterButtonTextActive
              ]}>Active</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'expired' && styles.filterButtonActive
              ]}
              onPress={() => setFilter('expired')}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <Text style={[
                styles.filterButtonText,
                filter === 'expired' && styles.filterButtonTextActive
              ]}>Inactive</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'featured' && styles.filterButtonActive
              ]}
              onPress={() => setFilter('featured')}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <Text style={[
                styles.filterButtonText,
                filter === 'featured' && styles.filterButtonTextActive
              ]}>Featured</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === 'pending' && styles.filterButtonActive
              ]}
              onPress={() => setFilter('pending')}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <Text style={[
                styles.filterButtonText,
                filter === 'pending' && styles.filterButtonTextActive
              ]}>Pending</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowFilterModal(true)}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Filter size={20} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowExportOptions(!showExportOptions)}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Download size={20} color={colors.text} />
            {showExportOptions && (
              <View style={styles.exportMenu}>
                <TouchableOpacity
                  style={styles.exportMenuItem}
                  onPress={() => {
                    setExportFormat('csv');
                    exportListings();
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <FileText size={16} color={colors.text} />
                  <Text style={styles.exportMenuItemText}>Export as CSV</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.exportMenuItem}
                  onPress={() => {
                    setExportFormat('json');
                    exportListings();
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <FileText size={16} color={colors.text} />
                  <Text style={styles.exportMenuItemText}>Export as JSON</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Plus size={20} color={colors.white} />
            <Text style={styles.addButtonText}>Add Listing</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {selectedListings.length > 0 && (
        <View style={styles.bulkActionBar}>
          <View style={styles.selectionInfo}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={toggleSelectAll}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={[
                styles.checkbox,
                selectAll && styles.checkboxSelected
              ]}>
                {selectAll && <Check size={16} color={colors.white} />}
              </View>
            </TouchableOpacity>
            <Text style={styles.selectionText}>{selectedListings.length} selected</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bulkActions}>
            <TouchableOpacity
              style={styles.bulkActionButton}
              onPress={() => handleBulkAction('approve')}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <CheckCircle size={16} color={colors.adminSuccess} />
              <Text style={styles.bulkActionText}>Approve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.bulkActionButton}
              onPress={() => handleBulkAction('reject')}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <XCircle size={16} color={colors.error} />
              <Text style={styles.bulkActionText}>Reject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.bulkActionButton}
              onPress={() => handleBulkAction('activate')}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <ToggleRight size={16} color={colors.adminSuccess} />
              <Text style={styles.bulkActionText}>Activate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.bulkActionButton}
              onPress={() => handleBulkAction('deactivate')}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <ToggleLeft size={16} color={colors.adminPrimary} />
              <Text style={styles.bulkActionText}>Deactivate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.bulkActionButton}
              onPress={() => handleBulkAction('feature')}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <Star size={16} color={colors.adminWarning} />
              <Text style={styles.bulkActionText}>Feature</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.bulkActionButton}
              onPress={() => handleBulkAction('unfeature')}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <Star size={16} color={colors.textLight} />
              <Text style={styles.bulkActionText}>Unfeature</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.bulkActionButton, styles.bulkActionButtonDanger]}
              onPress={() => handleBulkAction('delete')}
              hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
            >
              <Trash size={16} color={colors.error} />
              <Text style={[styles.bulkActionText, styles.bulkActionTextDanger]}>Delete</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading listings...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredListings}
          renderItem={renderListingItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No listings found</Text>
              <Button
                title="Add New Listing"
                onPress={() => setShowAddModal(true)}
                style={styles.emptyAddButton}
              />
            </View>
          }
        />
      )}
      
      {renderFilterModal()}
      {renderDetailsModal()}
      {renderEditModal()}
      {renderAddModal()}
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
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScrollView: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F1F5F9',
    minWidth: 70, // Ensure buttons have enough touch area
    alignItems: 'center',
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 10, // Increased touch area
    marginLeft: 8,
    position: 'relative',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.adminSuccess,
    paddingVertical: 10, // Increased touch area
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  exportMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
    width: 160,
  },
  exportMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  exportMenuItemText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  bulkActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  selectionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  bulkActions: {
    flex: 1,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80, // Ensure buttons have enough touch area
  },
  bulkActionButtonDanger: {
    borderColor: colors.error,
  },
  bulkActionText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
  },
  bulkActionTextDanger: {
    color: colors.error,
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
  listingCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expiredCard: {
    opacity: 0.7,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.adminPrimary,
  },
  checkboxContainer: {
    padding: 10, // Increased touch area
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  checkboxSelected: {
    backgroundColor: colors.adminPrimary,
    borderColor: colors.adminPrimary,
  },
  listingImage: {
    width: 100,
    height: 100,
    backgroundColor: colors.border,
  },
  listingInfo: {
    flex: 1,
    padding: 12,
  },
  listingHeader: {
    marginBottom: 4,
  },
  listingName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vegBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.vegetarian,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  vegBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
    marginLeft: 2,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.adminWarning,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  featuredBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
    marginLeft: 2,
  },
  inactiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.textLight,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  inactiveBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
    marginLeft: 2,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  pendingBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
    marginLeft: 2,
  },
  listingDetails: {
    marginBottom: 8,
  },
  listingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  listingDetailText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 6,
  },
  listingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listingStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingStatText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 4,
  },
  listingActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 8,
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
    padding: 10, // Increased touch area
    paddingHorizontal: 12,
  },
  actionMenuItemText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  approvalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  approvalText: {
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
    marginBottom: 16,
  },
  emptyAddButton: {
    marginTop: 16,
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
  modalContent: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    marginRight: 8,
  },
  applyButton: {
    minWidth: 100,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 16,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  pickerButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceInput: {
    flex: 1,
  },
  priceRangeSeparator: {
    marginHorizontal: 8,
    color: colors.text,
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4, // Increased touch area
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: colors.adminPrimary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.adminPrimary,
  },
  radioLabel: {
    fontSize: 16,
    color: colors.text,
  },
  detailsImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailsHeader: {
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  detailsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
    minWidth: '45%',
  },
  detailsLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 4,
    marginRight: 4,
  },
  detailsValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  detailsDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  detailsAddress: {
    fontSize: 14,
    color: colors.text,
  },
  listItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    paddingLeft: 8,
  },
  dietaryTagsContainer: {
    marginTop: 8,
  },
  dietaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  dietaryTag: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  dietaryTagText: {
    fontSize: 12,
    color: colors.text,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  formLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 24,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8, // Increased touch area
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagButtonSelected: {
    backgroundColor: `${colors.adminPrimary}20`,
    borderWidth: 1,
    borderColor: colors.adminPrimary,
  },
  tagButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  tagButtonTextSelected: {
    color: colors.adminPrimary,
    fontWeight: '500',
  },
});