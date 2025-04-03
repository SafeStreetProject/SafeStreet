import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function HistoryScreen() {
  const historyData = [
    { id: '1', image: 'uri1', date: '2025-03-26', time: '10:00 AM' },
    { id: '2', image: 'uri2', date: '2025-03-25', time: '03:00 PM' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload History</Text>
      <FlatList
        data={historyData}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>Date: {item.date}</Text>
            <Text>Time: {item.time}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
});