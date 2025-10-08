import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './config/firebase';
import { CartProvider } from './contexts/CartContext';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import CartScreen from './screens/CartScreen';

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

// Auth Stack Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Login"
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <CartProvider>
      <MainStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="ProductList"
      >
        <MainStack.Screen name="ProductList" component={ProductListScreen} />
        <MainStack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <MainStack.Screen name="Cart" component={CartScreen} />
      </MainStack.Navigator>
    </CartProvider>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading saved user:', error);
      }
    };

    checkAuthState();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      try {
        if (user) {
          await AsyncStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            email: user.email,
          }));
        } else {
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('cart');
        }
      } catch (error) {
        console.error('Error saving user state:', error);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        {user ? (
          <CartProvider>
            <MainNavigator />
          </CartProvider>
        ) : (
          <AuthNavigator />
        )}
      </NavigationContainer>
    </>
  );
}
