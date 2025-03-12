import { Text, View } from 'react-native'
import React, { Component } from 'react'
import styles from '../utils/styles'

export class HomeScreen extends Component {
  render() {
    return (
      <View style={styles.screen}>
        <Text>HomeScreen</Text>
      </View>
    )
  }
}

export default HomeScreen