/**
 * Helper functions for QR code parsing and processing
 */

interface ParsedQRCode {
  type: 'order' | 'listing' | 'url' | 'unknown';
  id?: string;
  url?: string;
  data?: any;
}

/**
 * Parse a QR code string and determine its type and content
 * @param qrData The raw QR code data string
 * @returns Parsed QR code information
 */
export const parseQRCode = (qrData: string): ParsedQRCode => {
  // Trim whitespace
  const data = qrData.trim();
  
  try {
    // Check if it's a URL
    if (data.startsWith('http://') || data.startsWith('https://')) {
      return {
        type: 'url',
        url: data
      };
    }
    
    // Check if it's a JSON string
    if (data.startsWith('{') && data.endsWith('}')) {
      try {
        const jsonData = JSON.parse(data);
        
        // Check for order format
        if (jsonData.type === 'order' && jsonData.id) {
          return {
            type: 'order',
            id: jsonData.id,
            data: jsonData
          };
        }
        
        // Check for listing format
        if (jsonData.type === 'listing' && jsonData.id) {
          return {
            type: 'listing',
            id: jsonData.id,
            data: jsonData
          };
        }
        
        // Unknown JSON format
        return {
          type: 'unknown',
          data: jsonData
        };
      } catch (e) {
        console.error('Failed to parse JSON from QR code:', e);
      }
    }
    
    // Check for order prefix
    if (data.startsWith('order:')) {
      const id = data.substring(6);
      return {
        type: 'order',
        id
      };
    }
    
    // Check for listing prefix
    if (data.startsWith('listing:')) {
      const id = data.substring(8);
      return {
        type: 'listing',
        id
      };
    }
    
    // If it's just a string of alphanumeric characters, assume it might be an ID
    if (/^[a-zA-Z0-9-_]+$/.test(data)) {
      return {
        type: 'unknown',
        id: data
      };
    }
    
    // Default to unknown
    return {
      type: 'unknown',
      data
    };
  } catch (error) {
    console.error('Error parsing QR code:', error);
    return {
      type: 'unknown',
      data
    };
  }
};

/**
 * Generate a QR code string for an order
 * @param orderId The order ID
 * @returns QR code string
 */
export const generateOrderQRCode = (orderId: string): string => {
  return JSON.stringify({
    type: 'order',
    id: orderId,
    timestamp: new Date().toISOString()
  });
};

/**
 * Generate a QR code string for a listing
 * @param listingId The listing ID
 * @returns QR code string
 */
export const generateListingQRCode = (listingId: string): string => {
  return JSON.stringify({
    type: 'listing',
    id: listingId,
    timestamp: new Date().toISOString()
  });
};