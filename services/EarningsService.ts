import { SellerEarnings } from '@/types';

interface EarningsBreakdown {
  total: number;
  credited: number;
  pending: number;
  codEarnings: number;
  prepaidEarnings: number;
  percentageCOD: number;
  percentagePrepaid: number;
}

interface CreditEarningsParams {
  sellerId: string;
  orderId: string;
  amount: number;
  paymentMethod: 'cod' | 'prepaid';
  buyerId?: string;
  dishName?: string;
}

interface EarningsResult {
  success: boolean;
  earning?: SellerEarnings;
  error?: string;
}

class EarningsServiceClass {
  /**
   * Credit earnings to a seller's account
   */
  async creditEarnings(
    params: CreditEarningsParams,
    onEarningCreated?: (earning: SellerEarnings) => Promise<void>
  ): Promise<EarningsResult> {
    try {
      const { sellerId, orderId, amount, paymentMethod, buyerId, dishName } = params;

      // Validate parameters
      if (!sellerId || !orderId || amount <= 0) {
        return {
          success: false,
          error: 'Invalid parameters for crediting earnings',
        };
      }

      // Create earning record
      const earning: SellerEarnings = {
        id: `earning_${Date.now()}`,
        sellerId,
        orderId,
        amount,
        paymentMethod,
        status: 'credited',
        buyerId,
        dishName,
        createdAt: new Date().toISOString(),
        creditedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Callback to persist the earning
      if (onEarningCreated) {
        await onEarningCreated(earning);
      }

      return {
        success: true,
        earning,
      };
    } catch (error) {
      console.error('Failed to credit earnings:', error);
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Create a pending earning record (for COD before confirmation)
   */
  async createPendingEarning(
    params: CreditEarningsParams,
    confirmationDeadline: string,
    onEarningCreated?: (earning: SellerEarnings) => Promise<void>
  ): Promise<EarningsResult> {
    try {
      const { sellerId, orderId, amount, paymentMethod, buyerId, dishName } = params;

      if (!sellerId || !orderId || amount <= 0) {
        return {
          success: false,
          error: 'Invalid parameters for creating pending earning',
        };
      }

      const earning: SellerEarnings = {
        id: `earning_${Date.now()}`,
        sellerId,
        orderId,
        amount,
        paymentMethod,
        status: 'pending',
        buyerId,
        dishName,
        confirmationDeadline,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (onEarningCreated) {
        await onEarningCreated(earning);
      }

      return {
        success: true,
        earning,
      };
    } catch (error) {
      console.error('Failed to create pending earning:', error);
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Mark a pending earning as credited
   */
  async creditPendingEarning(
    earningId: string,
    onUpdate?: (earningId: string, creditedAt: string) => Promise<void>
  ): Promise<EarningsResult> {
    try {
      if (!earningId) {
        return {
          success: false,
          error: 'Earning ID is required',
        };
      }

      const creditedAt = new Date().toISOString();

      if (onUpdate) {
        await onUpdate(earningId, creditedAt);
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to credit pending earning:', error);
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Mark an earning as failed
   */
  async failEarning(
    earningId: string,
    reason: string,
    onUpdate?: (earningId: string, reason: string) => Promise<void>
  ): Promise<EarningsResult> {
    try {
      if (!earningId || !reason) {
        return {
          success: false,
          error: 'Earning ID and reason are required',
        };
      }

      if (onUpdate) {
        await onUpdate(earningId, reason);
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to mark earning as failed:', error);
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * Calculate earnings breakdown for a seller
   */
  calculateBreakdown(earnings: SellerEarnings[]): EarningsBreakdown {
    const total = earnings.reduce((sum, e) => sum + (e.amount || 0), 0);
    const credited = earnings
      .filter((e) => e.status === 'credited')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    const pending = earnings
      .filter((e) => e.status === 'pending')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const codEarnings = earnings
      .filter((e) => e.paymentMethod === 'cod')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const prepaidEarnings = earnings
      .filter((e) => e.paymentMethod === 'prepaid')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const percentageCOD = total > 0 ? (codEarnings / total) * 100 : 0;
    const percentagePrepaid = total > 0 ? (prepaidEarnings / total) * 100 : 0;

    return {
      total,
      credited,
      pending,
      codEarnings,
      prepaidEarnings,
      percentageCOD,
      percentagePrepaid,
    };
  }

  /**
   * Get earnings for a specific period
   */
  getEarningsByPeriod(
    earnings: SellerEarnings[],
    period: 'day' | 'week' | 'month'
  ): SellerEarnings[] {
    const now = new Date();
    let startDate = new Date();

    if (period === 'day') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    return earnings.filter((e) => {
      const earningDate = new Date(e.createdAt);
      return earningDate >= startDate;
    });
  }

  /**
   * Get total earnings for a period
   */
  getTotalForPeriod(
    earnings: SellerEarnings[],
    period: 'day' | 'week' | 'month'
  ): number {
    const periodEarnings = this.getEarningsByPeriod(earnings, period);
    return periodEarnings.reduce((sum, e) => sum + (e.amount || 0), 0);
  }

  /**
   * Get pending amount for a seller
   */
  getPendingAmount(earnings: SellerEarnings[]): number {
    return earnings
      .filter((e) => e.status === 'pending')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }

  /**
   * Get credited amount for a seller
   */
  getCreditedAmount(earnings: SellerEarnings[]): number {
    return earnings
      .filter((e) => e.status === 'credited')
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }

  /**
   * Get earnings for a specific order
   */
  getEarningForOrder(
    earnings: SellerEarnings[],
    orderId: string
  ): SellerEarnings | undefined {
    return earnings.find((e) => e.orderId === orderId);
  }

  /**
   * Filter earnings by status
   */
  filterByStatus(
    earnings: SellerEarnings[],
    status: 'pending' | 'credited' | 'failed'
  ): SellerEarnings[] {
    return earnings.filter((e) => e.status === status);
  }

  /**
   * Filter earnings by payment method
   */
  filterByPaymentMethod(
    earnings: SellerEarnings[],
    method: 'cod' | 'prepaid'
  ): SellerEarnings[] {
    return earnings.filter((e) => e.paymentMethod === method);
  }

  /**
   * Sort earnings by date (newest first)
   */
  sortByDate(earnings: SellerEarnings[], descending: boolean = true): SellerEarnings[] {
    return [...earnings].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return descending ? dateB - dateA : dateA - dateB;
    });
  }

  /**
   * Calculate average transaction amount
   */
  calculateAverage(earnings: SellerEarnings[]): number {
    if (earnings.length === 0) return 0;
    const total = earnings.reduce((sum, e) => sum + (e.amount || 0), 0);
    return total / earnings.length;
  }

  /**
   * Get earnings statistics
   */
  getStatistics(earnings: SellerEarnings[]) {
    if (earnings.length === 0) {
      return {
        totalTransactions: 0,
        totalAmount: 0,
        average: 0,
        highest: 0,
        lowest: 0,
        crediteCount: 0,
        pendingCount: 0,
      };
    }

    const amounts = earnings.map((e) => e.amount || 0);
    const total = amounts.reduce((sum, a) => sum + a, 0);

    return {
      totalTransactions: earnings.length,
      totalAmount: total,
      average: this.calculateAverage(earnings),
      highest: Math.max(...amounts),
      lowest: Math.min(...amounts),
      creditedCount: this.filterByStatus(earnings, 'credited').length,
      pendingCount: this.filterByStatus(earnings, 'pending').length,
    };
  }
}

// Export singleton instance
export const EarningsService = new EarningsServiceClass();

export type { EarningsBreakdown, CreditEarningsParams, EarningsResult };
