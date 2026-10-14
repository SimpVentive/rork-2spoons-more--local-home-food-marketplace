// Accessibility utility functions and constants for inclusive design

export const a11y = {
  // Button accessibility labels
  buttons: {
    submit: 'Submit',
    cancel: 'Cancel',
    back: 'Go back',
    close: 'Close',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    logout: 'Logout',
    login: 'Login',
    search: 'Search',
    filter: 'Open filters',
    clearFilters: 'Clear all filters',
    viewMore: 'View more',
    viewLess: 'View less',
    menu: 'Open menu',
    notifications: 'Open notifications',
    profile: 'Open profile',
    settings: 'Open settings',
    home: 'Go to home',
  },

  // Navigation accessibility
  nav: {
    home: 'Home',
    explore: 'Explore',
    alerts: 'Alerts',
    create: 'Create listing',
    followers: 'Followers',
    account: 'Account',
    orders: 'Orders',
    wallet: 'Wallet',
    analytics: 'Analytics',
    following: 'Following',
  },

  // Card and list items
  cards: {
    foodCard: 'Food listing',
    sellerCard: 'Seller profile',
    orderCard: 'Order',
    reviewCard: 'Review',
    doubleTab: 'Double tap to view details',
  },

  // Common elements
  elements: {
    price: 'Price',
    rating: 'Rating',
    time: 'Time remaining',
    location: 'Location',
    seller: 'Seller',
    image: 'Food image',
    vegetarian: 'Vegetarian',
    nonVegetarian: 'Non-vegetarian',
    expired: 'Expired',
    soldOut: 'Sold out',
    loading: 'Loading',
    error: 'Error',
  },

  // Form inputs
  form: {
    email: 'Email address',
    password: 'Password',
    username: 'Username',
    name: 'Full name',
    phone: 'Phone number',
    address: 'Address',
    city: 'City',
    zipCode: 'Zip code',
    message: 'Message',
    searchFood: 'Search for food dishes',
    searchSeller: 'Search for sellers',
  },

  // Dynamic/contextual labels
  getDietaryInfo: (isVegetarian: boolean) =>
    isVegetarian ? 'Vegetarian option' : 'Non-vegetarian option',

  getTimeRemaining: (timeLeft: string) =>
    `Time remaining: ${timeLeft}`,

  getPriceInfo: (price: number, currency: string = '₹') =>
    `Price: ${currency}${price}`,

  getRatingInfo: (rating: number, reviewCount: number = 0) =>
    `Rating: ${rating} out of 5${reviewCount > 0 ? ` (${reviewCount} reviews)` : ''}`,

  getSellerInfo: (name: string, rating: number) =>
    `Seller ${name}, rated ${rating} out of 5`,

  getLocationInfo: (address: string) =>
    `Location: ${address}`,

  // Screen reader hints
  hints: {
    swipeToNavigate: 'Swipe to navigate between sections',
    doubleTabToOpen: 'Double tap to open',
    longPressForOptions: 'Long press for more options',
    tabToNavigate: 'Use tab key to navigate',
    enterToSelect: 'Press enter to select',
  },
};

// Accessible color contrast checker (WCAG AA standard)
export const contrastRatio = {
  // For text on colored backgrounds
  minContrast: 4.5, // 1.4.3 WCAG AA - Normal text
  minContrastLarge: 3, // 1.4.3 WCAG AA - Large text (18pt+, 14pt+ bold)

  // Common contrast ratios (white text on color)
  ratios: {
    onPrimary: 'Good contrast', // #FF6B35 on white
    onSecondary: 'Good contrast', // #4ECDC4 on white
    onError: 'Good contrast', // #E74C3C on white
    onSuccess: 'Good contrast', // #27AE60 on white
  },
};

// Minimum touch target size (WCAG AA)
export const touchTargets = {
  minimum: 48, // 48x48 dp (minimum)
  recommended: 56, // 56x56 dp (recommended)
  comfortable: 64, // 64x64 dp (comfortable)
};

// Text sizing for readability
export const textSizes = {
  minForAllUsers: 12, // Minimum for all text
  minForBodyText: 14, // Minimum for body/paragraph text
  minForLabels: 12, // Minimum for labels
  // Avoid: text smaller than 12pt unless absolutely necessary
};

// Focus indicator styling (for keyboard navigation)
export const focusIndicator = {
  width: 2,
  color: '#FF6B35', // Primary color
  radius: 4,
};

export default a11y;
