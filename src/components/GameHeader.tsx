import React, { memo } from "react"
import { View, Text } from "react-native"
import { GameHeaderProps } from "../@types/gamescreenTypes"
import styles from "../utils/styles"
import Icon from 'react-native-vector-icons/MaterialIcons'


const GameHeader = ({onLayoutChange}: GameHeaderProps) => {
    return (
        <View style = {styles.header} onLayout={onLayoutChange}>
            <View style={{height: "90%", aspectRatio: 1, borderColor: "#eeeed2", borderWidth: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: '20%', zIndex: 2}}>
                <Icon name='arrow-back-ios' size={30} color='#fff'/>
            </View>
            <Text style={{width: '100%', fontSize: 35, color: '#fff', fontFamily: 'EmblemaOne-Regular', opacity: 0.5, position: 'absolute', textAlign: 'center', zIndex: 1}}>CHESSTY</Text>
        </View>
    )
}

export default memo(GameHeader);