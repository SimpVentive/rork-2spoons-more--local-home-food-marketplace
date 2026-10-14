import { SellerNotification, Order } from '@/types';
import { codQueries, notificationQueries, ordersCODQueries } from '@/lib/supabase-integration';

interface ScheduledConfirmation {
  orderId: string;
  deadline: Date;
  timerId: number | NodeJS.Timeout;
  isActive: boolean;
}

interface CODConfirmationResult {
  success: boolean;
  orderId: string;
  amount: number;
  creditedAt?: string;
  error?: string;
}

interface CODDenialResult {
  success: boolean;
  orderId: string;
  reason: string;
  deniedAt?: string;
  error?: string;
}

class CODConfirmationServiceClass {
  private scheduledConfirmations: Map<string, ScheduledConfirmation> = new Map();

  /**
   * Schedule a COD confirmation popup to appear after the pickup time window
   * @param orderId - Order ID
   * @param pickupTimeEnd - End time of pickup window (ISO string or Date)
   * @param confirmationTimeoutMinutes - Minutes to wait after time window ends (default: 5)
   * @param onConfirmationReady - Callback when popup should show
   */
  scheduleConfirmation(
    orderId: string,
    pickupTimeEnd: string | Date,
    confirmationTimeoutMinutes: number = 5,
    onConfirmationReady: (orderId: string) => void
  ): { scheduled: boolean; deadline: Date } {
    try {
      // Parse the pickup end time
      const endTime = typeof pickupTimeEnd === 'string' ? new Date(pickupTimeEnd) : pickupTimeEnd;

      // Calculate deadline: end time + confirmation timeout
      const deadline = new Date(endTime.getTime() + confirmationTimeoutMinutes * 60000);

      // Clear any existing scheduled confirmation for this order
      this.cancelConfirmation(orderId);

      // Calculate delay in milliseconds
      const now = new Date();
      const delay = Math.max(0, deadline.getTime() - now.getTime());

      // Schedule the popup
      const timerId = setTimeout(() => {
        onConfirmationReady(orderId);
        this.markConfirmationActive(orderId, deadline);
      }, delay);

      // Store the scheduled confirmation
      this.scheduledConfirmations.set(orderId, {
        orderId,
        deadline,
        timerId,
        isActive: false,
      });

      return {
        scheduled: true,
        deadline,
      };
    } catch (error) {
      console.error(`Failed to schedule confirmation for order ${orderId}:`, error);
      return {
        scheduled: false,
        deadline: new Date(),
      };
    }
  }

  /**
   * Confirm a COD payment and credit the seller's wallet
   * @param orderId - Order ID
   * @param amount - Amount to credit
   * @param sellerId - Seller ID (for wallet crediting)
   * @param onWalletUpdate - Callback to update wallet
   */
  async confirmCOD(
    orderId: string,
    amount: number,
    sellerId: string,
    onWalletUpdate?: (sellerId: string, amount: number, orderId: string) => Promise<void>
  ): Promise<CODConfirmationResult> {
    try {
      // Validate amount
      if (amount <= 0) {
        return {
          success: false,
          orderId,
          amount,
          error: 'Invalid amount',
        };
      }

      // Mark confirmation as complete
      const scheduled = this.scheduledConfirmations.get(orderId);
      if (scheduled) {
        clearTimeout(scheduled.timerId as NodeJS.Timeout);
        this.scheduledConfirmations.delete(orderId);
      }

      // Update COD confirmation status in database
      const codConfirmation = await codQueries.getCODByOrderId(orderId);
      if (codConfirmation) {
        await codQueries.updateCODConfirmation(codConfirmation.id, 'confirmed', amount);
      }

      // Update order COD status
      await ordersCODQueries.updateOrderCODStatus(orderId, 'confirmed', amount);

      // Create notification
      await notificationQueries.createNotification(
        sellerId,
        orderId,
        'cod_confirmed',
        'Payment Received',
        `₹${amount} has been credited to your wallet`,
        { amount, orderId }
      );

      // Call wallet update callback if provided
      if (onWalletUpdate) {
        await onWalletUpdate(sellerId, amount, orderId);
      }

      const creditedAt = new Date().toISOString();

      return {
        success: true,
        orderId,
        amount,
        creditedAt,
      };
    } catch (error) {
      console.error(`Failed to confirm COD for order ${orderId}:`, error);
      return {
        success: false,
        orderId,
        amount,
        error: String(error),
      };
    }
  }

  /**
   * Deny a COD payment with a reason
   * @param orderId - Order ID
   * @param reason - Reason for denial
   * @param sellerId - Seller ID
   * @param onDenialLog - Callback to log the denial
   */
  async denyCOD(
    orderId: string,
    reason: string,
    sellerId: string,
    onDenialLog?: (orderId: string, reason: string) => Promise<void>
  ): Promise<CODDenialResult> {
    try {
      // Validate reason
      if (!reason || reason.trim().length === 0) {
        return {
          success: false,
          orderId,
          reason,
          error: 'Reason is required',
        };
      }

      // Mark confirmation as complete
      const scheduled = this.scheduledConfirmations.get(orderId);
      if (scheduled) {
        clearTimeout(scheduled.timerId as any);
        this.scheduledConfirmations.delete(orderId);
      }

      // Update COD confirmation status in database
      const codConfirmation = await codQueries.getCODByOrderId(orderId);
      if (codConfirmation) {
        await codQueries.updateCODConfirmation(codConfirmation.id, 'denied', undefined, reason);
      }

      // Update order COD status
      await ordersCODQueries.updateOrderCODStatus(orderId, 'denied', undefined, reason);

      // Create notification
      await notificationQueries.createNotification(
        sellerId,
        orderId,
        'cod_denied',
        'Payment Not Confirmed',
        `You reported that payment was not received. Reason: ${reason}`,
        { reason, orderId }
      );

      // Call denial log callback if provided
      if (onDenialLog) {
        await onDenialLog(orderId, reason);
      }

      const deniedAt = new Date().toISOString();

      return {
        success: true,
        orderId,
        reason: reason.trim(),
        deniedAt,
      };
    } catch (error) {
      console.error(`Failed to deny COD for order ${orderId}:`, error);
      return {
        success: false,
        orderId,
        reason,
        error: String(error),
      };
    }
  }

  /**
   * Check if a confirmation is currently pending
   */
  isConfirmationPending(orderId: string): boolean {
    const scheduled = this.scheduledConfirmations.get(orderId);
    return scheduled ? scheduled.isActive : false;
  }

  /**
   * Get the deadline for a scheduled confirmation
   */
  getConfirmationDeadline(orderId: string): Date | null {
    const scheduled = this.scheduledConfirmations.get(orderId);
    return scheduled ? scheduled.deadline : null;
  }

  /**
   * Get time remaining until confirmation deadline (in seconds)
   */
  getTimeRemaining(orderId: string): number {
    const deadline = this.getConfirmationDeadline(orderId);
    if (!deadline) return 0;

    const now = new Date();
    const remaining = (deadline.getTime() - now.getTime()) / 1000;
    return Math.max(0, remaining);
  }

  /**
   * Cancel a scheduled confirmation
   */
  cancelConfirmation(orderId: string): boolean {
    const scheduled = this.scheduledConfirmations.get(orderId);
    if (scheduled) {
      clearTimeout(scheduled.timerId as NodeJS.Timeout);
      this.scheduledConfirmations.delete(orderId);
      return true;
    }
    return false;
  }

  /**
   * Mark a confirmation as active (popup shown)
   */
  private markConfirmationActive(orderId: string, deadline: Date): void {
    const scheduled = this.scheduledConfirmations.get(orderId);
    if (scheduled) {
      scheduled.isActive = true;
    }
  }

  /**
   * Get all active confirmations for monitoring/debugging
   */
  getActiveConfirmations(): ScheduledConfirmation[] {
    return Array.from(this.scheduledConfirmations.values()).filter((c) => c.isActive);
  }

  /**
   * Get all scheduled confirmations for monitoring/debugging
   */
  getAllScheduledConfirmations(): ScheduledConfirmation[] {
    return Array.from(this.scheduledConfirmations.values());
  }

  /**
   * Clean up all scheduled confirmations (for cleanup/testing)
   */
  clearAll(): void {
    this.scheduledConfirmations.forEach((scheduled) => {
      clearTimeout(scheduled.timerId as NodeJS.Timeout);
    });
    this.scheduledConfirmations.clear();
  }
}

// Export singleton instance
export const CODConfirmationService = new CODConfirmationServiceClass();

export type { CODConfirmationResult, CODDenialResult, ScheduledConfirmation };
