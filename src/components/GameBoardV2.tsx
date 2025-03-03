import { Text, View } from 'react-native'
import React, {memo, useEffect} from 'react'
import Piece, {PieceKey} from '../components/Piece';
import { isPieceWhite } from '../utils/validMoves';
import styles from '../utils/styles';
import { useMachine } from '@xstate/react';
import { gameMachine } from '../machines/gameMachine';

type GameBoardProps = {
    dimension: number
}

const GameBoardV2 = ({dimension}: GameBoardProps) =>{

    const squareSize = dimension==0 ? 1 : dimension/8;
    const [state, send] = useMachine(gameMachine);
    
    
    type renderSquareProps = {
        row: number,
        col: number
    }

    // let positions: PieceKey[][] = [];
    // let validMoves: Set<String> = new Set<String>();
    // let prevMove: number[][] = [];
    // let active: number[] = [];
    // let whiteKing: number[] = [];
    // let blackKing: number[] = [];
    // let kingCheck: boolean = false;
    // let enPassant: number[] = [];
    // let isWhiteTurn: boolean = true;

    // useEffect(()=>{
    //     positions = state.context.positions;
    //     validMoves = state.context.validMoves;
    //     prevMove = state.context.prevMove;
    //     active = state.context.active;
    //     whiteKing = state.context.whiteKing;
    //     blackKing = state.context.blackKing;
    //     kingCheck = state.context.kingCheck;
    //     enPassant = state.context.enPassant;
    //     isWhiteTurn = state.context.isWhiteTurn;
    // }, [state]);

    // const {positions, validMoves, prevMove,
    //     active, whiteKing, blackKing, kingCheck,
    //     enPassant, isWhiteTurn} = state.context;

    // const [positions, setPositions] = useState(board);
    
    // const [active, setActive] = useState<number[]>([]);
    // const [prevMove, setPrevMove] = useState<number[][]>([]);
    // const [check, setCheck] = useState<number[]>([]);
    // const [isValidMove, setIsValidMove] = useState<Set<string>>(new Set<string>());
    // const [enPassant, setenPassant] = useState<number[]>([]);
    // const [wKing, setWKing] = useState<number[]>(whiteKing);
    // const [bKing, setBKing] = useState<number[]>(blackKing);

    // useEffect(()=>{
    //     if(active.length !=0) setIsValidMove(findValidMoves({positions, active, prevMove, whiteKing, blackKing}).isValidAndSafe);
    // }, [active]);

    // const renderSquare = ({row, col}: renderSquareProps) => {
    //     const sizeMultiple = 0.25;
    //     const textSize = (squareSize * sizeMultiple);

    //     const isDark = (row + col) % 2 === 1;
    //     const row_id = 8-row;
    //     const col_id = 97+col;

    //     const isActive = active.length!=0 && active[0] === row && active[1]===col;
    //     const isPrevMoveTo = prevMove.length==2 && ((prevMove[1][0] === row && prevMove[1][1] === col));
    //     const isPrevMoveFrom = (prevMove.length==2 && prevMove[0][0]===row && prevMove[0][1]===col);
    //     const isTargetPiece = (isValidMove.size!=0 && isValidMove.has(row+' '+col) && positions[row][col]!='-' && isPieceWhite(positions[row][col]) !== turn) || (enPassant.length!=0 && enPassant[0]==row && enPassant[1]==col);
    //     const isCheck = check.length!=0 && check[0]==row && check[1]==col;

    //     const bgColor = (isActive) ? '#fdc854' : isCheck ? '#d12f1d' : isTargetPiece ? '#ff6f08' : isPrevMoveTo ? '#5eb5fc' : isPrevMoveFrom? '#8bc9fc' : isDark ? '#769656' : '#eeeed2';

    //     const handleTouch = async () =>{
    //         if(active.length==0 && positions[row][col]!='-' as PieceKey && isPieceWhite(positions[row][col]) !== turn) return;
    //         if(active.length == 0 && positions[row][col]!='-' as PieceKey || (active.length!=0 && isPieceWhite(positions[row][col]) == isPieceWhite(positions[active[0]][active[1]]) && positions[row][col]!='-')){
    //             setActive([row, col]);
    //         }
    //         else if (active.length!=0 && !isActive && isValidMove.size!=0 && isValidMove.has(row+' '+col)){
    //             playMoveSound();
    //             setPrevMove([[active[0], active[1]], [row, col]]);
    //             setIsValidMove(new Set<string>());
    //             setPositions((prevPositions)=>{
    //                 const newPositions = prevPositions.map((row) => [...row]);

    //                 newPositions[row][col] = prevPositions[active[0]][active[1]];
    //                 newPositions[active[0]][active[1]] = '-';

    //                 return newPositions;
    //             })
    //             setActive([]);
    //             changeTurn(!turn);
    //         }
    //     }

    //     return (
    //       <View
    //         key={`${row}-${col}`}
    //         style={{ backgroundColor: bgColor, width: squareSize, height: squareSize, display: "flex", justifyContent: "center", alignItems: "center" }}
    //         onTouchStart={handleTouch}
    //       >
    //         {(col==0) ? 
    //             <Text style={{fontSize: textSize, position: "absolute", left: textSize*0.1, top: textSize*0.1, color: isDark ? '#eeeed2' : '#769656'}}>{row_id}</Text>
    //             : null 
    //         }
    //         {positions[row][col]!='-' ? <Piece type={positions[row][col]}/> : null}
    //         {isValidMove.size!=0 && isValidMove.has(row+' '+col) && !isTargetPiece ? <View style={{backgroundColor: '#5eff00', borderRadius: "50%", width: "40%", height: "40%"}}/> : null}
    //         {(row==7) ? 
    //             <Text style={{fontSize: textSize, position: "absolute", right: textSize*0.1, bottom: textSize*0.1, color: isDark ? '#eeeed2' : '#769656'}}>{String.fromCharCode(col_id)}</Text>
    //             : null 
    //         }
    //       </View>
    //     );
    // };

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

                {state.context.positions.length!=0 && state.context.positions[row][col]!='-' ? <Piece type={state.context.positions[row][col]}/> : null }

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