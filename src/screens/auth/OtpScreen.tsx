import React, { useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthLayout, authStyles } from './AuthLayout';
import type { RootStackParamList } from './types';
import { OTP_LENGTH, validateOtp } from './validation';
import { demoOtpCode, verifyOtp } from '../../data/mockOtp';

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

export default function OtpScreen({ navigation, route }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const contact = route.params?.contact;
  const otpToken = route.params?.otpToken;
  const expiresAt = route.params?.expiresAt;

  const handleVerify = () => {
    const validationError = validateOtp(code);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!otpToken || !expiresAt) {
      setError('Request a new code to continue.');
      return;
    }

    const result = verifyOtp(otpToken, code.trim());
    if (!result.ok) {
      if (result.error === 'expired') {
        setError('That code expired. Request a new one.');
        return;
      }
      if (result.error === 'invalid') {
        setError('That code does not match. Try again.');
        return;
      }
      setError('Request a new code to continue.');
      return;
    }

    setError(null);
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
        style={[authStyles.input, error ? authStyles.inputError : null]}
        placeholder="6-digit code"
        placeholderTextColor="#a29387"
        keyboardType="number-pad"
        value={code}
        maxLength={OTP_LENGTH}
        onChangeText={(value) => {
          setCode(value);
          if (error && !validateOtp(value)) {
            setError(null);
          }
        }}
        onBlur={() => {
          setError(validateOtp(code));
        }}
      />
      {error ? <Text style={authStyles.errorText}>{error}</Text> : null}
      <Pressable style={authStyles.button} onPress={handleVerify}>
        <Text style={authStyles.buttonText}>Verify</Text>
      </Pressable>
      <Text style={authStyles.footerText}>Demo OTP: {demoOtpCode}</Text>
      <Pressable
        style={authStyles.linkButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={authStyles.linkText}>Change phone or email</Text>
      </Pressable>
    </AuthLayout>
  );
}
