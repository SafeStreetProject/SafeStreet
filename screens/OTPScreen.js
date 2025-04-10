import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../services/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function OTPScreen({ navigation, route }) {
  const { email, mobile } = route.params || {};
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const context = useContext(AuthContext);
  
  const { login } = context || { login: () => console.error('AuthContext is not provided') };

  // Timer effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleVerifyOTP = async () => {
    if (!email || !mobile) {
      Alert.alert('Error', 'Missing email or mobile.');
      return;
    }

    try {
      const response = await axios.post('http://192.168.174.132:3000/api/verify-otp', { email, otp });
      if (response.data.message === 'OTP verified successfully') {
        await login(email, mobile);
        navigation.replace('Main', { userEmail: email, userMobile: mobile });
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to verify OTP');
    }
  };

  const handleResendOTP = async () => {
    if (!email || !mobile) {
      Alert.alert('Error', 'Missing email or mobile.');
      return;
    }

    setIsResending(true);
    try {
      const response = await axios.post('http://192.168.174.132:3000/api/send-otp', {
        email,
        mobile
      });

      if (response.data.success) {
        setTimer(60); // Reset timer
        setOtp(''); // Clear previous OTP
        Alert.alert('Success', 'A new OTP has been sent!');
      } else {
        Alert.alert('Error', response.data.error || 'Failed to resend OTP');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="lock-closed-outline" size={60} color="#4CAF50" style={styles.icon} />
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the OTP sent to {mobile || email}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          maxLength={6}
          placeholderTextColor="#999"
        />

        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={20} color="#666" />
          <Text style={styles.timerText}>
            {`00:${timer < 10 ? `0${timer}` : timer}`}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, timer === 0 && styles.disabledButton]} 
          onPress={handleVerifyOTP}
          disabled={timer === 0}
        >
          <Text style={styles.buttonText}>Verify OTP</Text>
        </TouchableOpacity>

        {timer === 0 && (
          <TouchableOpacity 
            onPress={handleResendOTP}
            disabled={isResending}
          >
            <Text style={[styles.resendText, isResending && styles.disabledText]}>
              {isResending ? 'Resending...' : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4c669f', // Base color from your gradient
    // To mimic gradient, you could use a single color or add nested Views with different background colors
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resendText: {
    color: '#4CAF50',
    fontSize: 16,
    marginTop: 15,
    fontWeight: '500',
  },
  disabledText: {
    color: '#999',
  },
});