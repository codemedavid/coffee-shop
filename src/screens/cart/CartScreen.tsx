import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useCart } from '../../data/cart';

const formatPrice = (price: number) => `RM ${price.toFixed(2)}`;
const formatDiscount = (amount: number) => `-RM ${amount.toFixed(2)}`;

const joinCustomizations = (customizations: {
  sizeLabel: string;
  sugarLabel: string;
  addOnLabels: string[];
}) => {
  const addOns = customizations.addOnLabels.join(', ');
  if (!addOns) {
    return `${customizations.sizeLabel} • ${customizations.sugarLabel}`;
  }
  return `${customizations.sizeLabel} • ${customizations.sugarLabel} • ${addOns}`;
};

export default function CartScreen() {
  const {
    items,
    totals,
    appliedPromo,
    updateItemQuantity,
    removeItem,
    applyPromo,
    removePromo,
  } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  const handleApplyPromo = () => {
    const result = applyPromo(promoCode);
    if (result.ok) {
      setPromoError(null);
      setPromoSuccess(result.message);
    } else {
      setPromoSuccess(null);
      setPromoError(result.message);
    }
  };

  const handleRemovePromo = () => {
    removePromo();
    setPromoCode('');
    setPromoError(null);
    setPromoSuccess(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your cart</Text>
          <Text style={styles.subtitle}>
            {totals.itemCount} item{totals.itemCount === 1 ? '' : 's'}
          </Text>
        </View>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add drinks from the menu to start your order.
            </Text>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetails}>
                      {joinCustomizations(item.customizations)}
                    </Text>
                    {item.notes ? (
                      <Text style={styles.itemNotes}>Note: {item.notes}</Text>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => removeItem(item.id)}
                    style={({ pressed }) => [
                      styles.removeButton,
                      pressed && styles.removeButtonPressed,
                    ]}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                </View>
                <View style={styles.itemFooter}>
                  <View style={styles.quantityRow}>
                    <Pressable
                      onPress={() => updateItemQuantity(item.id, item.qty - 1)}
                      style={({ pressed }) => [
                        styles.quantityButton,
                        pressed && styles.quantityButtonPressed,
                      ]}
                    >
                      <Text style={styles.quantityButtonLabel}>-</Text>
                    </Pressable>
                    <Text style={styles.quantityText}>{item.qty}</Text>
                    <Pressable
                      onPress={() => updateItemQuantity(item.id, item.qty + 1)}
                      style={({ pressed }) => [
                        styles.quantityButton,
                        pressed && styles.quantityButtonPressed,
                      ]}
                    >
                      <Text style={styles.quantityButtonLabel}>+</Text>
                    </Pressable>
                  </View>
                  <View style={styles.priceColumn}>
                    <Text style={styles.unitPrice}>
                      {formatPrice(item.unitPrice)} each
                    </Text>
                    <Text style={styles.linePrice}>
                      {formatPrice(item.unitPrice * item.qty)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={styles.promoCard}>
          <View style={styles.promoHeader}>
            <Text style={styles.sectionTitle}>Promo or voucher</Text>
            {appliedPromo ? (
              <View style={styles.appliedBadge}>
                <Text style={styles.appliedBadgeText}>Applied</Text>
              </View>
            ) : null}
          </View>
          {appliedPromo ? (
            <View style={styles.appliedRow}>
              <View>
                <Text style={styles.appliedCode}>{appliedPromo.code}</Text>
                <Text style={styles.appliedNote}>
                  Discount ready for checkout.
                </Text>
              </View>
              <Pressable
                onPress={handleRemovePromo}
                style={({ pressed }) => [
                  styles.removePromoButton,
                  pressed && styles.removePromoButtonPressed,
                ]}
              >
                <Text style={styles.removePromoText}>Remove</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.promoInputRow}>
              <TextInput
                value={promoCode}
                onChangeText={(value) => {
                  setPromoCode(value);
                  if (promoError) {
                    setPromoError(null);
                  }
                }}
                placeholder="Enter code"
                autoCapitalize="characters"
                autoCorrect={false}
                style={styles.promoInput}
                placeholderTextColor="#b59b86"
              />
              <Pressable
                onPress={handleApplyPromo}
                disabled={items.length === 0}
                style={({ pressed }) => [
                  styles.applyButton,
                  items.length === 0 && styles.applyButtonDisabled,
                  pressed && items.length > 0 && styles.applyButtonPressed,
                ]}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </Pressable>
            </View>
          )}
          {promoError ? (
            <Text style={styles.promoError}>{promoError}</Text>
          ) : null}
          {promoSuccess ? (
            <Text style={styles.promoSuccess}>{promoSuccess}</Text>
          ) : null}
        </View>
        <View style={styles.summaryCard}>
          <View style={styles.summaryGroup}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatPrice(totals.subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery fee</Text>
              <Text style={styles.summaryValue}>
                {formatPrice(totals.fees.delivery)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Small order fee</Text>
              <Text style={styles.summaryValue}>
                {formatPrice(totals.fees.smallOrder)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>
                {formatPrice(totals.fees.tax)}
              </Text>
            </View>
            {totals.discount > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Promo discount</Text>
                <Text style={styles.summaryValue}>
                  {formatDiscount(totals.discount)}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>{formatPrice(totals.total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>{totals.itemCount}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f3ee',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2b1f14',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#8b7c6f',
  },
  emptyState: {
    backgroundColor: '#fff6ea',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5a4231',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#8b7c6f',
    lineHeight: 18,
  },
  itemsList: {
    gap: 14,
  },
  promoCard: {
    marginTop: 18,
    backgroundColor: '#fff7ee',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3e2cf',
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2b1f14',
  },
  appliedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f0d5b8',
  },
  appliedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7a4b24',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  promoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f0ddc8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#2b1f14',
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#6c3f1d',
  },
  applyButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  applyButtonDisabled: {
    backgroundColor: '#c7b3a1',
  },
  applyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff7ee',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  appliedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b1f14',
  },
  appliedNote: {
    marginTop: 4,
    fontSize: 12,
    color: '#8b7c6f',
  },
  removePromoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#f2d3a3',
    backgroundColor: '#fff1d6',
  },
  removePromoButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  removePromoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a45c2b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  promoError: {
    marginTop: 8,
    fontSize: 12,
    color: '#b23a2a',
  },
  promoSuccess: {
    marginTop: 8,
    fontSize: 12,
    color: '#2f6e3a',
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee3d7',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b1f14',
  },
  itemDetails: {
    marginTop: 6,
    fontSize: 12,
    color: '#8b7c6f',
  },
  itemNotes: {
    marginTop: 6,
    fontSize: 12,
    color: '#6a4a2f',
  },
  removeButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#f2d3a3',
    backgroundColor: '#fff1d6',
  },
  removeButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  removeButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a45c2b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  itemFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#efe2d6',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  quantityButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b1f14',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2b1f14',
    minWidth: 20,
    textAlign: 'center',
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  unitPrice: {
    fontSize: 11,
    color: '#8b7c6f',
  },
  linePrice: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#2b1f14',
  },
  summaryCard: {
    marginTop: 20,
    backgroundColor: '#fff4e6',
    borderRadius: 18,
    padding: 16,
  },
  summaryGroup: {
    gap: 10,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#f0dfcd',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b7c6f',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2b1f14',
  },
});
