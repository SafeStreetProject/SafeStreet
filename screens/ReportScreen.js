import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Report Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});