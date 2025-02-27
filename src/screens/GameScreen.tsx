import { View, LayoutChangeEvent } from 'react-native'
import React, { useCallback, useEffect, useState} from 'react'
import  {PieceKey} from '../components/Piece';
import styles from '../utils/styles';
import GameBoard from '../components/GameBoard';


const default_FEN : string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

type Board = PieceKey[][]

function boardBuilder(fen: string): Board {
    const board: Board = Array.from({ length: 8 }, () => Array(8).fill('-'));
    const [position] = fen.split(" ");
    const rows = position.split("/");
    
    if (rows.length !== 8) {
        throw new Error("Invalid FEN: Incorrect number of rows");
    }
    
    for (let r = 0; r < 8; r++) {
        let file = 0;
        for (const char of rows[r]) {
            if (!isNaN(Number(char))) {
                file += Number(char); // Empty squares
            } else {
                board[r][file] = char as PieceKey; // Piece character
                file++;
            }
        }
        if (file !== 8) {
            throw new Error(`Invalid FEN: Row ${r + 1} has incorrect number of columns`);
        }
    }
    return board;
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