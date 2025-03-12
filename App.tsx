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
import HomeScreen from './src/screens/HomeScreen';


function App(): React.JSX.Element {

  const backgroundStyle = {
    backgroundColor: "#404e00",
    flex: 1
  };

  return (
    <StrictMode>
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.app}>
        <GameScreen />
        {/* <HomeScreen /> */}
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
