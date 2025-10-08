import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation will be handled by auth state listener in App.js
    } catch (error) {
      Alert.alert('Login Error', 'Invalid email or password');
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>ShopEZ</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#BBDEFB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  button: {
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    fontSize: 16,
    color: '#1976D2',
    textAlign: 'center',
  },
});

export default LoginScreen;