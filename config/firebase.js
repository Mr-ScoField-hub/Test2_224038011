import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyCTyYkIL5HKCfLUldeC2WI8UAYFDRmL8tE",
  authDomain: "test2-60166.firebaseapp.com",
  databaseURL: "https://test2-60166-default-rtdb.firebaseio.com/",
  projectId: "test2-60166",
  storageBucket: "test2-60166.firebasestorage.app",
  messagingSenderId: "861977219949",
  appId: "1:861977219919:web:9ffe714ebbd710d0530064",
  measurementId: "G-LB21P5NNQK"
};


const app = initializeApp(firebaseConfig);


export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const database = getDatabase(app);

export default app;