import { View, LayoutChangeEvent, Text, Image } from 'react-native'
import React, { useCallback, useEffect, useState} from 'react'
import styles from '../utils/styles';
import GameBoardV2 from '../components/GameBoardV2';
import { useMachine } from '@xstate/react';
import { gameMachine } from '../machines/gameMachine';
import GameHeader from '../components/GameHeader';
import GameFooter from '../components/GameFooter';
import PlayerInfo from '../components/PlayerInfo';
import ResignConfirmation from '../components/ResignConfirmation';
import GameOverPopUp from '../components/GameOverPopUp';
import { pawnPromotionProps, PieceKey, PromotionPieces } from '../@types/gamescreenTypes';
import { pieces } from '../components/Piece';

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
        if(state.matches('checkMate')) setWinner(()=>{
            return state.context.isWhiteTurn ? 'White' : 'Black';
        })
        else if(state.matches('stalemate')) setWinner('STALEMATE');
    }, [state.value]);

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
            {(state.matches('checkMate') || state.matches('stalemate') || state.matches('resigned')) && <GameOverPopUp reason={state.value} winner={winner} onBack={()=>{}}/>}
            {state.matches('pawnPromotionInit') && <PawnPromotionPopUp isWhiteTurn={state.context.isWhiteTurn} sendEvent = {send}/>}
            <GameHeader onLayoutChange={onChildLayout(0)}/>
            <PlayerInfo onLayoutChange={onChildLayout(1)} playerNumber={2} isPassnPlay={isPassnPlay} handleWinner={setWinner} capturedPieces={state.context.capturedWhites}/>
            <GameBoardV2 dimension={boardDimension} sendEvent = {send} stateContext={state.context}/>
            <PlayerInfo onLayoutChange={onChildLayout(2)} playerNumber={1} isPassnPlay={isPassnPlay} handleWinner={setWinner} capturedPieces={state.context.capturedBlacks}/>
            <GameFooter onLayoutChange={onChildLayout(3)}/>
        </View>
    )
}

const PawnPromotionPopUp = ({isWhiteTurn, sendEvent}: pawnPromotionProps) =>{
    const propmotionOptions: PieceKey[] = (isWhiteTurn) ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
    return (
        <View style={styles.popUpContainer}>
            <View style={{...styles.popUpBox, justifyContent: 'space-between', paddingTop: '5%', width: '60%'}}>
                <Text style={{fontSize: 20, textAlign: 'center', fontWeight: 800, color: '#fff'}}>Select to promote</Text>
                <View style={{display: 'flex', flexWrap: 'wrap', width: '90%'}}>
                    {propmotionOptions.map((p)=>(
                        <View key={p} style={{display: 'flex', width: '50%', aspectRatio: 1, 
                        alignItems: 'center', justifyContent: 'center'}}
                        onTouchEnd={()=>sendEvent({type: 'SELECT_PROMOTION', data: {promotionPiece : p as PromotionPieces}})}>
                            <Image source={pieces[p].img} style={{width: "80%", height: "80%"}}/>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    )
}

export default GameScreen;