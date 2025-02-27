import { Text, View } from 'react-native'
import React, {Dispatch, memo, SetStateAction, useEffect, useState} from 'react'
import Piece, {PieceKey} from '../components/Piece';
import { playMoveSound } from '../utils/sound';
import validMoves, { isWhite } from '../utils/validMoves';
import styles from '../utils/styles';

type GameBoardProps = {
    dimension: number,
    positions: PieceKey[][],
    onMove: Dispatch<SetStateAction<PieceKey[][]>>,
    turn: boolean,
    changeTurn: Dispatch<SetStateAction<boolean>>
}

const GameBoard = ({dimension, positions, onMove, turn, changeTurn}: GameBoardProps) =>{

    const squareSize = dimension==0 ? 1 : dimension/8;
    type renderSquareProps = {
        row: number,
        col: number
    }
    
    const [active, setActive] = useState<number[]>([]);
    const [prevMove, setPrevMove] = useState<number[][]>([]);
    const [check, setCheck] = useState<number[]>([]);
    const [isValidMove, setIsValidMove] = useState<boolean[][]>([]);

    useEffect(()=>{
        if(active.length !=0) setIsValidMove(validMoves({positions, active, prevMove}));
    }, [active]);

    const renderSquare = ({row, col}: renderSquareProps) => {
        const sizeMultiple = 0.25;
        const textSize = (squareSize * sizeMultiple);

        const isDark = (row + col) % 2 === 1;
        const row_id = 8-row;
        const col_id = 97+col;

        const isActive = active.length!=0 && active[0] === row && active[1]===col;
        const isPrevMove = prevMove.length==2 && ((prevMove[1][0] === row && prevMove[1][1] === col) || (prevMove[0][0]===row && prevMove[0][1]===col));
        const isCheck = check[0] === row && check[1]===col;
        const isTargetPiece = isValidMove.length!=0 && isValidMove[row][col] && positions[row][col]!='-' && isWhite(positions[row][col]) !== turn;

        const bgColor = (isActive) ? '#fdc854' : isTargetPiece ? '#ff3e0e' : isPrevMove ? '#5eb5fc' : isDark ? '#769656' : '#eeeed2';

        const handleTouch = async () =>{
            if(active.length==0 && positions[row][col]!='-' as PieceKey && isWhite(positions[row][col]) !== turn) return;
            if(active.length == 0 && positions[row][col]!='-' as PieceKey || (active.length!=0 && isWhite(positions[row][col]) == isWhite(positions[active[0]][active[1]]) && positions[row][col]!='-')){
                setActive([row, col]);
            }
            else if (active.length!=0 && !isActive && isValidMove.length!=0 && isValidMove[row][col]){
                playMoveSound();
                setPrevMove([[active[0], active[1]], [row, col]]);
                setIsValidMove([]);
                onMove((prevPositions)=>{
                    const newPositions = prevPositions.map((row) => [...row]);

                    newPositions[row][col] = prevPositions[active[0]][active[1]];
                    newPositions[active[0]][active[1]] = '-';

                    return newPositions;
                })
                setActive([]);
                changeTurn(!turn);
            }
        }

        return (
          <View
            key={`${row}-${col}`}
            style={{ backgroundColor: bgColor, width: squareSize, height: squareSize, display: "flex", justifyContent: "center", alignItems: "center" }}
            onTouchStart={handleTouch}
          >
            {(col==0) ? 
                <Text style={{fontSize: textSize, position: "absolute", left: textSize*0.1, top: textSize*0.1, color: isDark ? '#eeeed2' : '#769656'}}>{row_id}</Text>
                : null 
            }
            {positions[row][col]!='-' ? <Piece type={positions[row][col]}/> : null}
            {isValidMove.length!=0 && isValidMove[row][col] && !isTargetPiece ? <View style={{backgroundColor: '#5eff00', borderRadius: "50%", width: "40%", height: "40%"}}/> : null}
            {(row==7) ? 
                <Text style={{fontSize: textSize, position: "absolute", right: textSize*0.1, bottom: textSize*0.1, color: isDark ? '#eeeed2' : '#769656'}}>{String.fromCharCode(col_id)}</Text>
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

export default memo(GameBoard);