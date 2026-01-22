import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

type RootTabParamList = {
  Home: undefined;
  Menu: undefined;
  Orders: undefined;
  Rewards: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const ScreenPlaceholder = ({ title }: { title: string }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
        <Tab.Screen
          name="Home"
          options={{ title: 'Home' }}
          children={() => <ScreenPlaceholder title="Home" />}
        />
        <Tab.Screen
          name="Menu"
          options={{ title: 'Menu' }}
          children={() => <ScreenPlaceholder title="Menu" />}
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
      <StatusBar style="auto" />
    </NavigationContainer>
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
