/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StrictMode } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';


import GameScreen from './src/screens/GameScreen';


function App(): React.JSX.Element {

  const backgroundStyle = {
    backgroundColor: "#ffeedd",
    flex: 1
  };

  return (
    <StrictMode>
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.app}>
        <GameScreen />
      </View>
    </SafeAreaView>
    </StrictMode>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "#ffeedd",
  },
});

export default App;
