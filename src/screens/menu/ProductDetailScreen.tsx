import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { loadMenu } from '../../data/seedLoader';
import type { RootStackParamList } from '../auth/types';

const formatPrice = (price: number) => `RM ${price.toFixed(2)}`;

type CustomizationOption = {
  id: string;
  label: string;
  detail?: string;
  price: number;
};

const sizeOptions: CustomizationOption[] = [
  { id: 'size_regular', label: 'Regular', detail: '12oz', price: 0 },
  { id: 'size_large', label: 'Large', detail: '16oz', price: 1.5 },
  { id: 'size_mega', label: 'Mega', detail: '20oz', price: 2.5 },
];

const sugarOptions: CustomizationOption[] = [
  { id: 'sugar_0', label: 'No sugar', price: 0 },
  { id: 'sugar_50', label: '50% sweet', price: 0 },
  { id: 'sugar_100', label: 'Regular sweet', price: 0 },
];

const addOnOptions: CustomizationOption[] = [
  { id: 'addon_shot', label: 'Extra shot', price: 2.0 },
  { id: 'addon_oat', label: 'Oat milk', price: 1.2 },
  { id: 'addon_caramel', label: 'Caramel drizzle', price: 1.0 },
];

export default function ProductDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetail'>>();
  const itemId = route.params?.itemId;
  const menu = useMemo(() => loadMenu(), []);
  const item = useMemo(
    () => menu.find((menuItem) => menuItem.id === itemId),
    [menu, itemId],
  );
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [sugarId, setSugarId] = useState<string | null>(null);
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>Item not found</Text>
          <Text style={styles.notFoundSubtitle}>
            We couldn't find the drink details. Try selecting another item.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const allergens = item.allergens ?? [];
  const selectedSize = sizeOptions.find((option) => option.id === sizeId);
  const selectedSugar = sugarOptions.find((option) => option.id === sugarId);
  const selectedAddOns = addOnOptions.filter((option) =>
    addOnIds.includes(option.id),
  );
  const addOnTotal = selectedAddOns.reduce((sum, option) => sum + option.price, 0);
  const sizeUpcharge = selectedSize?.price ?? 0;
  const totalPrice = item.basePrice + sizeUpcharge + addOnTotal;
  const missingRequired = !selectedSize || !selectedSugar;

  const toggleAddOn = (id: string) => {
    setAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id],
    );
  };

  const handleAddToCart = () => {
    if (missingRequired) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    Alert.alert(
      'Added to cart',
      `${item.name} • ${selectedSize?.label} • ${selectedSugar?.label}\nTotal ${formatPrice(
        totalPrice,
      )}`,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageStrip}
        >
          {item.imageUrls.map((url, index) => (
            <Image
              key={`${url}-${index}`}
              source={{ uri: url }}
              style={styles.heroImage}
            />
          ))}
        </ScrollView>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.price}>{formatPrice(item.basePrice)}</Text>
          </View>
          <View style={styles.badgeWrapper}>
            <Text style={styles.badgeLabel}>{item.availability === 'sold_out' ? 'Sold out' : 'Available'}</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionBody}>
            {item.description ?? 'No description provided yet.'}
          </Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Size</Text>
            <Text style={styles.requiredLabel}>Required</Text>
          </View>
          <View style={styles.optionRow}>
            {sizeOptions.map((option) => {
              const isSelected = option.id === sizeId;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSizeId(option.id)}
                  style={({ pressed }) => [
                    styles.optionPill,
                    isSelected && styles.optionPillSelected,
                    pressed && styles.optionPillPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {option.detail ? (
                    <Text
                      style={[
                        styles.optionDetail,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {option.detail}
                    </Text>
                  ) : null}
                  {option.price > 0 ? (
                    <Text
                      style={[
                        styles.optionPrice,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      +{formatPrice(option.price)}
                    </Text>
                  ) : (
                    <Text
                      style={[
                        styles.optionPrice,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      Included
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
          {showErrors && !selectedSize ? (
            <Text style={styles.validationText}>Select a size to continue.</Text>
          ) : null}
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sugar</Text>
            <Text style={styles.requiredLabel}>Required</Text>
          </View>
          <View style={styles.optionRow}>
            {sugarOptions.map((option) => {
              const isSelected = option.id === sugarId;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSugarId(option.id)}
                  style={({ pressed }) => [
                    styles.optionPill,
                    isSelected && styles.optionPillSelected,
                    pressed && styles.optionPillPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {showErrors && !selectedSugar ? (
            <Text style={styles.validationText}>Select a sugar level.</Text>
          ) : null}
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Add-ons</Text>
            <Text style={styles.sectionCaption}>Optional</Text>
          </View>
          <View style={styles.optionRow}>
            {addOnOptions.map((option) => {
              const isSelected = addOnIds.includes(option.id);
              return (
                <Pressable
                  key={option.id}
                  onPress={() => toggleAddOn(option.id)}
                  style={({ pressed }) => [
                    styles.optionPill,
                    isSelected && styles.optionPillSelected,
                    pressed && styles.optionPillPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.optionPrice,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    +{formatPrice(option.price)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergens</Text>
          {allergens.length > 0 ? (
            <View style={styles.allergenRow}>
              {allergens.map((allergen) => (
                <View key={allergen} style={styles.allergenPill}>
                  <Text style={styles.allergenText}>{allergen}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.sectionBody}>No listed allergens.</Text>
          )}
        </View>
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerLabel}>Total</Text>
            <Text style={styles.footerPrice}>{formatPrice(totalPrice)}</Text>
          </View>
          <Pressable
            onPress={handleAddToCart}
            style={({ pressed }) => [
              styles.addToCartButton,
              missingRequired && styles.addToCartButtonDisabled,
              pressed && !missingRequired && styles.addToCartButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.addToCartText,
                missingRequired && styles.addToCartTextDisabled,
              ]}
            >
              Add to cart
            </Text>
          </Pressable>
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
    paddingBottom: 24,
  },
  imageStrip: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  heroImage: {
    width: 240,
    height: 160,
    borderRadius: 18,
    backgroundColor: '#efe2d6',
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2b1f14',
  },
  price: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#d5863d',
  },
  badgeWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fff1d6',
    borderWidth: 1,
    borderColor: '#f2d3a3',
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6a4a2f',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2b1f14',
  },
  requiredLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b36b2c',
    backgroundColor: '#fff1d6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  sectionCaption: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8b7c6f',
  },
  sectionBody: {
    fontSize: 13,
    color: '#8b7c6f',
    lineHeight: 20,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionPill: {
    borderWidth: 1,
    borderColor: '#efe2d6',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 110,
  },
  optionPillSelected: {
    backgroundColor: '#2f2014',
    borderColor: '#2f2014',
  },
  optionPillPressed: {
    transform: [{ scale: 0.98 }],
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2b1f14',
  },
  optionLabelSelected: {
    color: '#fff5e9',
  },
  optionDetail: {
    marginTop: 4,
    fontSize: 11,
    color: '#8b7c6f',
  },
  optionPrice: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#b36b2c',
  },
  validationText: {
    marginTop: 8,
    fontSize: 12,
    color: '#b2453c',
    fontWeight: '600',
  },
  allergenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#fff4e6',
  },
  allergenText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6a4a2f',
    textTransform: 'capitalize',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b1f14',
  },
  notFoundSubtitle: {
    marginTop: 8,
    fontSize: 13,
    color: '#8b7c6f',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  footerLabel: {
    fontSize: 12,
    color: '#8b7c6f',
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b1f14',
    marginTop: 4,
  },
  addToCartButton: {
    backgroundColor: '#d5863d',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
  },
  addToCartButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  addToCartButtonDisabled: {
    backgroundColor: '#e7d6c7',
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  addToCartTextDisabled: {
    color: '#a18c79',
  },
});
