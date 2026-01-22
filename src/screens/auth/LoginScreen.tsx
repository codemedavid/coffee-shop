import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthLayout, authStyles } from './AuthLayout';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [contact, setContact] = useState('');
  const [showError, setShowError] = useState(false);

  const handleContinue = () => {
    if (!contact.trim()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    navigation.navigate('OTP', { contact: contact.trim() });
  };

  return (
    <AuthLayout>
      <Text style={authStyles.heading}>Log in</Text>
      <Text style={authStyles.subheading}>
        Use your phone or email to receive a one-time code.
      </Text>
      <Text style={authStyles.fieldLabel}>Phone or email</Text>
      <TextInput
        style={[authStyles.input, showError ? authStyles.inputError : null]}
        placeholder="Phone number or email"
        placeholderTextColor="#a29387"
        autoCapitalize="none"
        keyboardType="email-address"
        value={contact}
        onChangeText={(value) => {
          setContact(value);
          if (showError && value.trim()) {
            setShowError(false);
          }
        }}
        onBlur={() => {
          if (!contact.trim()) {
            setShowError(true);
          }
        }}
      />
      {showError ? (
        <Text style={authStyles.errorText}>Please enter your phone or email.</Text>
      ) : null}
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
