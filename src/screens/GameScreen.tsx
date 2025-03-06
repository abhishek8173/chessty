import { View, LayoutChangeEvent, Image, Text } from 'react-native'
import React, { memo, useCallback, useEffect, useState} from 'react'
import styles from '../utils/styles';
import GameBoardV2 from '../components/GameBoardV2';
import { DefaultDps } from '../utils/DefaultDPs';
import { GameFootProps, GameHeaderProps, PlayerInfoProps, ResignConfirmProps } from '../@types/gamescreenTypes';
import { useMachine } from '@xstate/react';
import { gameMachine } from '../machines/gameMachine';

const dp_1 = DefaultDps[Math.floor(Math.random()*DefaultDps.length)];
const dp_2 = DefaultDps[Math.floor(Math.random()*DefaultDps.length)];

const GameScreen = () => {
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [childHeights, setChildHeights] = useState<number[]>([]);
    const [boardDimension, setBoardDimension] = useState(0);
    const [winner, setWinner] = useState<'White' | 'Black' | 'STALEMATE' | 'NONE'>('NONE');
    
    const [state, send] = useMachine(gameMachine);
    const isPassnPlay = true;

    const onScreenLayout = useCallback((event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerSize({width, height});
    }, []);

    useEffect(()=>{
        console.log('winner: '+winner);
    }, [winner]);

    const onChildLayout = (index: number) => (event: LayoutChangeEvent) => {
        const height = event.nativeEvent.layout.height;
        setChildHeights((prevHeights) => {
          const newHeights = [...prevHeights];
          newHeights[index] = height; // Store the height at the right index
          return newHeights;
        });
    };

    useEffect(()=>{
        const totalChildHeight = childHeights.reduce((sum, h) => sum + h, 0);
        const remainingHeight = containerSize.height - totalChildHeight;
        setBoardDimension(Math.min(containerSize.width*0.95, remainingHeight*0.95));
    }, [containerSize, childHeights]);

    return (
        <View style={styles.screen} onLayout={onScreenLayout}>
            {!state.matches('resigned') && winner!='NONE' && winner!='STALEMATE' && <ResignConfirmation sendEvent={send} handleWinner={setWinner}/>}
            <GameHeader onLayoutChange={onChildLayout(0)}/>
            <PlayerOneInfo onLayoutChange={onChildLayout(1)} playerNumber={2} isPassnPlay={isPassnPlay} handleWinner={setWinner}/>
            <GameBoardV2 dimension={boardDimension} sendEvent = {send} stateContext={state.context}/>
            <PlayerOneInfo onLayoutChange={onChildLayout(2)} playerNumber={1} isPassnPlay={isPassnPlay} handleWinner={setWinner}/>
            <GameFooter onLayoutChange={onChildLayout(3)}/>
        </View>
    )
}


const GameHeader = ({onLayoutChange}: GameHeaderProps) => {
    return (
        <View style = {styles.header} onLayout={onLayoutChange}>

        </View>
    )
}

const GameFooter = ({onLayoutChange}: GameFootProps) => {
    return (
        <View style = {styles.footer} onLayout={onLayoutChange}>

        </View>
    )
}

const PlayerOneInfo = memo(({onLayoutChange, playerNumber, isPassnPlay, handleWinner}: PlayerInfoProps) => {
    const rotation = !isPassnPlay ? '0deg' : playerNumber==1 ? '0deg' : '180deg';
    const dp = (playerNumber==1) ? dp_1 : dp_2;
    const handleResign = ()=>{
        const winner = playerNumber==1 ? 'Black' : 'White'; //winner is opposite of the one who resigned
        handleWinner(winner);
    }
    return(
        <View style={{...styles.playerInfo, transform: [{ rotate: rotation}]}} onLayout={onLayoutChange}>
            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 10}}>
                <View  style={{height: "100%", aspectRatio: 1, borderWidth: 2, borderRadius: '20%', borderColor: '#eeeed2', overflow: 'hidden'}} >
                    <Image source={dp} style={{width: '100%', height: '100%'}}/>
                </View>
                <View>
                    <Text style={{fontSize: 25, color: '#fff', fontWeight: '700'}}>
                        Player {playerNumber}
                    </Text>
                </View>
            </View>
            <View style={{height:'70%', aspectRatio: 2, borderWidth: 2, borderColor: '#eeeed2', borderRadius: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}} onTouchStart={handleResign}>
                <Text style={styles.resignText}>RESIGN</Text>
            </View>
        </View>
    )
})

const ResignConfirmation = ({sendEvent, handleWinner}: ResignConfirmProps) =>{
    const handleResign = () => {
        sendEvent({type: 'RESIGN'});
    }
    const handleCancel = () => {
        handleWinner('NONE');
    }
    return(
        <View style={styles.resignConfirmation}>
            <View style={styles.resignConfirmationPopUp}>

                <Text style={styles.resignConfirmationText}>
                    {`Are You Sure You Want To\nRESIGN??`}
                </Text>

                <View style={styles.resignConfirmationCtaContainer}>

                    <View style={styles.resignConfirmationResignCta} onTouchStart={handleResign}>
                        <Text style={styles.resignText}>RESIGN</Text>
                    </View>

                    <View style={styles.resignConfirmationCancelCta} onTouchStart={handleCancel}>
                        <Text style={styles.cancelCta}>CANCEL</Text>
                    </View>

                </View>

            </View>
        </View>
    )
}

export default GameScreen;