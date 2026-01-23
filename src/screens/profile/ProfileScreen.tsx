import React, { useEffect, useMemo, useState } from 'react';
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

type ProfileErrors = {
  name?: string;
  email?: string;
};

export default function ProfileScreen() {
  const { profile, isLoading, saveProfile } = useProfile();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [marketingOptIn, setMarketingOptIn] = useState(
    profile.preferences.marketingOptIn,
  );
  const [orderUpdates, setOrderUpdates] = useState(
    profile.preferences.orderUpdates,
  );
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setMarketingOptIn(profile.preferences.marketingOptIn);
    setOrderUpdates(profile.preferences.orderUpdates);
  }, [profile]);

  const validateEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Email is required.';
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      return 'Enter a valid email address.';
    }
    return null;
  };

  const hasChanges = useMemo(
    () =>
      name !== profile.name ||
      email !== profile.email ||
      phone !== profile.phone ||
      marketingOptIn !== profile.preferences.marketingOptIn ||
      orderUpdates !== profile.preferences.orderUpdates,
    [
      email,
      marketingOptIn,
      name,
      orderUpdates,
      phone,
      profile,
    ],
  );

  const handleSave = async () => {
    const nextErrors: ProfileErrors = {};
    if (!name.trim()) {
      nextErrors.name = 'Please enter your name.';
    }
    const emailError = validateEmail(email);
    if (emailError) {
      nextErrors.email = emailError;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    setSaveMessage('');
    await saveProfile({
      ...profile,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      preferences: {
        marketingOptIn,
        orderUpdates,
      },
    });
    setIsSaving(false);
    setSaveMessage('Saved locally.');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            Update your details and choose how we keep in touch.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile details</Text>

          <Text style={styles.fieldLabel}>Full name</Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="Your name"
            placeholderTextColor="#9d8f86"
            value={name}
            onChangeText={(value) => {
              setName(value);
              if (errors.name && value.trim()) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            placeholder="you@example.com"
            placeholderTextColor="#9d8f86"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (errors.email && !validateEmail(value)) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            onBlur={() => {
              const validation = validateEmail(email);
              setErrors((prev) => ({ ...prev, email: validation ?? undefined }));
            }}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <Text style={styles.fieldLabel}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="6012 345 6789"
            placeholderTextColor="#9d8f86"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Marketing updates</Text>
              <Text style={styles.preferenceSubtitle}>
                Stay in the loop on new drinks and deals.
              </Text>
            </View>
            <Switch
              value={marketingOptIn}
              onValueChange={setMarketingOptIn}
              trackColor={{ false: '#e3d7cd', true: '#b46a3c' }}
              thumbColor={marketingOptIn ? '#fff' : '#f4ece6'}
            />
          </View>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Order status alerts</Text>
              <Text style={styles.preferenceSubtitle}>
                Get notified when your order is ready.
              </Text>
            </View>
            <Switch
              value={orderUpdates}
              onValueChange={setOrderUpdates}
              trackColor={{ false: '#e3d7cd', true: '#b46a3c' }}
              thumbColor={orderUpdates ? '#fff' : '#f4ece6'}
            />
          </View>
        </View>

        <Pressable
          style={[
            styles.saveButton,
            !hasChanges || isSaving ? styles.saveButtonDisabled : null,
          ]}
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Text>
        </Pressable>

        {saveMessage ? <Text style={styles.saveMessage}>{saveMessage}</Text> : null}
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
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b5c52',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eadfd6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#3b2d24',
    marginBottom: 10,
    backgroundColor: '#fdfbf9',
  },
  inputError: {
    borderColor: '#c65346',
  },
  errorText: {
    marginBottom: 10,
    color: '#c65346',
    fontSize: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1e7de',
  },
  preferenceText: {
    flex: 1,
    marginRight: 12,
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
  saveButton: {
    backgroundColor: '#3b2d24',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#b8aea6',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  saveMessage: {
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
