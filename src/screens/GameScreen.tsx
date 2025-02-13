import { StyleSheet, Text, View, LayoutChangeEvent } from 'react-native'
import React, {Dispatch, SetStateAction, useCallback, useEffect, useState} from 'react'
import Piece, {PieceKey} from '../components/Piece';
import { playMoveSound } from '../utils/sound';


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
            <GameBoard dimension={boardDimension} positions={boardLayout} onMove={setBoardLayout}/>
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
        <View style={styles.playerOneInfo} onLayout={onLayoutChange}></View>
    )
}

type GameBoardProps = {
    dimension: number,
    positions: PieceKey[][],
    onMove: Dispatch<SetStateAction<PieceKey[][]>>
}

const GameBoard = ({dimension, positions, onMove}: GameBoardProps) =>{

    const squareSize = dimension/8;
    type renderSquareProps = {
        row: number,
        col: number
    }
    
    const [active, setActive] = useState<number[]>([]);
    const [prevMove, setPrevMove] = useState<number[]>([]);
    const [check, setCheck] = useState<number[]>([]);

    const renderSquare = ({row, col}: renderSquareProps) => {
        const sizeMultiple = 0.25;
        const [textSize, setTextSize] = useState(0);

        useEffect(()=>{
            setTextSize(squareSize * sizeMultiple);
        }, [squareSize, sizeMultiple])

        const isDark = (row + col) % 2 === 1;
        const row_id = 8-row;
        const col_id = 97+col;

        const isActive = active[0] === row && active[1]===col;
        const isPrevMove = prevMove[0] === row && prevMove[1] === col;
        const isCheck = check[0] === row && check[1]===col;

        const bgColor = (isActive) ? '#fdc854' : isPrevMove ? '#5eb5fc' : isCheck ? '#ff3e0e' : isDark ? '#769656' : '#eeeed2';

        const handleTouch = () =>{
            if(active.length == 0) setActive([row, col]);
            else if (!isActive){
                playMoveSound();
                positions[row][col] = positions[active[0]][active[1]];
                positions[active[0]][active[1]] = '-';
                setActive([]);
                setPrevMove([row, col]);
            }
        }

        return (
          <View
            key={`${row}-${col}`}
            style={{ backgroundColor: bgColor, width: squareSize, height: squareSize, display: "flex" }}
            onTouchEnd={handleTouch}
          >
            {(col==0) ? 
                <Text style={{fontSize: textSize==0?10: textSize, position: "absolute", left: textSize*0.1, top: textSize*0.1, color: isDark ? '#eeeed2' : '#769656'}}>{row_id}</Text>
                : null 
            }
            {positions[row][col]!='-' ? <Piece type={positions[row][col]}/> : null}
            {(row==7) ? 
                <Text style={{fontSize: textSize==0?10: textSize, position: "absolute", right: textSize*0.1, bottom: textSize*0.1, color: isDark ? '#eeeed2' : '#769656'}}>{String.fromCharCode(col_id)}</Text>
                : null 
            }
          </View>
        );
    };
    return(
        <View style={[styles.gameBoard, { width: dimension, height: dimension }]}>
            {Array.from({ length: 8 }).map((_, row) => (
                <View key={row} style={styles.row}>
                    {Array.from({ length: 8 }).map((_, col) => renderSquare({row, col}))}
                </View>
            ))}
        </View>
    )
}

export default GameScreen

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor : "#404e00",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center"
    },
    header: {
        width: "100%",
        height: "7%",
        backgroundColor : "#bbffdd",
    },
    footer: {
        width: "100%",
        height: "15%",
        backgroundColor : "#bbffdd",
    },
    playerOneInfo: {
        width: "100%",
        height: "10%",
        backgroundColor: "#ddbbff",
    },
    boardContainer: {
        flex: 0.9,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#aabbff"
    },
    gameBoard: {
        backgroundColor: "#26619c",
        flexDirection: "column",
    },
    row: {
      flexDirection: 'row',
    }
})