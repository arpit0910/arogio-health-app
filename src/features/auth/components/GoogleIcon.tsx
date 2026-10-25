import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function GoogleIcon() {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.text}>G</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    fontFamily: 'System',
  },
});

