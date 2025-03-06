import { Text, View } from 'react-native'
import React, {memo} from 'react'
import Piece, {PieceKey} from '../components/Piece';
import { isPieceWhite } from '../utils/validMoves';
import styles from '../utils/styles';
import { useMachine } from '@xstate/react';
import { gameMachine } from '../machines/gameMachine';

type GameBoardProps = {
    dimension: number
}

type renderSquareProps = {
    row: number,
    col: number
}

const GameBoardV2 = ({dimension}: GameBoardProps) =>{

    const squareSize = dimension==0 ? 1 : dimension/8;
    const [state, send] = useMachine(gameMachine);
    const isPassnPlay = true;

    const renderSquare = ({row, col}: renderSquareProps) => {


        const sizeMultiple = 0.25;
        const textSize = (squareSize * sizeMultiple);

        const {positions, validMoves, prevMove,
        active, whiteKing, blackKing, kingCheck,
        enPassant, isWhiteTurn} = state.context;

        const row_id = 8-row;
        const col_id = 97+col;

        const handleTouch = async () =>{
            if(active.length==0 && positions[row][col]!='-' as PieceKey && isPieceWhite(positions[row][col]) !== isWhiteTurn) return;
            if(active.length == 0 && positions[row][col]!='-' as PieceKey || (active.length!=0 && isPieceWhite(positions[row][col]) == isPieceWhite(positions[active[0]][active[1]]) && positions[row][col]!='-')){
                send({type: 'SELECT', data: {row, col}});
            }
            else if (active.length!=0 && !isActive && validMoves.size!=0 && validMoves.has(row+' '+col)){
                send({type: 'MOVE', data: {row, col}});
            }
        }

        const isActive = active.length!=0 && active[0] === row && active[1]===col;
        const isPrevMoveTo = prevMove.length==2 && ((prevMove[1][0] === row && prevMove[1][1] === col));
        const isPrevMoveFrom = (prevMove.length==2 && prevMove[0][0]===row && prevMove[0][1]===col);
        const isDark = (row + col) % 2 === 1;
        const isTargetPiece = (validMoves.size!=0 && validMoves.has(row+' '+col) && positions[row][col]!='-' && isPieceWhite(positions[row][col]) !== isWhiteTurn) 
        || (enPassant.length!=0 && enPassant[0]==row && enPassant[1]==col);
        const isCheck = (kingCheck && ((isWhiteTurn && row==whiteKing[0] && col==whiteKing[1]) || (!isWhiteTurn && row==blackKing[0] && col==blackKing[1])));

        const bgColor = (isActive) ? '#fdc854' : isCheck ? '#d12f1d' : isTargetPiece ? '#ff6f08' : isPrevMoveTo ? '#5eb5fc' : isPrevMoveFrom? '#8bc9fc' : isDark ? '#769656' : '#eeeed2';

        return(
            <View
                key={`${row}-${col}`}
                style = {{backgroundColor: bgColor, 
                    width: squareSize, height: squareSize, 
                    display: "flex", 
                    justifyContent: "center", alignItems: "center"}}
                onTouchStart={handleTouch}
            >
                {(col == 0) ?
                    <Text style = {{fontSize: textSize, 
                        position: "absolute", 
                        left: textSize*0.1, top: textSize*0.1, 
                        color: isDark ? '#eeeed2' : '#769656'}}
                    >
                        {row_id}
                    </Text> : null
                }

                {state.context.positions.length!=0 && state.context.positions[row][col]!='-' ? <Piece type={state.context.positions[row][col]} isPassnPlay={isPassnPlay}/> : null }

                {state.context.validMoves.size!=0 && state.context.validMoves.has(row+' '+col) && !isTargetPiece ? 
                    <View style={{backgroundColor: '#5eff00', 
                        borderRadius: "50%", width: "40%", height: "40%"}}/> 
                    : null
                }

                {(row==7) ? 
                    <Text style={{fontSize: textSize, 
                        position: "absolute", 
                        right: textSize*0.1, bottom: textSize*0.1, 
                        color: isDark ? '#eeeed2' : '#769656'}}
                    >
                        {String.fromCharCode(col_id)}
                    </Text> : null 
                }
            </View>
        )
    }
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

export default memo(GameBoardV2);