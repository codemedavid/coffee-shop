import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotScreen from './src/screens/auth/ForgotScreen';
import OtpScreen from './src/screens/auth/OtpScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import MenuScreen from './src/screens/menu/MenuScreen';
import ProductDetailScreen from './src/screens/menu/ProductDetailScreen';
import { FavoritesProvider } from './src/data/favorites';
import { CartProvider } from './src/data/cart';
import { OrderHistoryProvider } from './src/data/orderHistory';
import { ProfileProvider } from './src/data/profile';
import { AddressesProvider } from './src/data/addresses';
import CartScreen from './src/screens/cart/CartScreen';
import CheckoutScreen from './src/screens/cart/CheckoutScreen';
import OrderConfirmationScreen from './src/screens/cart/OrderConfirmationScreen';
import OrderStatusScreen from './src/screens/orders/OrderStatusScreen';
import RewardsScreen from './src/screens/rewards/RewardsScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import AddressesScreen from './src/screens/profile/AddressesScreen';
import type { RootStackParamList } from './src/screens/auth/types';

type RootTabParamList = {
  Home: undefined;
  Menu: undefined;
  Orders: undefined;
  Rewards: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Tab.Screen
        name="Home"
        options={{ title: 'Home' }}
        component={HomeScreen}
      />
      <Tab.Screen
        name="Menu"
        options={{ title: 'Menu' }}
        component={MenuScreen}
      />
      <Tab.Screen
        name="Orders"
        options={{ title: 'Orders' }}
        children={() => <OrderStatusScreen />}
      />
      <Tab.Screen
        name="Rewards"
        options={{ title: 'Rewards' }}
        component={RewardsScreen}
      />
      <Tab.Screen
        name="Profile"
        options={{ title: 'Profile' }}
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <FavoritesProvider>
      <ProfileProvider>
        <AddressesProvider>
          <CartProvider>
            <OrderHistoryProvider>
              <NavigationContainer>
                <RootStack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
                  <RootStack.Screen
                    name="Welcome"
                    component={WelcomeScreen}
                    options={{ headerShown: false }}
                  />
                  <RootStack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
                  <RootStack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{ title: 'Create account' }}
                  />
                  <RootStack.Screen
                    name="Forgot"
                    component={ForgotScreen}
                    options={{ title: 'Reset access' }}
                  />
                  <RootStack.Screen
                    name="OTP"
                    component={OtpScreen}
                    options={{ title: 'Verify OTP' }}
                  />
                  <RootStack.Screen
                    name="MainTabs"
                    component={MainTabs}
                    options={{ headerShown: false }}
                  />
                  <RootStack.Screen
                    name="ProductDetail"
                    component={ProductDetailScreen}
                    options={{ title: 'Product detail' }}
                  />
                  <RootStack.Screen
                    name="Cart"
                    component={CartScreen}
                    options={{ title: 'Cart' }}
                  />
                  <RootStack.Screen
                    name="Checkout"
                    component={CheckoutScreen}
                    options={{ title: 'Checkout' }}
                  />
                  <RootStack.Screen
                    name="OrderConfirmation"
                    component={OrderConfirmationScreen}
                    options={{ title: 'Order confirmation' }}
                  />
                  <RootStack.Screen
                    name="OrderStatus"
                    options={{ title: 'Order status' }}
                  >
                    {(props) => (
                      <OrderStatusScreen order={props.route.params?.order} />
                    )}
                  </RootStack.Screen>
                  <RootStack.Screen
                    name="Addresses"
                    component={AddressesScreen}
                    options={{ title: 'Addresses' }}
                  />
                </RootStack.Navigator>
                <StatusBar style="auto" />
              </NavigationContainer>
            </OrderHistoryProvider>
          </CartProvider>
        </AddressesProvider>
      </ProfileProvider>
    </FavoritesProvider>
  );
}
