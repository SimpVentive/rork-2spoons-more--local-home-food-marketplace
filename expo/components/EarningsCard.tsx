import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronDown,
  Calendar,
} from 'lucide-react-native';
import designTokens from '@/constants/design-tokens';
import { useThemeColors } from '@/utils/theme';
import { SellerEarnings } from '@/types';

interface EarningsCardProps {
  totalEarnings: number;
  pendingAmount: number;
  creditedAmount: number;
  transactions?: SellerEarnings[];
  period?: 'day' | 'week' | 'month';
  onPeriodChange?: (period: 'day' | 'week' | 'month') => void;
}

export const EarningsCard: React.FC<EarningsCardProps> = ({
  totalEarnings,
  pendingAmount,
  creditedAmount,
  transactions = [],
  period = 'month',
  onPeriodChange,
}) => {
  const colors = useThemeColors();
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const codEarnings = transactions
    .filter((t) => t.paymentMethod === 'cod')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const prepaidEarnings = transactions
    .filter((t) => t.paymentMethod === 'prepaid')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const getPaymentMethodLabel = (method: string) => {
    return method === 'cod' ? 'Cash on Delivery' : 'Prepaid';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'credited':
        return designTokens.colors.success;
      case 'pending':
        return designTokens.colors.warning;
      case 'failed':
        return designTokens.colors.error;
      default:
        return colors.textLight;
    }
  };

  const renderTransaction = ({ item }: { item: SellerEarnings }) => {
    const isExpanded = expandedTransaction === item.id;
    const statusColor = getStatusColor(item.status);

    return (
      <View
        style={[
          styles.transactionItem,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderBottomColor: isExpanded ? designTokens.colors.primary : colors.border,
            borderBottomWidth: isExpanded ? 2 : 1,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.transactionHeader}
          onPress={() => setExpandedTransaction(isExpanded ? null : item.id)}
          accessible={true}
          accessibilityLabel={`Transaction for order ${item.orderId}, amount ${formatCurrency(item.amount)}`}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          accessibilityHint={`${isExpanded ? 'Collapse' : 'Expand'} transaction details`}
        >
          <View style={styles.transactionLeft}>
            <View
              style={[
                styles.statusIcon,
                { backgroundColor: statusColor },
              ]}
            >
              {item.status === 'credited' ? (
                <CheckCircle size={16} color={designTokens.colors.white} />
              ) : (
                <Clock size={16} color={designTokens.colors.white} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.transactionAmount, { color: colors.text }]}>
                {formatCurrency(item.amount)}
              </Text>
              <Text style={[styles.transactionType, { color: colors.textLight }]}>
                {getPaymentMethodLabel(item.paymentMethod)}
              </Text>
            </View>
          </View>

          <View style={styles.transactionRight}>
            <Text style={[styles.transactionStatus, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
            <ChevronDown
              size={18}
              color={colors.textLight}
              style={{
                transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
              }}
            />
          </View>
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && (
          <View
            style={[
              styles.transactionDetails,
              { borderTopColor: colors.border },
            ]}
          >
            <DetailRow
              label="Order ID"
              value={item.orderId}
              colors={colors}
            />
            <DetailRow
              label="Date"
              value={new Date(item.creditedAt || item.createdAt).toLocaleDateString('en-IN')}
              colors={colors}
            />
            <DetailRow
              label="Payment Method"
              value={getPaymentMethodLabel(item.paymentMethod)}
              colors={colors}
            />
            {item.status === 'credited' && item.creditedAt && (
              <DetailRow
                label="Credited On"
                value={new Date(item.creditedAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                colors={colors}
              />
            )}
            {item.status === 'pending' && (
              <DetailRow
                label="Expected Credit"
                value={item.confirmationDeadline ? new Date(item.confirmationDeadline).toLocaleDateString('en-IN') : 'Soon'}
                colors={colors}
              />
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Main Earnings Card */}
      <View
        style={[
          styles.mainCard,
          {
            backgroundColor: colors.card,
            borderColor: designTokens.colors.primary,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.headerIcon,
                { backgroundColor: designTokens.colors.primary },
              ]}
            >
              <DollarSign size={24} color={designTokens.colors.white} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Total Earnings
            </Text>
          </View>

          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {(['day', 'week', 'month'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.periodButton,
                  {
                    backgroundColor:
                      period === p ? designTokens.colors.primary : 'transparent',
                  },
                ]}
                onPress={() => onPeriodChange?.(p)}
                accessible={true}
                accessibilityLabel={`Show ${p} earnings`}
                accessibilityRole="radio"
                accessibilityState={{ selected: period === p }}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    {
                      color:
                        period === p ? designTokens.colors.white : colors.textLight,
                    },
                  ]}
                >
                  {p.charAt(0).toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Total Amount */}
        <View style={styles.amountSection}>
          <Text style={[styles.totalAmount, { color: designTokens.colors.primary }]}>
            {formatCurrency(totalEarnings)}
          </Text>
          <Text style={[styles.amountLabel, { color: colors.textLight }]}>
            {period.charAt(0).toUpperCase() + period.slice(1)} Earnings
          </Text>
        </View>

        {/* Breakdown Toggle */}
        <TouchableOpacity
          style={[
            styles.breakdownToggle,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setShowBreakdown(!showBreakdown)}
          accessible={true}
          accessibilityLabel="Toggle earnings breakdown"
          accessibilityRole="button"
          accessibilityState={{ expanded: showBreakdown }}
        >
          <View style={styles.toggleLeft}>
            <TrendingUp size={18} color={designTokens.colors.primary} />
            <Text style={[styles.toggleText, { color: colors.text }]}>
              Breakdown
            </Text>
          </View>
          <ChevronDown
            size={18}
            color={colors.textLight}
            style={{
              transform: [{ rotate: showBreakdown ? '180deg' : '0deg' }],
            }}
          />
        </TouchableOpacity>

        {/* Breakdown Details */}
        {showBreakdown && (
          <View style={[styles.breakdownBox, { backgroundColor: colors.background }]}>
            <BreakdownItem
              label="COD Earnings"
              amount={codEarnings}
              color={designTokens.colors.warning}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <BreakdownItem
              label="Prepaid Earnings"
              amount={prepaidEarnings}
              color={designTokens.colors.primary}
            />
          </View>
        )}
      </View>

      {/* Status Cards */}
      <View style={styles.statusGrid}>
        <StatusCard
          icon={<Clock size={20} color={designTokens.colors.warning} />}
          label="Pending"
          amount={pendingAmount}
          backgroundColor={`${designTokens.colors.warning}20`}
        />
        <StatusCard
          icon={<CheckCircle size={20} color={designTokens.colors.success} />}
          label="Credited"
          amount={creditedAmount}
          backgroundColor={`${designTokens.colors.success}20`}
        />
      </View>

      {/* Transactions Section */}
      {transactions.length > 0 && (
        <View style={styles.transactionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Transactions
          </Text>

          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTransaction}
            scrollEnabled={false}
            style={styles.transactionsList}
            contentContainerStyle={styles.transactionsContent}
          />
        </View>
      )}

      {/* Empty State */}
      {transactions.length === 0 && totalEarnings === 0 && (
        <View style={styles.emptyState}>
          <DollarSign size={48} color={colors.textLight} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Earnings Yet
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.textLight }]}>
            Start selling to see your earnings here
          </Text>
        </View>
      )}

      {/* Bottom Spacing */}
      <View style={{ height: designTokens.spacing['2xl'] }} />
    </ScrollView>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
  colors: any;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, colors }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, { color: colors.textLight }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
  </View>
);

interface BreakdownItemProps {
  label: string;
  amount: number;
  color: string;
}

const BreakdownItem: React.FC<BreakdownItemProps> = ({ label, amount, color }) => (
  <View style={styles.breakdownItem}>
    <View style={styles.breakdownLeft}>
      <View style={[styles.colorDot, { backgroundColor: color }]} />
      <Text style={styles.breakdownLabel}>{label}</Text>
    </View>
    <Text style={[styles.breakdownAmount, { color }]}>
      ₹{amount.toLocaleString('en-IN')}
    </Text>
  </View>
);

interface StatusCardProps {
  icon: React.ReactNode;
  label: string;
  amount: number;
  backgroundColor: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ icon, label, amount, backgroundColor }) => {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.statusCard,
        {
          backgroundColor,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.statusCardIcon}>{icon}</View>
      <Text style={[styles.statusCardLabel, { color: colors.textLight }]}>
        {label}
      </Text>
      <Text style={[styles.statusCardAmount, { color: colors.text }]}>
        ₹{amount.toLocaleString('en-IN')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.lg,
  },

  mainCard: {
    borderWidth: 2,
    borderRadius: designTokens.radius['2xl'],
    padding: designTokens.spacing.lg,
    marginBottom: designTokens.spacing.lg,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: designTokens.spacing.lg,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.md,
    flex: 1,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: designTokens.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
  },

  periodSelector: {
    flexDirection: 'row',
    gap: designTokens.spacing.xs,
  },

  periodButton: {
    width: 32,
    height: 32,
    borderRadius: designTokens.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  periodButtonText: {
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.bold,
  },

  amountSection: {
    alignItems: 'center',
    marginVertical: designTokens.spacing.lg,
  },

  totalAmount: {
    fontSize: designTokens.typography.size['3xl'],
    fontWeight: designTokens.typography.weight.bold,
    marginBottom: designTokens.spacing.xs,
  },

  amountLabel: {
    fontSize: designTokens.typography.size.sm,
  },

  breakdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.md,
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    marginTop: designTokens.spacing.md,
  },

  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },

  toggleText: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.semibold,
  },

  breakdownBox: {
    borderRadius: designTokens.radius.lg,
    padding: designTokens.spacing.md,
    marginTop: designTokens.spacing.md,
    gap: designTokens.spacing.md,
  },

  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },

  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  breakdownLabel: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.medium,
  },

  breakdownAmount: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
  },

  divider: {
    height: 1,
  },

  statusGrid: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
    marginBottom: designTokens.spacing.lg,
  },

  statusCard: {
    flex: 1,
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    padding: designTokens.spacing.md,
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },

  statusCardIcon: {
    marginBottom: designTokens.spacing.xs,
  },

  statusCardLabel: {
    fontSize: designTokens.typography.size.sm,
  },

  statusCardAmount: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
  },

  transactionsSection: {
    marginBottom: designTokens.spacing.lg,
  },

  sectionTitle: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
    marginBottom: designTokens.spacing.md,
  },

  transactionsList: {
    flex: 1,
  },

  transactionsContent: {
    gap: designTokens.spacing.sm,
  },

  transactionItem: {
    borderRadius: designTokens.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },

  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.md,
  },

  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.md,
    flex: 1,
  },

  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: designTokens.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  transactionAmount: {
    fontSize: designTokens.typography.size.base,
    fontWeight: designTokens.typography.weight.bold,
    marginBottom: designTokens.spacing.xs,
  },

  transactionType: {
    fontSize: designTokens.typography.size.sm,
  },

  transactionRight: {
    alignItems: 'flex-end',
    gap: designTokens.spacing.sm,
  },

  transactionStatus: {
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.semibold,
  },

  transactionDetails: {
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.md,
    borderTopWidth: 1,
    gap: designTokens.spacing.md,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  detailLabel: {
    fontSize: designTokens.typography.size.sm,
  },

  detailValue: {
    fontSize: designTokens.typography.size.sm,
    fontWeight: designTokens.typography.weight.semibold,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: designTokens.spacing.md,
  },

  emptyTitle: {
    fontSize: designTokens.typography.size.lg,
    fontWeight: designTokens.typography.weight.bold,
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: designTokens.typography.size.base,
    textAlign: 'center',
  },
});

export default EarningsCard;
