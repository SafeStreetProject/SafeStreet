import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker'; // Replace react-native-image-picker
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';
import * as Animatable from 'react-native-animatable';
import { AuthContext } from '../services/AuthContext';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { userEmail } = useContext(AuthContext) || { userEmail: null };
  console.log('HomeScreen - userEmail:', userEmail);

  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(-50))[0];

  useEffect(() => {
    // Fetch uploaded photos
    const fetchPhotos = async () => {
      try {
        const response = await axios.get('http://192.168.10.132:3000/api/get-photos');
        setPhotos(response.data);
      } catch (error) {
        console.error('Error fetching photos:', error.message);
      }
    };

    fetchPhotos();

    // Request location permission and set example location
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        try {
          const { status } = await ImagePicker.requestCameraPermissionsAsync(); // Camera permission for location tagging
          if (status === 'granted') {
            setLocation({ latitude: 17.385044, longitude: 78.486671 }); // Example: Hyderabad
          }
        } catch (err) {
          console.warn('Location permission error:', err);
        }
      }
    };

    requestLocationPermission();

    // Animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.warn('Camera permission error:', err);
      return false;
    }
  };

  const handleUploadPhoto = async () => {
    if (!userEmail) {
      Alert.alert('Error', 'No user logged in. Please log in to upload photos.');
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Error', 'Camera permission denied');
      return;
    }

    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    };

    try {
      const result = await ImagePicker.launchCameraAsync(options);
      if (result.canceled) {
        Alert.alert('Info', 'Camera operation cancelled');
      } else if (result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        const formData = new FormData();
        formData.append('photo', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || 'photo.jpg',
        });
        formData.append('userEmail', userEmail);
        formData.append('latitude', location?.latitude || 0);
        formData.append('longitude', location?.longitude || 0);

        setUploading(true);
        try {
          const uploadResponse = await axios.post('http://192.168.10.132:3000/api/upload-photo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          Alert.alert('Success', 'Photo uploaded successfully');
          const response = await axios.get('http://192.168.10.132:3000/api/get-photos');
          setPhotos(response.data);
        } catch (error) {
          Alert.alert('Error', 'Failed to upload photo: ' + (error.response?.data?.error || error.message));
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to launch camera: ' + error.message);
    }
  };

  const handleShareApp = () => {
    console.log('Share App button pressed');
    Alert.alert('Thanks!', 'Share this app with your friends: SafeStreet rocks!');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.appName}>SafeStreet</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Icon name="person" size={30} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>

        <Animatable.Text animation="fadeInDown" style={styles.welcomeText}>
          Welcome to SafeStreet
        </Animatable.Text>

        <Animated.View style={[styles.buttonContainer, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.uploadButton]}
            onPress={handleUploadPhoto}
            disabled={uploading}
          >
            <Icon name="camera-alt" size={24} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>{uploading ? 'Uploading...' : 'Upload Photo'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShareApp}
          >
            <Icon name="share" size={24} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Share App</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animatable.View animation="fadeInUp" style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Tip</Text>
          <Text style={styles.tipText}>
            📸 Use natural light for stunning street shots! Aim for golden hour (sunrise/sunset) to make your photos pop.
          </Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Locations</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 17.385044, // Example: Hyderabad
              longitude: 78.486671,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {photos.map((photo, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: photo.latitude,
                  longitude: photo.longitude,
                }}
                title={`Uploaded on ${new Date(photo.uploadDate).toLocaleDateString()}`}
                description={`By ${photo.userEmail}`}
              >
                <Icon name="location-pin" size={30} color="#FF6F61" />
              </Marker>
            ))}
          </MapView>
        </Animatable.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  appName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#333',
    marginVertical: 20,
    marginHorizontal: 20,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  uploadButton: {
    backgroundColor: '#2196F3',
  },
  shareButton: {
    backgroundColor: '#FFCA28',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  map: {
    height: 300,
    borderRadius: 10,
  },
});