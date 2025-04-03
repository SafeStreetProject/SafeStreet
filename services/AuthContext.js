import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
export const AuthContext = createContext();

// Create the provider
export const AuthProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(null);
  const [userMobile, setUserMobile] = useState(null);

  useEffect(() => {
    // Load the user email and mobile from AsyncStorage when the app starts
    const loadUserData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('userEmail');
        const storedMobile = await AsyncStorage.getItem('userMobile');
        console.log('Loaded userEmail from AsyncStorage:', storedEmail);
        console.log('Loaded userMobile from AsyncStorage:', storedMobile);
        if (storedEmail) {
          setUserEmail(storedEmail);
        }
        if (storedMobile) {
          setUserMobile(storedMobile);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  const login = async (email, mobile) => {
    console.log('Login function called with email:', email, 'and mobile:', mobile);
    if (!email || !mobile) {
      console.error('Login function received invalid email or mobile:', { email, mobile });
      return;
    }
    setUserEmail(email);
    setUserMobile(mobile);
    try {
      await AsyncStorage.multiSet([['userEmail', email], ['userMobile', mobile]]);
      console.log('User email saved to AsyncStorage:', email);
      console.log('User mobile saved to AsyncStorage:', mobile);
    } catch (error) {
      console.error('Error saving user data to AsyncStorage:', error);
    }
  };

  const logout = async () => {
    console.log('Logging out user:', userEmail);
    setUserEmail(null);
    setUserMobile(null);
    try {
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userMobile');
      console.log('User data removed from AsyncStorage');
    } catch (error) {
      console.error('Error removing user data from AsyncStorage:', error);
    }
  };

  console.log('Current userEmail in AuthContext:', userEmail);
  console.log('Current userMobile in AuthContext:', userMobile);

  return (
    <AuthContext.Provider value={{ userEmail, userMobile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};