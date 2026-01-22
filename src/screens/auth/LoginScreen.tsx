import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthLayout, authStyles } from './AuthLayout';
import type { RootStackParamList } from './types';
import { validateContact } from './validation';
import { requestOtp } from '../../data/mockOtp';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [contact, setContact] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    const validation = validateContact(contact);
    if (validation.error) {
      setError(validation.error);
      return;
    }
    const { token, expiresAt } = requestOtp(validation.normalized);
    setError(null);
    navigation.navigate('OTP', {
      contact: validation.normalized,
      otpToken: token,
      expiresAt,
    });
  };

  return (
    <AuthLayout>
      <Text style={authStyles.heading}>Log in</Text>
      <Text style={authStyles.subheading}>
        Use your phone or email to receive a one-time code.
      </Text>
      <Text style={authStyles.fieldLabel}>Phone or email</Text>
      <TextInput
        style={[authStyles.input, error ? authStyles.inputError : null]}
        placeholder="Phone number or email"
        placeholderTextColor="#a29387"
        autoCapitalize="none"
        keyboardType="email-address"
        value={contact}
        onChangeText={(value) => {
          setContact(value);
          if (error && !validateContact(value).error) {
            setError(null);
          }
        }}
        onBlur={() => {
          const validation = validateContact(contact);
          setError(validation.error);
        }}
      />
      {error ? <Text style={authStyles.errorText}>{error}</Text> : null}
      <Pressable style={authStyles.button} onPress={handleContinue}>
        <Text style={authStyles.buttonText}>Continue</Text>
      </Pressable>
      <View style={authStyles.spacer} />
      <Pressable
        style={authStyles.linkButton}
        onPress={() => navigation.navigate('Forgot')}
      >
        <Text style={authStyles.linkText}>Forgot your password?</Text>
      </Pressable>
      <Pressable
        style={authStyles.linkButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={authStyles.linkText}>New here? Create an account</Text>
      </Pressable>
    </AuthLayout>
  );
}
