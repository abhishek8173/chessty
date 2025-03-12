import { memo } from "react";
import { View, Image, Text } from "react-native";
import { PlayerInfoProps, PieceKey } from "../@types/gamescreenTypes";
import styles from "../utils/styles";
import { pieces } from "./Piece";
import { DefaultDps } from "../utils/DefaultDPs";


const dp_1 = DefaultDps[Math.floor(Math.random()*DefaultDps.length)];
const dp_2 = DefaultDps[Math.floor(Math.random()*DefaultDps.length)];

const PlayerInfo = memo(({onLayoutChange, playerNumber, isPassnPlay, handleWinner, capturedPieces}: PlayerInfoProps) => {
    const rotation = !isPassnPlay ? '0deg' : playerNumber==1 ? '0deg' : '180deg';
    const dp = (playerNumber==1) ? dp_1 : dp_2;

    const captured: PieceKey[] = [];

    capturedPieces.forEach((v,k)=>{
        let count = v;
        while(count>0){
            captured.push(k);
            count--;
        }
    })

    const handleResign = ()=>{
        const winner = playerNumber==1 ? 'Black' : 'White'; //winner is opposite of the one who resigned
        handleWinner(winner);
    }
    return(
        <View style={{...styles.playerInfo, transform: [{ rotate: rotation}]}} onLayout={onLayoutChange}>
            <View style={{display: 'flex', height:'100%', flexDirection: 'row', alignItems: 'flex-start', gap: 10}}>
                <View  style={{height: "100%", aspectRatio: 1, borderWidth: 2, borderRadius: '20%', borderColor: '#eeeed2', overflow: 'hidden'}} >
                    <Image source={dp} style={{width: '100%', height: '100%'}}/>
                </View>
                <View style={{display: 'flex', flexDirection: 'column', height: '80%', alignItems: 'flex-start'}}>
                    <Text style={{fontSize: 25, color: '#fff', fontWeight: '700'}}>
                        Player {playerNumber}
                    </Text>
                    <View style={{display: 'flex', flexDirection: 'row', height:"60%"}}>
                        {captured.map((capturedPiece, index)=>(
                            <View key={capturedPiece+index} style={{height: '100%', aspectRatio: 1, marginLeft: (index!=0)?"-25%": 0}}>
                                <Image source={pieces[capturedPiece].img} style={{height: '100%', aspectRatio: 1}}/>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
            <View style={{height:'70%', aspectRatio: 2, borderWidth: 2, borderColor: '#eeeed2', borderRadius: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}} onTouchStart={handleResign}>
                <Text style={styles.resignText}>RESIGN</Text>
            </View>
        </View>
    )
})

export default PlayerInfo;