import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

const authColors = {
  background: '#f8f5f1',
  card: '#ffffff',
  text: '#2b1f14',
  muted: '#8b7c6f',
  border: '#d9cbbf',
  primary: '#6b3f23',
  primaryText: '#ffffff',
  error: '#b3261e',
};

export const authStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: authColors.card,
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: authColors.text,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    color: authColors.muted,
    marginBottom: 20,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: authColors.muted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: authColors.text,
    backgroundColor: '#fffaf5',
  },
  inputError: {
    borderColor: authColors.error,
  },
  errorText: {
    color: authColors.error,
    marginTop: 6,
    marginBottom: 8,
    fontSize: 13,
  },
  spacer: {
    height: 16,
  },
  button: {
    backgroundColor: authColors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: authColors.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: authColors.border,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: authColors.text,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkText: {
    color: authColors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: authColors.muted,
    marginTop: 12,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#efe2d6',
    alignSelf: 'center',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: authColors.primary,
  },
});

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={authStyles.safeArea}>
      <KeyboardAvoidingView
        style={authStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={authStyles.scroll} keyboardShouldPersistTaps="handled">
          <View style={authStyles.card}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
