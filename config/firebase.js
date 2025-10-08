import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyD8eCTqKIxWbA1v2olx4iVxEyFqpghmS4c",
  authDomain: "test2-52a21.firebaseapp.com",
  projectId: "test2-52a21",
  databaseURL: "https://test2-52a21-default-rtdb.firebaseio.com/",
  storageBucket: "test2-52a21.firebasestorage.app",
  messagingSenderId: "905791122411",
  appId: "1:905791122411:web:53e6cc04fa9b9db1e8c7ae",
  measurementId: "G-1ZSP14K9J3"
};



const app = initializeApp(firebaseConfig);


export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const database = getDatabase(app);

export default app;

