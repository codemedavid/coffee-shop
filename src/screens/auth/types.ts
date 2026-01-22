export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Forgot: undefined;
  OTP:
    | {
        contact?: string;
        otpToken?: string;
        expiresAt?: number;
      }
    | undefined;
  MainTabs: undefined;
  Cart: undefined;
  Checkout: undefined;
  ProductDetail:
    | {
        itemId?: string;
      }
    | undefined;
};
