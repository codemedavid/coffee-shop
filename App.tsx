import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
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

const ScreenPlaceholder = ({ title }: { title: string }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

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
        children={() => <ScreenPlaceholder title="Orders" />}
      />
      <Tab.Screen
        name="Rewards"
        options={{ title: 'Rewards' }}
        children={() => <ScreenPlaceholder title="Rewards" />}
      />
      <Tab.Screen
        name="Profile"
        options={{ title: 'Profile' }}
        children={() => <ScreenPlaceholder title="Profile" />}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <FavoritesProvider>
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
        </RootStack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </FavoritesProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});
