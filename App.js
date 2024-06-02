import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import StackNavigator from './navigator/StackNavigator';

export default function App() {
  return (
      <View style={styles.container}>
        <StackNavigator />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
