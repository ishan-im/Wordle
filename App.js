import React, {useState, useEffect} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';

import {colors, CLEAR, ENTER, colorsToEmoji} from './src/constants';

import Game from './src/components/Game/Game';

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>WORDLE</Text>

      <Game />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.black,
  },

  title: {
    color: colors.lightgrey,
    fontSize: 32,
    letterSpacing: 7,
    fontWeight: 'bold',
    marginTop: 20,
  },
  map: {
    alignSelf: 'stretch',
    height: 100,
    marginVertical: 20,
  },
});

export default App;
