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
  rating?: number;
  reviewCount?: number;
  preferences?: {
    notifications: boolean;
    emailAlerts: boolean;
    language: string;
    currency: string;
    packagingType?: string;
    mealTypes?: string[];
  };
  isAdmin?: boolean;
  isVerified?: boolean;
  // New fields for route-based features
  officeAddress?: string;
  officeLocation?: {
    latitude: number;
    longitude: number;
  };
  homeToOfficeRoute?: RouteLocation[];
  officeToHomeRoute?: RouteLocation[];
  routesSameAsHomeToOffice?: boolean;
  detourPreference?: number; // in meters
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
  sellerRating?: number;
  dishName: string;
  description?: string;
  price: number;
  image: string;
  isVegetarian: boolean;
  cuisineType?: string;
  ingredients: string[];
  allergens: string[];
  availableQuantity: number;
  remainingQuantity: number;
  availableFrom: string;
  availableUntil: string;
  quantity?: string;
  servings?: number;
  packaging?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  rating?: number;
  reviewCount?: number;
  orderCount?: number;
  createdAt: string;
  isFeatured?: boolean;
  isApproved?: boolean;
  isActive?: boolean;
  calories?: number;
  portionSize?: string;
  preparationTime?: string;
  dietaryTags?: string[];
}

export type OrderStatus = 
  | 'pending'
  | 'accepted'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'in_delivery'
  | 'delivered'
  | 'completed'
  | 'canceled'
  | 'refund_requested'
  | 'refunded';

export type DeliveryMethod = 'pickup' | 'delivery';
export type PaymentMethod = 'cash' | 'upi' | 'online';

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  listingSnapshot: {
    dishName: string;
    price: number;
    image: string;
    sellerName: string;
    sellerImage: string;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
  };
  quantity: number;
  totalPrice: number;
  deliveryAddress: string;
  deliveryInstructions?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: OrderStatus;
  cancellationReason?: string;
  refundReason?: string;
  rating?: number;
  reviewComment?: string;
  isRated?: boolean;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  canceledAt?: string;
  deliveryMethod: DeliveryMethod;
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
  images?: string[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system' | 'review';
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Complaint {
  id: string;
  userId: string;
  orderId?: string;
  sellerId?: string;
  buyerId?: string;
  type: 'order' | 'seller' | 'payment' | 'app' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FilterOptions {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  cuisineTypes?: string[];
  maxDistance?: number;
  minServings?: number;
  maxServings?: number;
  availableNow?: boolean;
  availableDate?: string;
  sortBy?: 'price' | 'rating' | 'distance' | 'availableUntil' | 'servings';
  sortOrder?: 'asc' | 'desc';
  foodType?: 'vegetarian' | 'non-vegetarian' | 'both';
  onRoute?: 'homeToOffice' | 'officeToHome';
  maxDetour?: number;
}

export interface SearchParams extends FilterOptions {
  query: string;
}

export interface RouteSearchParams {
  routeType: 'homeToOffice' | 'officeToHome';
  dishName?: string;
  maxDetour?: number;
  cuisineTypes?: string[];
  foodType?: 'vegetarian' | 'non-vegetarian' | 'both';
}

// Admin-specific types
export interface AdminStats {
  totalUsers: number;
  totalChefs: number;
  totalListings: number;
  totalOrders: number;
  totalRevenue: number;
  activeListings: number;
  pendingOrders: number;
  completedOrders: number;
  canceledOrders: number;
}

export interface AdminAction {
  id: string;
  type: 'user_ban' | 'listing_remove' | 'order_refund' | 'complaint_resolve';
  targetId: string;
  reason: string;
  adminId: string;
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

export interface Campaign {
  id: string;
  title: string;
  description: string;
  type: 'email' | 'push' | 'in_app';
  targetAudience: 'all' | 'buyers' | 'sellers' | 'inactive';
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  metrics?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
}

export interface AdminMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminConversation {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

export interface DetailedAddress {
  houseNumber: string;
  buildingName?: string;
  streetName: string;
  area: string;
  landmark?: string;
  city: string;
  district?: string;
  state: string;
  pinCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}