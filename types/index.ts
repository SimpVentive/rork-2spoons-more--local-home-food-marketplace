export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  profileImage: string;
  experience: string;
  cuisineTypes: string[];
  paymentMethods: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  isChef: boolean;
  allowProfileDisplay: boolean;
  isVerified: boolean;
  isAdmin?: boolean;
  rating?: number;
  reviewCount?: number;
  // New route-related fields
  officeAddress?: string;
  officeLocation?: {
    latitude: number;
    longitude: number;
  };
  homeToOfficeRoute?: RouteLocation[];
  officeToHomeRoute?: RouteLocation[];
  routesSameAsHomeToOffice?: boolean;
  detourPreference?: number; // in meters
  // Chef subscription fields
  subscriptionPlan?: string;
  subscriptionExpiry?: string;
  firstPostDate?: string | null;
  postCount?: number;
  freePostsRemaining?: number;
}

export interface RouteLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface UserPreference {
  type: 'buyer' | 'seller';
}

export interface FoodListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerImage: string;
  sellerRating: number;
  dishName: string;
  description: string;
  image: string;
  ingredients: string[];
  allergens: string[];
  quantity: number;
  remainingQuantity: number;
  availableQuantity: number;
  price: number;
  isVegetarian: boolean;
  cuisineType: string;
  spiceLevel: 'mild' | 'medium' | 'hot';
  preparationTime: number;
  pickupTime: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  isActive: boolean;
  createdAt: string;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  commission?: number;
}

export interface FilterOptions {
  cuisineTypes: string[];
  isVegetarian?: boolean;
  spiceLevel?: string[];
  maxPrice?: number;
  maxDistance?: number;
  sortBy?: 'price' | 'rating' | 'distance' | 'newest';
}

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  dishName: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  pickupTime: string;
  createdAt: string;
  updatedAt: string;
  buyerName: string;
  buyerPhone: string;
  sellerName: string;
  sellerPhone: string;
  sellerAddress: string;
  paymentMethod: string;
  notes?: string;
  rating?: number;
  review?: string;
  commission?: number;
  commissionAmount?: number;
}

export interface Review {
  id: string;
  orderId: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  buyerName: string;
  dishName: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'review' | 'system' | 'promotion';
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderId?: string;
  listingId?: string;
  type: 'order' | 'listing' | 'user' | 'payment' | 'other';
  subject: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  resolution?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  type: 'promotion' | 'announcement' | 'feature';
  targetAudience: 'all' | 'buyers' | 'sellers' | 'new_users';
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  imageUrl?: string;
  actionUrl?: string;
  actionText?: string;
}