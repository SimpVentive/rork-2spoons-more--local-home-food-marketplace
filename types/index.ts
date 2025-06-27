export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface RouteLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

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
  location: Location;
  isChef: boolean;
  allowProfileDisplay: boolean;
  isAdmin?: boolean;
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  officeAddress?: string;
  officeLocation?: Location;
  homeToOfficeRoute?: RouteLocation[];
  officeToHomeRoute?: RouteLocation[];
  routesSameAsHomeToOffice?: boolean;
  detourPreference?: number; // in meters
  // Chef subscription data
  subscriptionPlan?: string;
  subscriptionExpiry?: string;
  firstPostDate?: string | null;
  postCount?: number;
  freePostsRemaining?: number;
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
  price: number;
  image: string;
  isVegetarian: boolean;
  cuisineType: string;
  subcuisineType?: string;
  ingredients: string[];
  allergens: string[];
  availableQuantity: number;
  remainingQuantity: number;
  availableFrom: string;
  availableUntil: string;
  servings: number;
  packaging: string;
  location: Location;
  rating?: number;
  reviewCount?: number;
  orderCount?: number;
  createdAt: string;
  isFeatured?: boolean;
  isApproved?: boolean;
  isActive?: boolean;
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

export interface ListingSnapshot {
  dishName: string;
  price: number;
  image: string;
  sellerName: string;
  sellerImage: string;
  location: Location;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  listingSnapshot: ListingSnapshot;
  quantity: number;
  totalPrice: number;
  deliveryAddress: string;
  deliveryInstructions?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'completed' | 'canceled';
  rating?: number;
  reviewComment?: string;
  isRated?: boolean;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  deliveryMethod: 'delivery' | 'pickup';
}

export interface Review {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerImage: string;
  sellerId: string;
  sellerName: string;
  listingId: string;
  dishName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  userId: string;
  orderId?: string;
  sellerId?: string;
  type: 'order' | 'app' | 'payment' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'review' | 'promotion' | 'system' | 'payment';
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DishNotification {
  id: string;
  userId: string;
  dishName: string;
  cuisineType?: string;
  subcuisineType?: string;
  location?: string;
  routeType?: 'homeToOffice' | 'officeToHome';
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
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

export interface RouteSearchParams {
  routeType: 'homeToOffice' | 'officeToHome';
  maxDetour: number;
  foodType: 'vegetarian' | 'non-vegetarian' | 'both';
  dishName?: string;
  cuisineTypes?: string[];
  subcuisineTypes?: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: 'month' | 'year';
  features: string[];
}