import { PieceKey } from "../components/Piece"

type validMovesProps = {
    positions: PieceKey[][],
    active: number[]
}

type moveCheckProps = {
    positions: PieceKey[][],
    active: number[],
    isValid: boolean[][],
    pieceType: PieceKey
}

type pawnMoveProps = {
    positions: PieceKey[][],
    active: number[],
    isValid: boolean[][]
}

type moveLoopProps = {
    positions: PieceKey[][],
    active: number[],
    isValid: boolean[][],
    move: number[],
    loopDepth: number
}

export const isWhite=(piece: PieceKey): boolean=>{
    const pieceAscii = piece.charCodeAt(0);
    return pieceAscii>=65 && pieceAscii<=90;
}

const pawnMove = ({positions, active, isValid}: pawnMoveProps)=>{
    const activePiece = positions[active[0]][active[1]];

    if(isWhite(activePiece)){
        if(active[0]<=0) return;
        if(positions[active[0]-1][active[1]]=='-') isValid[active[0]-1][active[1]] = true;
        if(active[0]==6 && positions[active[0]-2][active[1]]=='-') isValid[active[0]-2][active[1]] = true;
        if(active[0]-1>=0 && active[1]-1>=0 && positions[active[0]-1][active[1]-1] !='-' && !isWhite(positions[active[0]-1][active[1]-1])) isValid[active[0]-1][active[1]-1] = true;
        if(active[0]-1>=0 && active[1]+1<=7 && positions[active[0]-1][active[1]+1] !='-' && !isWhite(positions[active[0]-1][active[1]+1])) isValid[active[0]-1][active[1]+1] = true;
    }else{
        if(active[0]>=7) return;
        if(positions[active[0]+1][active[1]]=='-') isValid[active[0]+1][active[1]] = true;
        if(active[0]==1 && positions[active[0]+2][active[1]]=='-') isValid[active[0]+2][active[1]] = true;
        if(active[0]+1<=7 && active[1]-1>=0 && positions[active[0]+1][active[1]-1] !='-' && isWhite(positions[active[0]+1][active[1]-1])) isValid[active[0]+1][active[1]-1] = true;
        if(active[0]+1<7 && active[1]+1<=7 && positions[active[0]+1][active[1]+1] !='-' && isWhite(positions[active[0]+1][active[1]+1])) isValid[active[0]+1][active[1]+1] = true;
    }
    return;
}

const knightMoves = ({positions, active, isValid}: moveCheckProps)=>{
    const isActiveWhite = isWhite(positions[active[0]][active[1]]);
    for(let i=-2; i<3; i++){
        for(let j=-2; j<3; j++){  
            if(i==0 || j==0 || Math.abs(i)==Math.abs(j) || active[0]+i<0 || active[1]+j<0 || active[0]+i>7 || active[1]+j>7) continue;
            const isPositionEmpty = positions[active[0]+i][active[1]+j] == '-' as PieceKey;
            const isTargetWhite = (isPositionEmpty) ? -1 : isWhite(positions[active[0]+i][active[1]+j]) ? 1 : 0;
            if(isPositionEmpty || (!!isActiveWhite !== !!(isTargetWhite==1))) isValid[active[0]+i][active[1]+j] = true;
        }
    }
}

const slidingMoves = ({positions, active, isValid, pieceType}: moveCheckProps)=>{
    const moves = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, -1], [1, 1], [-1, 1], [-1, -1]];
    const movesForPiece = (pieceType.toLocaleLowerCase() == 'q' || pieceType.toLocaleLowerCase()=='k') ? moves : (pieceType.toLocaleLowerCase()=='r') ? moves.slice(0, 4) : moves.slice(4, 8);
    const loopDepth = (pieceType.toLocaleLowerCase()=='k') ? 1 : 15;
    movesForPiece.forEach((move)=>loopOverMove({positions, active, isValid, move, loopDepth}));
}

const loopOverMove = ({positions, active, isValid, move, loopDepth}: moveLoopProps) => {
    const current = [active[0]+move[0], active[1]+move[1]];
    const isActiveWhite = isWhite(positions[active[0]][active[1]]);
     while(loopDepth>0 && current[0]>=0 && current[0]<8 && current[1]>=0 && current[1]<8){
        const isPositionEmpty = positions[current[0]][current[1]] == '-' as PieceKey;
        const isTargetWhite = (isPositionEmpty) ? -1 : isWhite(positions[current[0]][current[1]]) ? 1 : 0;
        isValid[current[0]][current[1]] = isPositionEmpty || (!!isActiveWhite !== !!(isTargetWhite==1));
        if (!isPositionEmpty) return;
        current[0]+=move[0];
        current[1]+=move[1];
        loopDepth-=1;
     }
}

const validMoves = (props: validMovesProps): boolean[][]=>{
    const {positions, active} = props;
    const isValid: boolean[][] = Array.from({ length: 8 }, () => Array(8).fill(false));
    const sliders = new Set(['k', 'q', 'r', 'b']);
    const pieceType = positions[active[0]][active[1]];
    if(sliders.has(pieceType.toLocaleLowerCase())){
        slidingMoves({positions, active, isValid, pieceType});
    }else if (pieceType.toLocaleLowerCase() == 'p'){
        pawnMove({positions, active, isValid});
    }else if (pieceType.toLocaleLowerCase() == 'n'){
        knightMoves({positions, active, isValid, pieceType});
    }
    return isValid;
}

export default validMoves;