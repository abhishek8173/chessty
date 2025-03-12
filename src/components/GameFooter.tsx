import { View, Text } from "react-native"
import { GameFootProps } from "../@types/gamescreenTypes"
import styles from "../utils/styles"
import { memo } from "react"

const GameFooter = ({onLayoutChange}: GameFootProps) => {
    return (
        <View style = {styles.footer} onLayout={onLayoutChange}>
            <Text style={{width: '100%', fontSize: 60, color: '#fff', fontFamily: 'EmblemaOne-Regular', opacity: 0.5, textAlign: 'center', zIndex: 1}}>PASS n PLAY</Text>
        </View>
    )
}

export default memo(GameFooter);