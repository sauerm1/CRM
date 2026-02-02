import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screens (these will be created next)
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ClassesScreen from '../screens/ClassesScreen';
import ClassDetailScreen from '../screens/ClassDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RestaurantsScreen from '../screens/RestaurantsScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Classes: undefined;
  Restaurants: undefined;
  Profile: undefined;
};

export type ClassesStackParamList = {
  ClassesList: undefined;
  ClassDetail: { classId: string };
};

export type RestaurantsStackParamList = {
  RestaurantsList: undefined;
  RestaurantDetail: { restaurantId: string };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const ClassesStack = createNativeStackNavigator<ClassesStackParamList>();
const RestaurantsStack = createNativeStackNavigator<RestaurantsStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function ClassesNavigator() {
  return (
    <ClassesStack.Navigator>
      <ClassesStack.Screen 
        name="ClassesList" 
        component={ClassesScreen}
        options={{ title: 'Classes' }}
      />
      <ClassesStack.Screen 
        name="ClassDetail" 
        component={ClassDetailScreen}
        options={{ title: 'Class Details' }}
      />
    </ClassesStack.Navigator>
  );
}

function RestaurantsNavigator() {
  return (
    <RestaurantsStack.Navigator>
      <RestaurantsStack.Screen 
        name="RestaurantsList" 
        component={RestaurantsScreen}
        options={{ title: 'Restaurants' }}
      />
      <RestaurantsStack.Screen 
        name="RestaurantDetail" 
        component={RestaurantDetailScreen}
        options={{ title: 'Restaurant Details' }}
      />
    </RestaurantsStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <MainTab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <MainTab.Screen 
        name="Classes" 
        component={ClassesNavigator}
        options={{
          tabBarLabel: 'Classes',
        }}
      />
      <MainTab.Screen 
        name="Restaurants" 
        component={RestaurantsNavigator}
        options={{
          tabBarLabel: 'Dining',
        }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </MainTab.Navigator>
  );
}

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // TODO: Check authentication status from AsyncStorage
  React.useEffect(() => {
    // Check if user is authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // This will be implemented with the auth API
    // const isAuth = await authAPI.isAuthenticated();
    // setIsAuthenticated(isAuth);
  };

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
