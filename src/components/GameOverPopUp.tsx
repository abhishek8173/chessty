import { View, Text } from "react-native"
import { GameOverPopUpProps } from "../@types/gamescreenTypes"
import styles from "../utils/styles"
import { memo } from "react"

const GameOverPopUp = ({reason, winner, onBack}: GameOverPopUpProps)=>{
    return (
        <View style={styles.popUpContainer}>
            <View style={{...styles.popUpBox, justifyContent: 'space-between', paddingTop: '10%'}}>
                <Text style={{fontSize: 45, textAlign: 'center', fontWeight: 800, color: '#fff'}}>GAME OVER</Text>
                <Text style={{...styles.resignConfirmationText, fontSize: 30}}>
                    {reason=='stalemate' ? 'Stale Mate' : 
                    reason=='resigned' ? `Winner: ${winner}\n\n${winner=='White'? 'Black' : 'White'} Resigned` : 
                    `Winner: ${winner}\n\nCheck Mate`} 
                </Text>
                <View style={{...styles.resignConfirmationCancelCta, height: "20%", bottom: 0}} onTouchStart={()=>{}}>
                        <Text style={styles.cancelCta}>BACK</Text>
                </View>
            </View>
        </View>
    )
}

export default memo(GameOverPopUp);