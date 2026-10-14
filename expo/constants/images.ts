export const imageSizes = {
  // Card images - food listings
  listingCard: {
    width: '100%' as const,
    height: 140,
    aspectRatio: 4 / 3, // Standard food photo ratio
    resizeMode: 'cover' as const,
  },

  // Hero/large images
  hero: {
    width: '100%' as const,
    height: 200,
    aspectRatio: 16 / 9,
    resizeMode: 'cover' as const,
  },

  // Chef profile images
  chefProfile: {
    width: 80,
    height: 80,
    aspectRatio: 1,
    resizeMode: 'cover' as const,
    borderRadius: 40,
  },

  // Small chef/user avatars
  avatar: {
    width: 40,
    height: 40,
    aspectRatio: 1,
    resizeMode: 'cover' as const,
    borderRadius: 20,
  },

  // Order/receipt images
  orderImage: {
    width: '100%' as const,
    height: 120,
    aspectRatio: 16 / 9,
    resizeMode: 'cover' as const,
  },

  // Admin dashboard images
  adminThumbnail: {
    width: 100,
    height: 80,
    aspectRatio: 5 / 4,
    resizeMode: 'cover' as const,
  },

  // Full width images (detail pages)
  detailImage: {
    width: '100%' as const,
    height: 300,
    aspectRatio: 1,
    resizeMode: 'cover' as const,
  },

  // Logo/icon images
  logo: {
    width: 100,
    height: 100,
    aspectRatio: 1,
    resizeMode: 'contain' as const,
  },

  // Category/cuisine images
  categoryImage: {
    width: 80,
    height: 80,
    aspectRatio: 1,
    resizeMode: 'cover' as const,
    borderRadius: 12,
  },
};
