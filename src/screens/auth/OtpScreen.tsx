import React, { useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthLayout, authStyles } from './AuthLayout';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

export default function OtpScreen({ navigation, route }: Props) {
  const [code, setCode] = useState('');
  const [showError, setShowError] = useState(false);
  const contact = route.params?.contact;

  const handleVerify = () => {
    if (!code.trim()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    navigation.navigate('MainTabs');
  };

  return (
    <AuthLayout>
      <Text style={authStyles.heading}>Enter OTP</Text>
      <Text style={authStyles.subheading}>
        We sent a code to {contact ?? 'your contact method'}.
      </Text>
      <Text style={authStyles.fieldLabel}>One-time code</Text>
      <TextInput
        style={[authStyles.input, showError ? authStyles.inputError : null]}
        placeholder="6-digit code"
        placeholderTextColor="#a29387"
        keyboardType="number-pad"
        value={code}
        maxLength={6}
        onChangeText={(value) => {
          setCode(value);
          if (showError && value.trim()) {
            setShowError(false);
          }
        }}
        onBlur={() => {
          if (!code.trim()) {
            setShowError(true);
          }
        }}
      />
      {showError ? (
        <Text style={authStyles.errorText}>Please enter the code we sent.</Text>
      ) : null}
      <Pressable style={authStyles.button} onPress={handleVerify}>
        <Text style={authStyles.buttonText}>Verify</Text>
      </Pressable>
      <Pressable
        style={authStyles.linkButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={authStyles.linkText}>Change phone or email</Text>
      </Pressable>
    </AuthLayout>
  );
}
