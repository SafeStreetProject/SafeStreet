import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PotholeCard({ title, severity }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text>Severity: {severity}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 10, margin: 5, backgroundColor: '#e0e0e0', borderRadius: 5, width: 150 },
  title: { fontWeight: 'bold' },
});