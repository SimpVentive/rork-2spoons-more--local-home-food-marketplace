import { User, FoodListing, Order, Review, Complaint, Notification, Follow, TopEarner, TopDish, TopChef, AdminDashboardData, SubscriptionPlan } from '@/types';
import { loadWithCache, getEssentialData } from '@/utils/dataOptimization';

// Minimal essential data for initial render - reduced by 70%
export const getEssentialMockUsers = (): User[] => [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    address: '123 Main St, Anytown, USA',
    profileImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop&q=80',
    experience: '5 years of cooking experience',
    cuisineTypes: ['Indian', 'Italian'],
    paymentMethods: ['UPI', 'Card'],
    location: {
      latitude: 17.4123,
      longitude: 78.2679,
    },
    isChef: false,
    allowProfileDisplay: true,
    isVerified: true,
    rating: 4.5,
    reviewCount: 12,
    officeAddress: 'Tech Park, Hitech City',
    officeLocation: {
      latitude: 17.4400,
      longitude: 78.3800,
    },
    homeToOfficeRoute: [],
    officeToHomeRoute: [],
    routesSameAsHomeToOffice: true,
    detourPreference: 500,
    freePostsRemaining: 3,
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1987654321',
    address: '456 Oak St, Othertown, USA',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80',
    experience: '10 years of professional cooking',
    cuisineTypes: ['Chinese', 'Thai', 'Japanese'],
    paymentMethods: ['UPI', 'Cash'],
    location: {
      latitude: 17.4223,
      longitude: 78.3379,
    },
    isChef: true,
    allowProfileDisplay: true,
    isVerified: true,
    rating: 4.8,
    reviewCount: 45,
    officeAddress: 'Business Center, Financial District',
    officeLocation: {
      latitude: 17.4100,
      longitude: 78.3900,
    },
    homeToOfficeRoute: [],
    officeToHomeRoute: [],
    routesSameAsHomeToOffice: true,
    detourPreference: 700,
    freePostsRemaining: 1,
  },
];

// Lazy-loaded full user data
export const mockUsers: User[] = [
  ...getEssentialMockUsers(),
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+1122334455',
    address: '789 Admin St, Admintown, USA',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80',
    experience: 'Platform administrator',
    cuisineTypes: [],
    paymentMethods: [],
    location: {
      latitude: 17.4323,
      longitude: 78.3679,
    },
    isChef: false,
    allowProfileDisplay: false,
    isAdmin: true,
    isVerified: true,
    rating: 0,
    reviewCount: 0,
  },
];

// Essential cuisine types only - load more on demand
export const ESSENTIAL_CUISINE_TYPES = ['Indian', 'Chinese', 'Italian', 'Mexican'];

// For backwards compatibility
export const CUISINE_TYPES = ESSENTIAL_CUISINE_TYPES;

// Lazy-loaded extended cuisine types
export const getExtendedCuisineTypes = () => [
  'Thai', 'Japanese', 'American', 'Mediterranean', 'Middle Eastern',
  'Korean', 'Vietnamese', 'French', 'Spanish', 'Greek', 'Turkish'
];

// Minimal South Indian subcuisines for initial load
export const ESSENTIAL_SOUTH_INDIAN = {
  'Tamil': ['Chettinad'],
  'Kerala': ['Malabar'],
  'Andhra': ['Coastal Andhra'],
  'Karnataka': ['Udupi']
};

// Payment Methods
export const PAYMENT_METHODS = [
  'UPI',
  'Card',
  'Cash',
  'Wallet',
  'Net Banking',
];

// Packaging Types
export const PACKAGING_TYPES = [
  'Eco-friendly container',
  'Reusable lunch box',
  'Disposable container',
  'Glass container',
  'Steel container',
  'Biodegradable container',
];

// Subscription Plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for occasional sellers',
    price: 299,
    duration: 'month',
    features: [
      'Up to 10 listings per month',
      'Basic analytics',
      'Standard visibility',
      'Email support',
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    description: 'For regular home chefs',
    price: 599,
    duration: 'month',
    features: [
      'Up to 30 listings per month',
      'Advanced analytics',
      'Featured in search results',
      'Priority email support',
      'Reduced platform fees',
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    description: 'For professional home chefs',
    price: 999,
    duration: 'month',
    features: [
      'Unlimited listings',
      'Premium analytics',
      'Featured in homepage',
      'Priority phone support',
      'Lowest platform fees',
      'Verified badge',
      'Custom menu page',
    ],
  },
];

// Essential food listings for initial render (reduced from 4 to 2)
export const getEssentialFoodListings = (): FoodListing[] => [
  {
    id: 'listing1',
    sellerId: 'user2',
    sellerName: 'Jane Smith',
    sellerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80',
    sellerRating: 4.8,
    dishName: 'Homemade Butter Chicken',
    description: 'Authentic North Indian butter chicken made with organic ingredients and traditional spices.',
    price: 250,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop&q=80',
    isVegetarian: false,
    cuisineType: 'Indian',
    subcuisineType: 'North Indian',
    ingredients: ['Chicken', 'Butter', 'Cream', 'Tomatoes', 'Spices'],
    allergens: ['Dairy', 'Nuts'],
    availableQuantity: 4,
    remainingQuantity: 3,
    availableFrom: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    availableUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    servings: 2,
    packaging: 'Eco-friendly container',
    location: {
      latitude: 17.4223,
      longitude: 78.3379,
    },
    rating: 4.7,
    reviewCount: 15,
    orderCount: 25,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isFeatured: true,
    isApproved: true,
    isActive: true,
    address: '456 Oak St, Othertown, USA',
    spiceLevel: 'medium',
    preparationTime: 30,
    pickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    quantity: 4,
  },
  {
    id: 'listing2',
    sellerId: 'user2',
    sellerName: 'Jane Smith',
    sellerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80',
    sellerRating: 4.8,
    dishName: 'Vegetable Biryani',
    description: 'Fragrant basmati rice cooked with mixed vegetables and aromatic spices.',
    price: 180,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop&q=80',
    isVegetarian: true,
    cuisineType: 'Indian',
    subcuisineType: 'Hyderabadi',
    ingredients: ['Basmati Rice', 'Mixed Vegetables', 'Spices', 'Ghee'],
    allergens: ['Dairy'],
    availableQuantity: 4,
    remainingQuantity: 3,
    availableFrom: '2023-06-27T11:00:00Z',
    availableUntil: '2023-06-27T19:00:00Z',
    servings: 2,
    packaging: 'Eco-friendly container',
    location: {
      latitude: 17.4223,
      longitude: 78.3379,
    },
    rating: 4.5,
    reviewCount: 12,
    orderCount: 20,
    createdAt: '2023-06-26T09:00:00Z',
    isFeatured: false,
    isApproved: true,
    isActive: true,
    address: '456 Oak St, Othertown, USA',
    spiceLevel: 'mild',
    preparationTime: 45,
    pickupTime: '2023-06-27T13:00:00Z',
    quantity: 4,
  }
];

// Lazy-loaded additional food listings
export const getAdditionalFoodListings = async (): Promise<FoodListing[]> => {
  // Simulate server loading delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return [
    {
      id: 'listing3',
      sellerId: 'user2',
      sellerName: 'Jane Smith',
      sellerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=70',
      sellerRating: 4.8,
      dishName: 'Homemade Pasta',
      description: 'Fresh pasta with tomato sauce.',
      price: 220,
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300&h=200&fit=crop&q=70',
      isVegetarian: true,
      cuisineType: 'Italian',
      ingredients: ['Pasta', 'Tomatoes', 'Garlic', 'Basil'],
      allergens: ['Gluten', 'Dairy'],
      availableQuantity: 3,
      remainingQuantity: 2,
      availableFrom: '2023-06-27T12:00:00Z',
      availableUntil: '2023-06-27T20:00:00Z',
      servings: 1,
      packaging: 'Eco-friendly container',
      location: { latitude: 17.4223, longitude: 78.3379 },
      rating: 4.6,
      reviewCount: 10,
      orderCount: 15,
      createdAt: '2023-06-26T10:00:00Z',
      isFeatured: false,
      isApproved: true,
      isActive: true,
      address: '456 Oak St, Othertown, USA',
      spiceLevel: 'mild',
      preparationTime: 25,
      pickupTime: '2023-06-27T14:00:00Z',
      quantity: 3,
    }
  ];
};

// Combined listings getter
export const mockFoodListings: FoodListing[] = getEssentialFoodListings();

// Essential orders for initial load
export const getEssentialOrders = (): Order[] => [
  {
    id: 'order1',
    buyerId: 'user1',
    sellerId: 'user2',
    listingId: 'listing1',
    dishName: 'Homemade Butter Chicken',
    pickupTime: '2023-06-27T13:30:00Z',
    buyerName: 'John Doe',
    buyerPhone: '+1234567890',
    sellerName: 'Jane Smith',
    sellerPhone: '+1987654321',
    sellerAddress: '456 Oak St, Othertown, USA',
    listingSnapshot: {
      dishName: 'Homemade Butter Chicken',
      price: 250,
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop&q=80',
      sellerName: 'Jane Smith',
      sellerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80',
      location: {
        latitude: 17.4223,
        longitude: 78.3379,
      },
    },
    quantity: 2,
    totalPrice: 500,
    deliveryAddress: '123 Main St, Anytown, USA',
    deliveryInstructions: 'Leave at the door',
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    status: 'completed',
    rating: 4,
    reviewComment: 'Delicious food, will order again!',
    isRated: true,
    createdAt: '2023-06-27T12:30:00Z',
    updatedAt: '2023-06-27T14:30:00Z',
    acceptedAt: '2023-06-27T12:35:00Z',
    readyAt: '2023-06-27T13:30:00Z',
    completedAt: '2023-06-27T14:30:00Z',
    deliveryMethod: 'delivery',
  }
];

// Combined orders getter
export const mockOrders: Order[] = getEssentialOrders();

// Lazy-loaded reviews and complaints
export const getReviews = async (): Promise<Review[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return [{
    id: 'review1',
    orderId: 'order1',
    buyerId: 'user1',
    buyerName: 'John Doe',
    buyerImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&q=70',
    sellerId: 'user2',
    sellerName: 'Jane Smith',
    listingId: 'listing1',
    dishName: 'Homemade Butter Chicken',
    rating: 4,
    comment: 'Delicious food!',
    createdAt: '2023-06-27T14:30:00Z',
  }];
};

export const getComplaints = async (): Promise<Complaint[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return [];
};

// Backwards compatibility
export const mockReviews: Review[] = [];
export const mockComplaints: Complaint[] = [];

// Essential notifications only
export const getEssentialNotifications = (): Notification[] => [
  {
    id: 'notification1',
    userId: 'user1',
    title: 'Order Confirmed',
    message: 'Your order has been confirmed.',
    type: 'order',
    relatedId: 'order1',
    isRead: false,
    createdAt: '2023-06-27T15:05:00Z',
  }
];

export const mockNotifications: Notification[] = getEssentialNotifications();

// Mock Follows
export const mockFollows: Follow[] = [
  {
    id: 'follow1',
    followerId: 'user1',
    followingId: 'user2',
    createdAt: '2023-06-26T10:00:00Z',
  },
];

// Lazy-loaded admin dashboard data
export const getAdminDashboardData = async (): Promise<AdminDashboardData> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    totalBuyers: 1000,
    newUsersToday: 25,
    activeUsers: 750,
    topEarners: [
      {
        id: 'user2',
        name: 'Jane Smith',
        earnings: 25000,
        location: 'Hyderabad',
        phone: '+1987654321',
        orderCount: 120,
      }
    ],
    topDishes: [
      {
        id: 'listing1',
        name: 'Homemade Butter Chicken',
        orderCount: 250,
        revenue: 62500,
        sellerName: 'Jane Smith',
        sellerPhone: '+1987654321',
        sellerLocation: 'Hyderabad',
      }
    ],
    topChefs: [
      {
        id: 'user2',
        name: 'Jane Smith',
        rating: 4.8,
        orderCount: 120,
        revenue: 25000,
        location: 'Hyderabad',
        phone: '+1987654321',
        cuisineTypes: ['Chinese', 'Thai'],
        isVerified: true,
      }
    ],
    monthlyTrends: {
      users: [900, 950, 1000],
      revenue: [200000, 225000, 250000],
      orders: [600, 650, 700],
    },
  };
};

// Minimal admin data for initial load
export const mockAdminDashboardData: AdminDashboardData = {
  totalBuyers: 1000,
  newUsersToday: 25,
  activeUsers: 750,
  topEarners: [],
  topDishes: [],
  topChefs: [],
  monthlyTrends: { users: [], revenue: [], orders: [] },
};