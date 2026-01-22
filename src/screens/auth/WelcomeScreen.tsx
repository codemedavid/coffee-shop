import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthLayout, authStyles } from './AuthLayout';
import type { RootStackParamList } from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <AuthLayout>
      <View style={authStyles.logo}>
        <Text style={authStyles.logoText}>Z</Text>
      </View>
      <Text style={authStyles.heading}>Welcome to Zus Coffee</Text>
      <Text style={authStyles.subheading}>
        Order faster, save your favorites, and track rewards with a quick sign-in.
      </Text>
      <Pressable
        style={authStyles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={authStyles.buttonText}>Continue with phone or email</Text>
      </Pressable>
      <View style={authStyles.spacer} />
      <Pressable
        style={[authStyles.button, authStyles.secondaryButton]}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={[authStyles.buttonText, authStyles.secondaryButtonText]}>
          Create an account
        </Text>
      </Pressable>
      <Pressable
        style={authStyles.linkButton}
        onPress={() => navigation.navigate('MainTabs')}
      >
        <Text style={authStyles.linkText}>Continue as guest</Text>
      </Pressable>
    </AuthLayout>
  );
}
