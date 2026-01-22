import React, { useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthLayout, authStyles } from './AuthLayout';
import type { RootStackParamList } from './types';
import { validateContact } from './validation';

type Props = NativeStackScreenProps<RootStackParamList, 'Forgot'>;

export default function ForgotScreen({ navigation }: Props) {
  const [contact, setContact] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSend = () => {
    const validation = validateContact(contact);
    if (validation.error) {
      setError(validation.error);
      return;
    }
    setError(null);
    navigation.navigate('OTP', { contact: validation.normalized });
  };

  return (
    <AuthLayout>
      <Text style={authStyles.heading}>Reset access</Text>
      <Text style={authStyles.subheading}>
        Enter your phone or email and we will send a new code.
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
