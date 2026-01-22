import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthLayout, authStyles } from './AuthLayout';
import type { RootStackParamList } from './types';
import { validateContact } from './validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

type RegisterErrors = {
  name?: string;
  contact?: string;
  password?: string;
};

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});

  const handleSubmit = () => {
    const nextErrors: RegisterErrors = {};
    const contactValidation = validateContact(contact);

    if (!name.trim()) {
      nextErrors.name = 'Please enter your full name.';
    }
    if (contactValidation.error) {
      nextErrors.contact = contactValidation.error;
    }
    if (!password.trim()) {
      nextErrors.password = 'Please enter a password.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    navigation.navigate('OTP', { contact: contactValidation.normalized });
  };

  return (
    <AuthLayout>
      <Text style={authStyles.heading}>Create account</Text>
      <Text style={authStyles.subheading}>
        Set up your profile so we can personalize your coffee experience.
      </Text>
      <Text style={authStyles.fieldLabel}>Full name</Text>
      <TextInput
        style={[authStyles.input, errors.name ? authStyles.inputError : null]}
        placeholder="Your name"
        placeholderTextColor="#a29387"
        value={name}
        onChangeText={(value) => {
          setName(value);
          if (errors.name && value.trim()) {
            setErrors((prev) => ({ ...prev, name: undefined }));
          }
        }}
        onBlur={() => {
          if (!name.trim()) {
            setErrors((prev) => ({ ...prev, name: 'Please enter your full name.' }));
          }
        }}
      />
      {errors.name ? <Text style={authStyles.errorText}>{errors.name}</Text> : null}
      <Text style={authStyles.fieldLabel}>Phone or email</Text>
      <TextInput
        style={[authStyles.input, errors.contact ? authStyles.inputError : null]}
        placeholder="Phone number or email"
        placeholderTextColor="#a29387"
        autoCapitalize="none"
        keyboardType="email-address"
        value={contact}
        onChangeText={(value) => {
          setContact(value);
          if (errors.contact && !validateContact(value).error) {
            setErrors((prev) => ({ ...prev, contact: undefined }));
          }
        }}
        onBlur={() => {
          const validation = validateContact(contact);
          setErrors((prev) => ({ ...prev, contact: validation.error ?? undefined }));
        }}
      />
      {errors.contact ? <Text style={authStyles.errorText}>{errors.contact}</Text> : null}
      <Text style={authStyles.fieldLabel}>Password</Text>
      <TextInput
        style={[authStyles.input, errors.password ? authStyles.inputError : null]}
        placeholder="Create a password"
        placeholderTextColor="#a29387"
        secureTextEntry
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          if (errors.password && value.trim()) {
            setErrors((prev) => ({ ...prev, password: undefined }));
          }
        }}
        onBlur={() => {
          if (!password.trim()) {
            setErrors((prev) => ({
              ...prev,
              password: 'Please enter a password.',
            }));
          }
        }}
      />
      {errors.password ? <Text style={authStyles.errorText}>{errors.password}</Text> : null}
      <Pressable style={authStyles.button} onPress={handleSubmit}>
        <Text style={authStyles.buttonText}>Create account</Text>
      </Pressable>
      <View style={authStyles.spacer} />
      <Pressable
        style={authStyles.linkButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={authStyles.linkText}>Already have an account? Log in</Text>
      </Pressable>
    </AuthLayout>
  );
}
