/**
 * Helper functions for QR code generation and processing
 */

/**
 * Generates a QR code URL for an order
 * @param orderId The order ID
 * @returns A string to be encoded in a QR code
 */
export const generateOrderQRCode = (orderId: string): string => {
  return `ORDER:${orderId}`;
};

/**
 * Generates a QR code URL for a listing
 * @param listingId The listing ID
 * @returns A string to be encoded in a QR code
 */
export const generateListingQRCode = (listingId: string): string => {
  return `LISTING:${listingId}`;
};

/**
 * Parses a QR code string to extract the type and ID
 * @param qrData The QR code data string
 * @returns An object with type and id, or null if invalid
 */
export const parseQRCode = (qrData: string): { type: 'order' | 'listing' | 'url' | 'unknown', id?: string, url?: string } => {
  if (!qrData) {
    return { type: 'unknown' };
  }
  
  // Check for ORDER: prefix
  if (qrData.startsWith('ORDER:')) {
    const id = qrData.replace('ORDER:', '').trim();
    return { type: 'order', id };
  }
  
  // Check for LISTING: prefix
  if (qrData.startsWith('LISTING:')) {
    const id = qrData.replace('LISTING:', '').trim();
    return { type: 'listing', id };
  }
  
  // Check if it's a URL
  if (qrData.startsWith('http') || qrData.startsWith('https')) {
    // Extract order ID from URL if present
    if (qrData.includes('/order/')) {
      const id = qrData.split('/order/')[1].split('?')[0].split('#')[0];
      return { type: 'order', id, url: qrData };
    }
    
    // Extract listing ID from URL if present
    if (qrData.includes('/listing/')) {
      const id = qrData.split('/listing/')[1].split('?')[0].split('#')[0];
      return { type: 'listing', id, url: qrData };
    }
    
    // It's a URL but not one we recognize
    return { type: 'url', url: qrData };
  }
  
  // Check if it's a raw ID (without prefix)
  const idPattern = /^[a-zA-Z0-9-_]{4,}$/;
  if (idPattern.test(qrData)) {
    // It looks like an ID, but we don't know what type
    return { type: 'unknown', id: qrData };
  }
  
  // Unknown format
  return { type: 'unknown' };
};