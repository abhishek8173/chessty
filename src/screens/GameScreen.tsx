import { View, LayoutChangeEvent } from 'react-native'
import React, { useCallback, useEffect, useState} from 'react'
import  {PieceKey} from '../components/Piece';
import styles from '../utils/styles';
import GameBoard from '../components/GameBoard';


const default_FEN : string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const boardBuilder = (fen: string): PieceKey[][] => {
    let startingBoard: PieceKey[][] = Array.from({ length: 8 }, () => Array(8).fill('-'));
    const pieceSet = new Set(['r', 'n', 'b', 'q', 'k', 'p', 'R', 'N', 'B', 'Q', 'K', 'P']);
    let i = 0;
    let j = 0;
    for (let char of fen){
        if(pieceSet.has(char)){
            startingBoard[i][j] = char as PieceKey;
        }else if(char != '/'){
            j+=Number(char);
        }else{
            i+=1;
            j=-1;
        }
        j+=1;
    }
    return startingBoard;
}



const GameScreen = () => {
    const fen: string = default_FEN.split(' ')[0];
    const [boardLayout, setBoardLayout] = useState(boardBuilder(fen));
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [childHeights, setChildHeights] = useState<number[]>([]);
    const [boardDimension, setBoardDimension] = useState(0);
    const [whiteTurn, setWhiteTurn] = useState(true); // true means white turn, false is black turn

    const onScreenLayout = useCallback((event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerSize({width, height});
    }, []);

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
            <GameHeader onLayoutChange={onChildLayout(0)}/>
            <PlayerOneInfo onLayoutChange={onChildLayout(1)}/>
            <GameBoard dimension={boardDimension} positions={boardLayout} onMove={setBoardLayout} turn={whiteTurn} changeTurn={setWhiteTurn}/>
            <PlayerOneInfo onLayoutChange={onChildLayout(2)}/>
            <GameFooter onLayoutChange={onChildLayout(3)}/>
        </View>
    )
}

type GameHeaderProps= {
    onLayoutChange: (event: LayoutChangeEvent) => void;
}

const GameHeader = ({onLayoutChange}: GameHeaderProps) => {
    return (
        <View style = {styles.header} onLayout={onLayoutChange}>

        </View>
    )
}

type GameFootProps= {
    onLayoutChange: (event: LayoutChangeEvent) => void;
}

const GameFooter = ({onLayoutChange}: GameFootProps) => {
    return (
        <View style = {styles.footer} onLayout={onLayoutChange}>

        </View>
    )
}

type PlayerInfoProps = {
    onLayoutChange: (event: LayoutChangeEvent) => void;
}

const PlayerOneInfo = ({onLayoutChange}: PlayerInfoProps) => {
    return(
        <View style={styles.playerInfo} onLayout={onLayoutChange}></View>
    )
}

export default GameScreen;