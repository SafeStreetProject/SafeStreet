import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ResultDisplay({ result }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Analysis Result</Text>
      <Text>Type: {result.type}</Text>
      <Text>Severity: {result.severity}</Text>
      <Text>Priority: {result.priority}</Text>
      <Text>Summary: {result.summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
});