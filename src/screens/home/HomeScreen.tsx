import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { loadMenu, loadStores } from '../../data/seedLoader';
import type { MenuItem, Store } from '../../models/types';

const formatCategoryName = (categoryId: string) => {
  const cleaned = categoryId.replace(/^c_/, '');
  return cleaned
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const getFeaturedItems = (items: MenuItem[]) =>
  items.filter((item) => Boolean(item.badge) || item.tags.includes('classic'));

const formatPrice = (price: number) => `RM ${price.toFixed(2)}`;

const formatHours = (hours: Store['hours']) => `${hours.open} - ${hours.close}`;

const parseTimeToMinutes = (value: string) => {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
};

const isStoreOpenNow = (store: Store, now: Date) => {
  const openMinutes = parseTimeToMinutes(store.hours.open);
  const closeMinutes = parseTimeToMinutes(store.hours.close);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  if (closeMinutes === openMinutes) {
    return false;
  }
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};

export default function HomeScreen() {
  const menu = useMemo(() => loadMenu(), []);
  const stores = useMemo(() => loadStores(), []);
  const featuredItems = useMemo(() => getFeaturedItems(menu), [menu]);
  const categories = useMemo(() => {
    const ids = Array.from(new Set(menu.map((item) => item.categoryId)));
    return ids.map((id) => ({
      id,
      name: formatCategoryName(id),
      count: menu.filter((item) => item.categoryId === id).length,
    }));
  }, [menu]);
  const favoriteStoreIds = useMemo(() => ['s_001'], []);
  const nearestStores = useMemo(
    () => [...stores].sort((first, second) => first.distanceKm - second.distanceKm),
    [stores],
  );
  const favoriteStores = useMemo(
    () => stores.filter((store) => favoriteStoreIds.includes(store.id)),
    [stores, favoriteStoreIds],
  );
  const defaultStore = useMemo(() => {
    const now = new Date();
    return (
      nearestStores.find((store) => isStoreOpenNow(store, now)) ??
      nearestStores[0] ??
      favoriteStores[0]
    );
  }, [favoriteStores, nearestStores]);
  const [activeStoreId, setActiveStoreId] = useState(defaultStore?.id ?? '');
  const [storeModalVisible, setStoreModalVisible] = useState(false);
  const [statusTimestamp, setStatusTimestamp] = useState(new Date());
  const activeStore = useMemo(
    () => stores.find((store) => store.id === activeStoreId) ?? defaultStore,
    [activeStoreId, defaultStore, stores],
  );
  const openStoreModal = () => {
    setStatusTimestamp(new Date());
    setStoreModalVisible(true);
  };
  const closeStoreModal = () => setStoreModalVisible(false);
  const handleSelectStore = (store: Store) => {
    setActiveStoreId(store.id);
    closeStoreModal();
  };
  const renderStoreCard = (store: Store) => {
    const isOpen = isStoreOpenNow(store, statusTimestamp);
    return (
      <Pressable
        key={store.id}
        onPress={() => handleSelectStore(store)}
        disabled={!isOpen}
        style={({ pressed }) => [
          styles.storeCard,
          !isOpen && styles.storeCardDisabled,
          pressed && isOpen && styles.storeCardPressed,
        ]}
      >
        <View style={styles.storeCardHeader}>
          <Text style={styles.storeName}>{store.name}</Text>
          <View style={[styles.storeStatus, isOpen ? styles.storeOpen : styles.storeClosed]}>
            <Text style={[styles.storeStatusText, !isOpen && styles.storeStatusTextClosed]}>
              {isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
        <Text style={styles.storeAddress}>{store.address}</Text>
        <View style={styles.storeMetaRow}>
          <Text style={styles.storeMetaText}>{formatHours(store.hours)}</Text>
          <Text style={styles.storeMetaText}>{store.distanceKm.toFixed(1)} km</Text>
        </View>
        {!isOpen && <Text style={styles.storeClosedNote}>Selection unavailable</Text>}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.storePicker}>
          <Text style={styles.storeLabel}>Pickup store</Text>
          <Pressable onPress={openStoreModal} style={styles.storeButton}>
            <View style={styles.storeButtonContent}>
              <Text style={styles.storeButtonTitle}>
                {activeStore ? activeStore.name : 'Select a store'}
              </Text>
              {activeStore ? (
                <Text style={styles.storeButtonSubtitle}>
                  {activeStore.distanceKm.toFixed(1)} km · {formatHours(activeStore.hours)}
                </Text>
              ) : null}
            </View>
            <Text style={styles.storeButtonIcon}>Edit</Text>
          </Pressable>
        </View>
        <View style={styles.banner}>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>Welcome back</Text>
          </View>
          <Text style={styles.bannerTitle}>Grab your next cup</Text>
          <Text style={styles.bannerSubtitle}>
            Discover seasonal specials and your daily favorites.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <Text style={styles.sectionSubtitle}>Fresh picks from the baristas</Text>
          </View>
          <FlatList
            data={featuredItems}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No featured items yet</Text>
                <Text style={styles.emptySubtitle}>
                  Check back soon for new coffee highlights.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.featuredCard}>
                {item.imageUrls[0] ? (
                  <Image source={{ uri: item.imageUrls[0] }} style={styles.featuredImage} />
                ) : (
                  <View style={styles.imagePlaceholder} />
                )}
                <View style={styles.featuredMeta}>
                  <Text style={styles.featuredName}>{item.name}</Text>
                  <Text style={styles.featuredPrice}>{formatPrice(item.basePrice)}</Text>
                </View>
              </View>
            )}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Text style={styles.sectionSubtitle}>Browse by flavor profile</Text>
          </View>
          <View style={styles.categoryList}>
            {categories.map((category) => (
              <View key={category.id} style={styles.categoryCard}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.count} items</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={storeModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeStoreModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select a store</Text>
                <Text style={styles.modalSubtitle}>Choose where you will pick up</Text>
              </View>
              <Pressable onPress={closeStoreModal} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>Close</Text>
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Favorites</Text>
                {favoriteStores.map((store) => renderStoreCard(store))}
                {favoriteStores.length === 0 ? (
                  <Text style={styles.modalEmptyText}>No favorite stores yet.</Text>
                ) : null}
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Nearest stores</Text>
                {nearestStores.map((store) => renderStoreCard(store))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f3ee',
  },
  container: {
    paddingBottom: 32,
  },
  storePicker: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  storeLabel: {
    fontSize: 12,
    color: '#8b7c6f',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  storeButton: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee3d7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeButtonContent: {
    flex: 1,
    marginRight: 12,
  },
  storeButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b1f14',
  },
  storeButtonSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#8b7c6f',
  },
  storeButtonIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d5863d',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  banner: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#2f2014',
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0c070',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  bannerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#2f2014',
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff8f1',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#e8dcd0',
    lineHeight: 20,
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b1f14',
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#8b7c6f',
  },
  featuredList: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 16,
  },
  featuredCard: {
    width: 200,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  featuredImage: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    backgroundColor: '#f3ece5',
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    backgroundColor: '#efe2d6',
  },
  featuredMeta: {
    marginTop: 12,
  },
  featuredName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b1f14',
  },
  featuredPrice: {
    marginTop: 4,
    fontSize: 13,
    color: '#8b7c6f',
  },
  emptyState: {
    width: 260,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#fff6ea',
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
  categoryList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee3d7',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b1f14',
  },
  categoryCount: {
    marginTop: 4,
    fontSize: 12,
    color: '#8b7c6f',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(22, 15, 9, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '88%',
    backgroundColor: '#f8f3ee',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b1f14',
  },
  modalSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#8b7c6f',
  },
  modalClose: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#efe2d6',
  },
  modalCloseText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5a4231',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2b1f14',
    marginBottom: 10,
  },
  modalEmptyText: {
    fontSize: 12,
    color: '#8b7c6f',
  },
  storeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee3d7',
    marginBottom: 12,
  },
  storeCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  storeCardDisabled: {
    opacity: 0.6,
  },
  storeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b1f14',
  },
  storeStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  storeOpen: {
    backgroundColor: '#e4f1e6',
  },
  storeClosed: {
    backgroundColor: '#f7e1df',
  },
  storeStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2f5d3c',
    textTransform: 'uppercase',
  },
  storeStatusTextClosed: {
    color: '#9e3a33',
  },
  storeAddress: {
    marginTop: 6,
    fontSize: 12,
    color: '#8b7c6f',
  },
  storeMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  storeMetaText: {
    fontSize: 11,
    color: '#a08f83',
  },
  storeClosedNote: {
    marginTop: 8,
    fontSize: 11,
    color: '#9e3a33',
  },
});
