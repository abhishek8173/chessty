import { Text, View } from 'react-native'
import React, {Dispatch, memo, SetStateAction, useEffect, useState} from 'react'
import Piece, {PieceKey} from '../components/Piece';
import { playMoveSound } from '../utils/sound';
import findValidMoves, { isKingCheck, isPieceWhite } from '../utils/validMoves';
import styles from '../utils/styles';

type GameBoardProps = {
    dimension: number,
    turn: boolean,
    changeTurn: Dispatch<SetStateAction<boolean>>
}

type boardBuilderReturn = {
    board: PieceKey[][],
    whiteKing: number[],
    blackKing: number[]
}


const default_FEN : string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function boardBuilder(fen: string): boardBuilderReturn {
    const board: PieceKey[][] = Array.from({ length: 8 }, () => Array(8).fill('-'));
    let w_k: number[] = [], b_k: number[]=[];
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
                if (char == 'k')
                    b_k = [r, file];
                if (char == 'K')
                    w_k = [r, file];
                file++;
            }
        }
        if (file !== 8) {
            throw new Error(`Invalid FEN: Row ${r + 1} has incorrect number of columns`);
        }
    }
    const resp: boardBuilderReturn = {
        "board": board,
        "whiteKing": w_k,
        "blackKing": b_k
    }
    return resp;
}


const GameBoard = ({dimension, turn, changeTurn}: GameBoardProps) =>{

    const squareSize = dimension==0 ? 1 : dimension/8;
    
    
    type renderSquareProps = {
        row: number,
        col: number
    }
    const fen: string = default_FEN.split(' ')[0];

    const {board, whiteKing, blackKing} = boardBuilder(fen);

    const [positions, setPositions] = useState(board);
    
    const [active, setActive] = useState<number[]>([]);
    const [prevMove, setPrevMove] = useState<number[][]>([]);
    const [check, setCheck] = useState<number[]>([]);
    const [isValidMove, setIsValidMove] = useState<Set<string>>(new Set<string>());
    const [enPassant, setenPassant] = useState<number[]>([]);
    const [wKing, setWKing] = useState<number[]>(whiteKing);
    const [bKing, setBKing] = useState<number[]>(blackKing);

    useEffect(()=>{
        if(active.length !=0) setIsValidMove(findValidMoves({positions, active, prevMove, whiteKing, blackKing}).isValidAndSafe);
    }, [active]);

    const renderSquare = ({row, col}: renderSquareProps) => {
        const sizeMultiple = 0.25;
        const textSize = (squareSize * sizeMultiple);

        const isDark = (row + col) % 2 === 1;
        const row_id = 8-row;
        const col_id = 97+col;

        const isActive = active.length!=0 && active[0] === row && active[1]===col;
        const isPrevMoveTo = prevMove.length==2 && ((prevMove[1][0] === row && prevMove[1][1] === col));
        const isPrevMoveFrom = (prevMove.length==2 && prevMove[0][0]===row && prevMove[0][1]===col);
        const isTargetPiece = (isValidMove.size!=0 && isValidMove.has(row+' '+col) && positions[row][col]!='-' && isPieceWhite(positions[row][col]) !== turn) || (enPassant.length!=0 && enPassant[0]==row && enPassant[1]==col);
        const isCheck = check.length!=0 && check[0]==row && check[1]==col;

        const bgColor = (isActive) ? '#fdc854' : isCheck ? '#d12f1d' : isTargetPiece ? '#ff6f08' : isPrevMoveTo ? '#5eb5fc' : isPrevMoveFrom? '#8bc9fc' : isDark ? '#769656' : '#eeeed2';

        const handleTouch = async () =>{
            if(active.length==0 && positions[row][col]!='-' as PieceKey && isPieceWhite(positions[row][col]) !== turn) return;
            if(active.length == 0 && positions[row][col]!='-' as PieceKey || (active.length!=0 && isPieceWhite(positions[row][col]) == isPieceWhite(positions[active[0]][active[1]]) && positions[row][col]!='-')){
                setActive([row, col]);
            }
            else if (active.length!=0 && !isActive && isValidMove.size!=0 && isValidMove.has(row+' '+col)){
                playMoveSound();
                setPrevMove([[active[0], active[1]], [row, col]]);
                setIsValidMove(new Set<string>());
                setPositions((prevPositions)=>{
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
            {isValidMove.size!=0 && isValidMove.has(row+' '+col) && !isTargetPiece ? <View style={{backgroundColor: '#5eff00', borderRadius: "50%", width: "40%", height: "40%"}}/> : null}
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