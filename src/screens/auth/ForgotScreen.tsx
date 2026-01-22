import React, { useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthLayout, authStyles } from './AuthLayout';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Forgot'>;

export default function ForgotScreen({ navigation }: Props) {
  const [contact, setContact] = useState('');
  const [showError, setShowError] = useState(false);

  const handleSend = () => {
    if (!contact.trim()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    navigation.navigate('OTP', { contact: contact.trim() });
  };

  return (
    <AuthLayout>
      <Text style={authStyles.heading}>Reset access</Text>
      <Text style={authStyles.subheading}>
        Enter your phone or email and we will send a new code.
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
      <Pressable style={authStyles.button} onPress={handleSend}>
        <Text style={authStyles.buttonText}>Send code</Text>
      </Pressable>
      <Pressable
        style={authStyles.linkButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={authStyles.linkText}>Back to login</Text>
      </Pressable>
    </AuthLayout>
  );
}
