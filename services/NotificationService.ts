import { SellerNotification } from '@/types';

interface NotificationPayload {
  title: string;
  body: string;
  orderId: string;
  type: 'order_placed' | 'cod_pending' | 'cod_confirmed' | 'cod_denied' | 'payment_received';
  data?: Record<string, any>;
}

interface SendNotificationResult {
  success: boolean;
  notificationId?: string;
  sentAt?: string;
  sentToWhatsApp?: boolean;
  error?: string;
}

class NotificationServiceClass {
  /**
   * Send notification to seller when buyer places an order
   */
  async notifyNewOrder(
    sellerId: string,
    orderId: string,
    buyerName: string,
    dishName: string,
    amount: number,
    onNotificationCreate?: (notification: SellerNotification) => Promise<void>
  ): Promise<SendNotificationResult> {
    try {
      const notification: SellerNotification = {
        id: `notif_${Date.now()}`,
        sellerId,
        orderId,
        type: 'order_placed',
        title: 'New Order Received',
        body: `${buyerName} ordered ${dishName} for ₹${amount}`,
        data: {
          buyerName,
          dishName,
          amount,
        },
        sentToSeller: true,
        sentToWhatsApp: false,
        createdAt: new Date().toISOString(),
        readAt: null,
      };

      if (onNotificationCreate) {
        await onNotificationCreate(notification);
      }

      return {
        success: true,
        notificationId: notification.id,
        sentAt: notification.createdAt,
        sentToWhatsApp: false,
      };
    } catch (error) {
      console.error(`Failed to notify seller of new order:`, error);
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Send notification when COD confirmation popup is pending
   */
  async notifyPendingCODConfirmation(
    sellerId: string,
    orderId: string,
    dishName: string,
    amount: number,
    deadline: string,
    onNotificationCreate?: (notification: SellerNotification) => Promise<void>
  ): Promise<SendNotificationResult> {
    try {
      const deadlineDate = new Date(deadline);
      const timeUntil = this.formatTimeUntil(deadlineDate);

      const notification: SellerNotification = {
        id: `notif_${Date.now()}`,
        sellerId,
        orderId,
        type: 'cod_pending',
        title: 'Confirm Payment',
        body: `Please confirm payment received for ${dishName} (₹${amount}). Confirm within ${timeUntil}.`,
        data: {
          dishName,
          amount,
          deadline,
        },
        sentToSeller: true,
        sentToWhatsApp: false,
        createdAt: new Date().toISOString(),
        readAt: null,
      };

      if (onNotificationCreate) {
        await onNotificationCreate(notification);
      }

      return {
        success: true,
        notificationId: notification.id,
        sentAt: notification.createdAt,
        sentToWhatsApp: false,
      };
    } catch (error) {
      console.error(`Failed to notify pending COD confirmation:`, error);
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Send notification when COD payment is confirmed
   */
  async notifyCODConfirmed(
    sellerId: string,
    orderId: string,
    dishName: string,
    amount: number,
    onNotificationCreate?: (notification: SellerNotification) => Promise<void>
  ): Promise<SendNotificationResult> {
    try {
      const notification: SellerNotification = {
        id: `notif_${Date.now()}`,
        sellerId,
        orderId,
        type: 'cod_confirmed',
        title: 'Payment Received',
        body: `Payment confirmed for ${dishName}. ₹${amount} has been credited to your wallet.`,
        data: {
          dishName,
          amount,
        },
        sentToSeller: true,
        sentToWhatsApp: false,
        createdAt: new Date().toISOString(),
        readAt: null,
      };

      if (onNotificationCreate) {
        await onNotificationCreate(notification);
      }

      return {
        success: true,
        notificationId: notification.id,
        sentAt: notification.createdAt,
        sentToWhatsApp: false,
      };
    } catch (error) {
      console.error(`Failed to notify COD confirmation:`, error);
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Send notification when COD payment is denied
   */
  async notifyCODDenied(
    sellerId: string,
    orderId: string,
    dishName: string,
    reason: string,
    onNotificationCreate?: (notification: SellerNotification) => Promise<void>
  ): Promise<SendNotificationResult> {
    try {
      const notification: SellerNotification = {
        id: `notif_${Date.now()}`,
        sellerId,
        orderId,
        type: 'cod_denied',
        title: 'Payment Not Confirmed',
        body: `You reported that payment was not received for ${dishName}. Reason: ${reason}`,
        data: {
          dishName,
          reason,
        },
        sentToSeller: true,
        sentToWhatsApp: false,
        createdAt: new Date().toISOString(),
        readAt: null,
      };

      if (onNotificationCreate) {
        await onNotificationCreate(notification);
      }

      return {
        success: true,
        notificationId: notification.id,
        sentAt: notification.createdAt,
        sentToWhatsApp: false,
      };
    } catch (error) {
      console.error(`Failed to notify COD denial:`, error);
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Send notification to buyer about order status
   */
  async notifyBuyerOrderStatus(
    buyerId: string,
    orderId: string,
    dishName: string,
    status: 'confirmed' | 'processing' | 'ready' | 'completed' | 'cancelled',
    sellerName?: string,
    onNotificationCreate?: (notification: any) => Promise<void>
  ): Promise<SendNotificationResult> {
    try {
      const statusMessages: Record<string, string> = {
        confirmed: 'Your order has been confirmed',
        processing: 'Your order is being prepared',
        ready: 'Your order is ready for pickup',
        completed: 'Your order has been completed',
        cancelled: 'Your order has been cancelled',
      };

      const message = statusMessages[status] || 'Order status updated';
      const body = `${message}: ${dishName}${sellerName ? ` from ${sellerName}` : ''}`;

      const notification = {
        id: `notif_${Date.now()}`,
        buyerId,
        orderId,
        type: `order_${status}`,
        title: 'Order Update',
        body,
        data: {
          dishName,
          status,
          sellerName,
        },
        sentToUser: true,
        createdAt: new Date().toISOString(),
        readAt: null,
      };

      if (onNotificationCreate) {
        await onNotificationCreate(notification);
      }

      return {
        success: true,
        notificationId: notification.id,
        sentAt: notification.createdAt,
      };
    } catch (error) {
      console.error(`Failed to notify buyer of order status:`, error);
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Send WhatsApp notification (scaffolding for Twilio integration)
   * @param phoneNumber - Seller's WhatsApp phone number
   * @param message - Message content
   * @param onWhatsAppSend - Callback to send via WhatsApp (Twilio)
   */
  async sendWhatsAppNotification(
    phoneNumber: string,
    message: string,
    onWhatsAppSend?: (phoneNumber: string, message: string) => Promise<boolean>
  ): Promise<SendNotificationResult> {
    try {
      if (!phoneNumber) {
        return {
          success: false,
          error: 'Phone number is required',
        };
      }

      let whatsAppSuccess = false;

      if (onWhatsAppSend) {
        whatsAppSuccess = await onWhatsAppSend(phoneNumber, message);
      }

      return {
        success: whatsAppSuccess,
        sentAt: new Date().toISOString(),
        sentToWhatsApp: whatsAppSuccess,
      };
    } catch (error) {
      console.error(`Failed to send WhatsApp notification:`, error);
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string,
    onUpdate?: (notificationId: string, readAt: string) => Promise<void>
  ): Promise<SendNotificationResult> {
    try {
      const readAt = new Date().toISOString();

      if (onUpdate) {
        await onUpdate(notificationId, readAt);
      }

      return {
        success: true,
        sentAt: readAt,
      };
    } catch (error) {
      console.error(`Failed to mark notification as read:`, error);
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(notifications: SellerNotification[]): number {
    return notifications.filter((n) => !n.readAt).length;
  }

  /**
   * Filter notifications by type
   */
  filterByType(
    notifications: SellerNotification[],
    type: SellerNotification['type']
  ): SellerNotification[] {
    return notifications.filter((n) => n.type === type);
  }

  /**
   * Get notifications for a specific order
   */
  getForOrder(
    notifications: SellerNotification[],
    orderId: string
  ): SellerNotification[] {
    return notifications.filter((n) => n.orderId === orderId);
  }

  /**
   * Sort notifications by date (newest first)
   */
  sortByDate(notifications: SellerNotification[], descending: boolean = true): SellerNotification[] {
    return [...notifications].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return descending ? dateB - dateA : dateA - dateB;
    });
  }

  /**
   * Format time until deadline in readable format
   */
  private formatTimeUntil(deadline: Date): string {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();

    if (diffMs <= 0) return 'expired';

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  }
}

// Export singleton instance
export const NotificationService = new NotificationServiceClass();

export type { NotificationPayload, SendNotificationResult };
