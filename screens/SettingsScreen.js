import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { AuthContext } from '../services/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { logout } = React.useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    console.log('Logout button pressed');
    if (logout) {
      logout();
      console.log('Logout called from Settings');
    }
    navigation.replace('Login');
  };

  const handleRateUs = () => {
    console.log('Rate Us button pressed');
    // Future: Link to app store rating page
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings & Privacy</Text>
      <View style={styles.settingsList}>
        {/* Rate Us */}
        <TouchableOpacity style={styles.rateButton} onPress={handleRateUs}>
          <Text style={styles.rateButtonText}>⭐ Rate Us</Text>
          <Text style={styles.rateSubText}>Love the app? Let us know!</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionCard}>
          <Text style={styles.versionText}>App Version: 1.0.0</Text>
          <Text style={styles.versionSubText}>✨ Built with Love ✨</Text>
        </View>

        {/* Privacy Policy */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.optionText}>Privacy Policy</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Privacy Policy Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <Text style={styles.modalText}>
                This is a sample Privacy Policy. Your data is stored securely and used only to
                provide app functionality. We do not share your information with third parties
                without consent. For questions, contact support@example.com.
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F4F8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  settingsList: {
    flex: 1,
  },
  rateButton: {
    backgroundColor: '#FFCA28', // Bright yellow for attention
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  rateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  rateSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  versionCard: {
    backgroundColor: '#E8F5E9', // Light green for a fresh look
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  versionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
  },
  versionSubText: {
    fontSize: 12,
    color: '#388E3C',
    marginTop: 5,
  },
  optionCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#FF6F61',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});