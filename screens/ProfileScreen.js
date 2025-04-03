import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, Animated, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../services/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen({ navigation, route }) {
  const context = useContext(AuthContext);
  console.log('ProfileScreen - AuthContext:', context);

  const { userEmail: contextEmail, userMobile: contextMobile, logout } = context || {};
  const { userEmail: paramEmail, userMobile: paramMobile } = route.params || {};

  const userEmail = contextEmail || paramEmail;
  const userMobile = contextMobile || paramMobile;

  console.log('ProfileScreen - userEmail:', userEmail);
  console.log('ProfileScreen - userMobile:', userMobile);

  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [profilePicUri, setProfilePicUri] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchUser = async () => {
      if (!userEmail) {
        console.log('No user logged in - userEmail is null');
        setError('No user logged in.');
        return;
      }

      try {
        console.log('Fetching user with email:', userEmail);
        const response = await axios.get('http://192.168.10.132:3000/api/get-user', {
          params: { email: userEmail },
        });
        console.log('User fetched:', response.data);
        setUser(response.data);
        if (response.data.profilePicUrl) {
          setProfilePicUri(response.data.profilePicUrl);
        }
      } catch (error) {
        console.error('Error fetching user:', error.message);
        if (error.response) console.log('API error response:', error.response.data);
        setError('Failed to load user details. Please try again.');
      }
    };

    fetchUser();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [userEmail]);

  const handleLogout = () => {
    if (logout) {
      logout();
      console.log('Logout called');
    } else {
      console.log('Logout function unavailable');
    }
    navigation.replace('Login');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleProfilePicSelect = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need gallery permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      setProfilePicUri(selectedImage.uri);

      const formData = new FormData();
      formData.append('profilePic', {
        uri: selectedImage.uri,
        type: selectedImage.mimeType || 'image/jpeg', // Use mimeType if available, fallback to image/jpeg
        name: selectedImage.fileName || `profile-${Date.now()}.jpg`, // Ensure a unique name
      });
      formData.append('email', userEmail);

      try {
        console.log('Uploading profile picture for email:', userEmail);
        console.log('Selected image details:', selectedImage);
        const uploadResponse = await axios.post('http://192.168.10.132:3000/api/upload-profile-pic', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
        });
        console.log('Profile pic uploaded successfully:', uploadResponse.data);
        setUser((prev) => ({ ...prev, profilePicUrl: uploadResponse.data.profilePicUrl }));
      } catch (error) {
        console.error('Upload error:', error.message);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
          Alert.alert('Error', `Failed to save profile picture: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          console.error('No response received:', error.request);
          Alert.alert('Error', 'Failed to save profile picture: No response from server (Network Error)');
        } else {
          console.error('Error setting up request:', error.message);
          Alert.alert('Error', `Failed to save profile picture: ${error.message}`);
        }
      }
    }
  };

  const defaultProfilePic = 'https://via.placeholder.com/150/cccccc/969696?text=Profile';

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : user ? (
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={handleProfilePicSelect}>
            <Image
              source={{ uri: profilePicUri || user.profilePicUrl || defaultProfilePic }}
              style={styles.profileImage}
              onError={() => console.log('Error loading profile picture')}
            />
          </TouchableOpacity>
          <Text style={styles.name}>{user.name || 'User'}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Mobile:</Text>
            <Text style={styles.value}>{user.mobile || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Role:</Text>
            <Text style={styles.value}>{user.role || 'User'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Total Uploads:</Text>
            <Text style={styles.value}>{user.totalUploads || 0}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
              <Text style={styles.settingsButtonText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.loadingText}>Loading...</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileCard: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginVertical: 8,
    width: '100%',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF6F61',
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  settingsButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  settingsButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF6F61',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});