import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useProfile } from '../../data/profile';
import { useAddresses } from '../../data/addresses';
import type { Address } from '../../models/types';

type AddressErrors = {
  label?: string;
  line1?: string;
  city?: string;
  postalCode?: string;
};

const buildEmptyForm = (isDefault: boolean) => ({
  label: '',
  line1: '',
  city: '',
  postalCode: '',
  note: '',
  isDefault,
});

export default function AddressesScreen() {
  const { profile } = useProfile();
  const { addresses, isLoading, addAddress, updateAddress, removeAddress } =
    useAddresses();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(buildEmptyForm(addresses.length === 0));
  const [errors, setErrors] = useState<AddressErrors>({});
  const [message, setMessage] = useState('');

  const sortedAddresses = useMemo(() => {
    const defaultAddress = addresses.find((address) => address.isDefault);
    const rest = addresses.filter((address) => !address.isDefault);
    return defaultAddress ? [defaultAddress, ...rest] : addresses;
  }, [addresses]);

  const resetForm = () => {
    setEditingId(null);
    setForm(buildEmptyForm(addresses.length === 0));
    setErrors({});
  };

  const startEdit = (address: Address) => {
    setEditingId(address.id);
    setForm({
      label: address.label,
      line1: address.line1,
      city: address.city,
      postalCode: address.postalCode,
      note: address.note ?? '',
      isDefault: address.isDefault,
    });
    setErrors({});
  };

  const validate = () => {
    const nextErrors: AddressErrors = {};
    if (!form.label.trim()) {
      nextErrors.label = 'Label is required.';
    }
    if (!form.line1.trim()) {
      nextErrors.line1 = 'Street address is required.';
    }
    if (!form.city.trim()) {
      nextErrors.city = 'City is required.';
    }
    if (!form.postalCode.trim()) {
      nextErrors.postalCode = 'Postal code is required.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }
    const payload = {
      userId: profile.id,
      label: form.label.trim(),
      line1: form.line1.trim(),
      city: form.city.trim(),
      postalCode: form.postalCode.trim(),
      note: form.note.trim() ? form.note.trim() : undefined,
      isDefault: form.isDefault,
    };

    if (editingId) {
      await updateAddress(editingId, payload);
      setMessage('Address updated.');
    } else {
      const id = `addr_${Date.now().toString(36)}`;
      await addAddress({ id, ...payload });
      setMessage('Address added.');
    }
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await removeAddress(id);
    if (editingId === id) {
      resetForm();
    }
    setMessage('Address removed.');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Delivery addresses</Text>
          <Text style={styles.subtitle}>
            Keep your delivery locations up to date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved addresses</Text>
          {sortedAddresses.length === 0 ? (
            <Text style={styles.emptyText}>
              No addresses yet. Add your first delivery location below.
            </Text>
          ) : (
            <View style={styles.addressList}>
              {sortedAddresses.map((address) => (
                <View key={address.id} style={styles.addressCard}>
                  <View style={styles.addressHeader}>
                    <View style={styles.addressTitleRow}>
                      <Text style={styles.addressTitle}>{address.label}</Text>
                      {address.isDefault ? (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.addressSubtitle}>{address.line1}</Text>
                    <Text style={styles.addressMeta}>
                      {address.city} {address.postalCode}
                    </Text>
                    {address.note ? (
                      <Text style={styles.addressNote}>{address.note}</Text>
                    ) : null}
                  </View>
                  <View style={styles.addressActions}>
                    {!address.isDefault ? (
                      <Pressable
                        onPress={() =>
                          updateAddress(address.id, { isDefault: true })
                        }
                        style={({ pressed }) => [
                          styles.secondaryAction,
                          pressed && styles.secondaryActionPressed,
                        ]}
                      >
                        <Text style={styles.secondaryActionText}>
                          Set default
                        </Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      onPress={() => startEdit(address)}
                      style={({ pressed }) => [
                        styles.secondaryAction,
                        pressed && styles.secondaryActionPressed,
                      ]}
                    >
                      <Text style={styles.secondaryActionText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(address.id)}
                      style={({ pressed }) => [
                        styles.deleteAction,
                        pressed && styles.deleteActionPressed,
                      ]}
                    >
                      <Text style={styles.deleteActionText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.formHeader}>
            <Text style={styles.sectionTitle}>
              {editingId ? 'Edit address' : 'Add new address'}
            </Text>
            {editingId ? (
              <Pressable
                onPress={resetForm}
                style={({ pressed }) => [
                  styles.secondaryAction,
                  pressed && styles.secondaryActionPressed,
                ]}
              >
                <Text style={styles.secondaryActionText}>Cancel edit</Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.fieldLabel}>Label</Text>
          <TextInput
            style={[styles.input, errors.label ? styles.inputError : null]}
            placeholder="Home, Office, etc."
            placeholderTextColor="#9d8f86"
            value={form.label}
            onChangeText={(value) => {
              setForm((prev) => ({ ...prev, label: value }));
              if (errors.label && value.trim()) {
                setErrors((prev) => ({ ...prev, label: undefined }));
              }
            }}
          />
          {errors.label ? (
            <Text style={styles.errorText}>{errors.label}</Text>
          ) : null}

          <Text style={styles.fieldLabel}>Street address</Text>
          <TextInput
            style={[styles.input, errors.line1 ? styles.inputError : null]}
            placeholder="Street, building, unit"
            placeholderTextColor="#9d8f86"
            value={form.line1}
            onChangeText={(value) => {
              setForm((prev) => ({ ...prev, line1: value }));
              if (errors.line1 && value.trim()) {
                setErrors((prev) => ({ ...prev, line1: undefined }));
              }
            }}
          />
          {errors.line1 ? (
            <Text style={styles.errorText}>{errors.line1}</Text>
          ) : null}

          <View style={styles.inlineRow}>
            <View style={styles.inlineField}>
              <Text style={styles.fieldLabel}>City</Text>
              <TextInput
                style={[styles.input, errors.city ? styles.inputError : null]}
                placeholder="City"
                placeholderTextColor="#9d8f86"
                value={form.city}
                onChangeText={(value) => {
                  setForm((prev) => ({ ...prev, city: value }));
                  if (errors.city && value.trim()) {
                    setErrors((prev) => ({ ...prev, city: undefined }));
                  }
                }}
              />
              {errors.city ? (
                <Text style={styles.errorText}>{errors.city}</Text>
              ) : null}
            </View>
            <View style={styles.inlineField}>
              <Text style={styles.fieldLabel}>Postal code</Text>
              <TextInput
                style={[styles.input, errors.postalCode ? styles.inputError : null]}
                placeholder="Postcode"
                placeholderTextColor="#9d8f86"
                value={form.postalCode}
                onChangeText={(value) => {
                  setForm((prev) => ({ ...prev, postalCode: value }));
                  if (errors.postalCode && value.trim()) {
                    setErrors((prev) => ({ ...prev, postalCode: undefined }));
                  }
                }}
              />
              {errors.postalCode ? (
                <Text style={styles.errorText}>{errors.postalCode}</Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.fieldLabel}>Delivery notes (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Gate code, lobby, etc."
            placeholderTextColor="#9d8f86"
            value={form.note}
            onChangeText={(value) => setForm((prev) => ({ ...prev, note: value }))}
          />

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.preferenceTitle}>Set as default</Text>
              <Text style={styles.preferenceSubtitle}>
                Use this address for checkout.
              </Text>
            </View>
            <Switch
              value={form.isDefault}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, isDefault: value }))
              }
              trackColor={{ false: '#e3d7cd', true: '#b46a3c' }}
              thumbColor={form.isDefault ? '#fff' : '#f4ece6'}
            />
          </View>

          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {editingId ? 'Update address' : 'Save address'}
            </Text>
          </Pressable>

          {message ? <Text style={styles.messageText}>{message}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f1ec',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3b2d24',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6b5c52',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#3b2d24',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b2d24',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 12,
    color: '#6b5c52',
  },
  addressList: {
    marginTop: 12,
    gap: 12,
  },
  addressCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1e7de',
    padding: 14,
    backgroundColor: '#fdfbf9',
  },
  addressHeader: {
    gap: 4,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b2d24',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#e8d2bf',
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7a4b24',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  addressSubtitle: {
    fontSize: 12,
    color: '#6b5c52',
  },
  addressMeta: {
    fontSize: 11,
    color: '#9a8776',
  },
  addressNote: {
    fontSize: 11,
    color: '#8a6b52',
  },
  addressActions: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  secondaryAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#eadfd6',
    backgroundColor: '#fffaf4',
  },
  secondaryActionPressed: {
    transform: [{ scale: 0.98 }],
  },
  secondaryActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b5c52',
  },
  deleteAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#f0c2bb',
    backgroundColor: '#fdeeee',
  },
  deleteActionPressed: {
    transform: [{ scale: 0.98 }],
  },
  deleteActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#b14b3c',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b5c52',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eadfd6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#3b2d24',
    backgroundColor: '#fdfbf9',
  },
  inputError: {
    borderColor: '#c65346',
  },
  errorText: {
    marginTop: 6,
    color: '#c65346',
    fontSize: 12,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineField: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1e7de',
    marginBottom: 16,
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b2d24',
  },
  preferenceSubtitle: {
    fontSize: 12,
    color: '#6b5c52',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#3b2d24',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  messageText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#4b7a4c',
    fontWeight: '500',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#6b5c52',
  },
});
