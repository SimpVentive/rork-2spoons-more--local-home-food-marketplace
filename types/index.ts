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
  commissionPercentage?: number;
  // Route-related fields
  homeAddress?: string;
  homeCoordinates?: {
    latitude: number;
    longitude: number;
  } | undefined;
  officeAddress?: string;
  officeLocation?: {
    latitude: number;
    longitude: number;
  };
  officeCoordinates?: {
    latitude: number;
    longitude: number;
  } | undefined;
  customLocations?: RoutePoint[];
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

export interface RoutePoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'home' | 'office' | 'custom';
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
  subcuisineType?: string;
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
  availableFrom: string;
  availableUntil: string;
  servings: number;
  packaging: string;
  orderCount?: number;
  isFeatured?: boolean;
  isApproved?: boolean;
  isLunchBox?: boolean;
  lunchBoxItems?: LunchBoxItem[];
}

export interface LunchBoxItem {
  id: string;
  name: string;
  description: string;
  quantity: string;
  image: string;
}

export interface FilterOptions {
  query?: string;
  cuisineTypes?: string[];
  subcuisineTypes?: string[];
  isVegetarian?: boolean;
  foodType?: 'vegetarian' | 'non-vegetarian' | 'both';
  spiceLevel?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxDistance?: number;
  sortBy?: 'price' | 'rating' | 'distance' | 'availableUntil' | 'servings';
  sortOrder?: 'asc' | 'desc';
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  availableNow?: boolean;
  minServings?: number;
  maxServings?: number;
}

export interface RouteSearchParams {
  routeType: 'homeToOffice' | 'officeToHome';
  maxDetour: number; // in meters
  dishName?: string;
  cuisineTypes?: string[];
  subcuisineTypes?: string[];
  foodType: 'vegetarian' | 'non-vegetarian' | 'both';
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
  listingSnapshot?: {
    dishName: string;
    price: number;
    image: string;
    sellerName: string;
    sellerImage: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
  deliveryAddress?: string;
  deliveryInstructions?: string;
  paymentStatus?: string;
  reviewComment?: string;
  isRated?: boolean;
  acceptedAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  deliveryMethod?: string;
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
  buyerImage?: string;
  sellerName: string;
  dishName: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'review' | 'system' | 'promotion' | 'follow' | 'dish' | 'route_dish';
  isRead: boolean;
  createdAt: string;
  data?: any;
  relatedId?: string;
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
  sellerId?: string;
  type: 'order' | 'listing' | 'user' | 'payment' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
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

export interface TopEarner {
  id: string;
  name: string;
  earnings: number;
  location: string;
  phone: string;
  orderCount: number;
}

export interface TopDish {
  id: string;
  name: string;
  orderCount: number;
  revenue: number;
  sellerName: string;
  sellerPhone: string;
  sellerLocation: string;
}

export interface TopChef {
  id: string;
  name: string;
  rating: number;
  orderCount: number;
  revenue: number;
  location: string;
  phone: string;
  cuisineTypes: string[];
  isVerified: boolean;
}

export interface AdminDashboardData {
  totalBuyers: number;
  newUsersToday: number;
  activeUsers: number;
  topEarners: TopEarner[];
  topDishes: TopDish[];
  topChefs: TopChef[];
  monthlyTrends: {
    users: number[];
    revenue: number[];
    orders: number[];
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
}

export interface DishNotification {
  id: string;
  userId: string;
  dishName?: string;
  cuisineType?: string;
  subcuisineType?: string;
  location?: string;
  routeType?: 'homeToOffice' | 'officeToHome';
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}