import { PieceKey, checkHitProps, kingCheckProps, nextMoveCheckProps, pawnMoveProps, moveCheckProps, moveLoopProps, checkMateProps, castleValidProps, findValidMovesProps, findValidReturn } from "../@types/gamescreenTypes";

const kingDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
const pawnsAndKnights = {
    pawn : {
        kingWhite : [[-1,1], [-1, -1]], //possible threat direction
        kingBlack : [[1, 1], [1, -1]]
    },
    knight : [
        [-2, -1], [-2, 1], [2, -1], [2, 1],
        [-1, -2], [-1, 2], [1, -2], [1, 2]
    ]
}



const isInBounds = (x: number, y: number) => x >= 0 && x < 8 && y >= 0 && y < 8;



export const isPieceWhite=(piece: PieceKey): boolean=>{
    return piece.toUpperCase()==piece;
}



const checkHit = ({positions, activeX, activeY, dx, dy, nx, ny, mx ,my, isWhite}: checkHitProps) : boolean => {
    while (isInBounds(nx, ny)) {
        if ((positions[nx][ny]!='-' && (nx != activeX || ny != activeY) && (isWhite == isPieceWhite(positions[nx][ny])) || (nx == mx && ny == my))) {
            return false;
        }
        else if (positions[nx][ny]!='-' && isWhite !== isPieceWhite(positions[nx][ny])) {
            const enemyPiece = positions[nx][ny].toLocaleLowerCase();
            const straightKillers = ['r', 'q'];
            const diagonalKillers = ['b', 'q'];
            if (dx * dy === 0 && straightKillers.includes(enemyPiece)) {
                return true;
            }
            else if (dx * dy !== 0 && diagonalKillers.includes(enemyPiece)) {
                return true;
            }else return false;
        }
        else if(positions[nx][ny]!='-' && isWhite === isPieceWhite(positions[nx][ny]) && (nx === mx && ny === my) && (nx != activeX || ny !== activeY)){
            return false;
        }
        nx+=dx;
        ny+=dy;
    }
    return false;
}



export const SquareTargeted = ({positions, isWhiteTurn, kx, ky}: kingCheckProps): number[][] =>{ //kx, ky of king's position
    const isKingWhite = !isWhiteTurn;
    const threatDirections = [];
    if(isKingWhite){
        pawnsAndKnights.pawn.kingWhite.forEach(([dx, dy])=>{
            let nx = kx+dx, ny= ky+dy;
            if(isInBounds(nx, ny) && positions[nx][ny]=='p') threatDirections.push([dx, dy]);
        })
        pawnsAndKnights.knight.forEach(([dx, dy])=>{
            let nx = kx+dx, ny= ky+dy;
            if(isInBounds(nx, ny) && positions[nx][ny]=='n') threatDirections.push([dx, dy]);
        })
    }else{
        pawnsAndKnights.pawn.kingBlack.forEach(([dx, dy])=>{
            let nx = kx+dx, ny= ky+dy;
            if(isInBounds(nx, ny) && positions[nx][ny]=='P') threatDirections.push([dx, dy]);
        })
        pawnsAndKnights.knight.forEach(([dx, dy])=>{
            let nx = kx+dx, ny= ky+dy;
            if(isInBounds(nx, ny) && positions[nx][ny]=='N') threatDirections.push([dx, dy]);
        })
    }
    for (const [dx, dy] of kingDirections) {
        let nx = kx + dx, ny = ky + dy;
        if(checkHit({positions, activeX: -1, activeY: -1, dx, dy, nx, ny, mx: -1, my: -1, isWhite: !isWhiteTurn})) threatDirections.push([dx, dy]);
    }
    return threatDirections;
}


const isPiecePinned = ({positions, mx, my, kx, ky, activeX, activeY}: nextMoveCheckProps) : boolean => {
    // Simplified check detection (expand with full check validation)
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
    const isWhite = isPieceWhite(positions[activeX][activeY]);
    for (let [dx, dy] of directions) {
        let nx = kx + dx, ny = ky + dy;
        if(checkHit({positions, activeX, activeY, dx, dy, nx, ny, mx, my, isWhite})) return true;
    }
    return false;
};

const pawnMove = ({positions, active, prevMove}: pawnMoveProps)=>{
    const isValid: Set<string> = new Set();
    const activePiece = positions[active[0]][active[1]];
    const prevMovedPiece = (prevMove.length!=0) ? positions[prevMove[1][0]][prevMove[1][1]] : '';
    let enPassant: number[] = [];

    if(isPieceWhite(activePiece)){
        if(active[0]<=0) return;
        if(positions[active[0]-1][active[1]]=='-') isValid.add((active[0]-1)+' '+active[1]);
        if(active[0]==6 && positions[active[0]-2][active[1]]=='-') isValid.add((active[0]-2)+' '+active[1]);

        //diagnal capture
        if(active[0]-1>=0 && active[1]-1>=0 && positions[active[0]-1][active[1]-1] !='-' && !isPieceWhite(positions[active[0]-1][active[1]-1])) isValid.add((active[0]-1)+' '+(active[1]-1));
        if(active[0]-1>=0 && active[1]+1<=7 && positions[active[0]-1][active[1]+1] !='-' && !isPieceWhite(positions[active[0]-1][active[1]+1])) isValid.add((active[0]-1)+' '+(active[1]+1));

        //en passant
        if(prevMove.length!=0 && prevMovedPiece=='p' && prevMove[1][0]-prevMove[0][0]==2 && prevMove[0][1]==active[1]-1 && prevMove[1][0]==active[0]) {
            isValid.add((active[0]-1)+' '+(active[1]-1));
            enPassant = [active[0]-1, active[1]-1];
        }
        if(prevMove.length!=0 && prevMovedPiece=='p' && prevMove[1][0]-prevMove[0][0]==2 && prevMove[0][1]==active[1]+1 && prevMove[1][0]==active[0]) {
            isValid.add((active[0]-1)+' '+(active[1]+1));
            enPassant = [active[0]-1, active[1]+1];
        }
    }else{
        if(active[0]>=7) return;
        if(positions[active[0]+1][active[1]]=='-') isValid.add((active[0]+1)+' '+active[1]);
        if(active[0]==1 && positions[active[0]+2][active[1]]=='-') isValid.add((active[0]+2)+' '+active[1]);

        //diagnal capture
        if(active[0]+1<=7 && active[1]-1>=0 && positions[active[0]+1][active[1]-1] !='-' && isPieceWhite(positions[active[0]+1][active[1]-1])) isValid.add((active[0]+1)+' '+(active[1]-1));
        if(active[0]+1<7 && active[1]+1<=7 && positions[active[0]+1][active[1]+1] !='-' && isPieceWhite(positions[active[0]+1][active[1]+1])) isValid.add((active[0]+1)+' '+(active[1]+1));

        //en passant
        if(prevMove.length!=0 && prevMovedPiece=='P' && prevMove[0][0]-prevMove[1][0]==2 && prevMove[0][1]==active[1]-1 && prevMove[1][0]==active[0]) {
            isValid.add((active[0]+1)+' '+(active[1]-1));
            enPassant = [active[0]+1, active[1]-1];
        }
        if(prevMove.length!=0 && prevMovedPiece=='P' && prevMove[0][0]-prevMove[1][0]==2 && prevMove[0][1]==active[1]+1 && prevMove[1][0]==active[0]) {
            isValid.add((active[0]+1)+' '+(active[1]+1));
            enPassant = [active[0]+1, active[1]+1];
        }
    }
    return {isValid, enPassant};
}



const knightMoves = ({positions, active, isValid}: moveCheckProps)=>{
    const isActiveWhite = isPieceWhite(positions[active[0]][active[1]]);
    for(let i=-2; i<3; i++){
        for(let j=-2; j<3; j++){  
            if(i==0 || j==0 || Math.abs(i)==Math.abs(j) || active[0]+i<0 || active[1]+j<0 || active[0]+i>7 || active[1]+j>7) continue;
            const isPositionEmpty = positions[active[0]+i][active[1]+j] == '-' as PieceKey;
            const isTargetWhite = (isPositionEmpty) ? -1 : isPieceWhite(positions[active[0]+i][active[1]+j]) ? 1 : 0;
            if(isPositionEmpty || (!!isActiveWhite !== !!(isTargetWhite==1))) isValid.add((active[0]+i)+' '+(active[1]+j));
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
    const isActiveWhite = isPieceWhite(positions[active[0]][active[1]]);
     while(loopDepth>0 && current[0]>=0 && current[0]<8 && current[1]>=0 && current[1]<8){
        const isPositionEmpty = positions[current[0]][current[1]] == '-' as PieceKey;
        const isTargetWhite = (isPositionEmpty) ? -1 : isPieceWhite(positions[current[0]][current[1]]) ? 1 : 0;
        if (isPositionEmpty || (!!isActiveWhite !== !!(isTargetWhite==1))) isValid.add((current[0])+' '+(current[1]));
        if (!isPositionEmpty) return;
        current[0]+=move[0];
        current[1]+=move[1];
        loopDepth-=1;
     }
}


export const isCheckMate = ({positions, isWhiteTurn, kx, ky, whiteKing, blackKing, prevMove, threatDirections, castlingRights}: checkMateProps): boolean => {

    const {isValidAndSafe: kingMoves} = findValidMoves({positions, active: [kx, ky], prevMove, whiteKing, blackKing, isWhiteTurn: !isWhiteTurn, castlingRights}); //valid moves for king

    if(kingMoves.size!=0 || threatDirections.length==0) return false; //if king has valid and safe moves then not check

    if(threatDirections.length > 1) return true; // if threat from more than one direction and king can't move, only one threat can be blocked or captured

    // can Block Or Capture the threat
    const dx = threatDirections[0][0] , dy=threatDirections[0][1];
    let nx = kx+dx, ny = ky+dy;
    while(isInBounds(nx, ny)){
        if(Math.abs(nx-kx)<=1 && Math.abs(ny-ky)<=1 && positions[nx][ny]!='-') return true;
        const isBlockable = SquareTargeted({positions, isWhiteTurn: !isWhiteTurn, kx: nx, ky: ny}).length != 0;
        if(isBlockable) return false;
        if(Math.abs(dx*dy)>1) return true;
        nx+=dx;
        ny+=dy;
    }
    return false;
}

const checkCastleSafety = ({positions, isWhiteTurn, kx, ky, dy, isValidAndSafe}: castleValidProps) => {
    let ny = ky+dy; //ky = kings column index
    let isCastleValid = true;
    while(isInBounds(kx, ny)) {
        const isSqaureSafe = (!(ny!=0 && ny!=7)) || positions[kx][ny]=='-' && (Math.abs(ky-ny)>=3 || SquareTargeted({positions, isWhiteTurn: !isWhiteTurn, kx, ky: ny}).length === 0);
        if(!isSqaureSafe){
            isCastleValid = false;
            break;
        }
        ny+=dy;
    }
    if( isCastleValid) isValidAndSafe.add(`${kx} ${ky+(dy*2)}`);
}

const validCastles = ({positions, isWhiteTurn, kx, ky, isValidAndSafe, castlingRights}: castleValidProps)=>{
    // is king check
    // castle directions = [0, 2], [0, -2]
    // isCastling allowed in given direction
    // are all the squares in castle directions safe
    // if all true, allow castling
    if(SquareTargeted({positions, isWhiteTurn: !isWhiteTurn, kx, ky}).length !== 0) return;
    castlingRights.forEach((direction)=>{
        if(isWhiteTurn){ // true is white turn
            const kingSideCastle = (direction=='K'), queenSideCastle = (direction=='Q');
            if(kingSideCastle){
                checkCastleSafety({positions, isWhiteTurn, kx, ky, dy: 1, isValidAndSafe, castlingRights});
            }
            if (queenSideCastle){
                checkCastleSafety({positions, isWhiteTurn, kx, ky, dy: -1, isValidAndSafe, castlingRights});
            }
        }else {
            const kingSideCastle =(direction=='k'), queenSideCastle = (direction=='q');
            if(kingSideCastle){
                checkCastleSafety({positions, isWhiteTurn, kx, ky, dy: 1, isValidAndSafe, castlingRights});
            }
            if (queenSideCastle){
                checkCastleSafety({positions, isWhiteTurn, kx, ky, dy: -1, isValidAndSafe, castlingRights});
            }
        }
    });
}



const findValidMoves = (props: findValidMovesProps): findValidReturn=>{
    const {positions, active, prevMove, whiteKing, blackKing, isWhiteTurn, castlingRights} = props;
    let isValid :Set<string> = new Set();
    const sliders = new Set(['k', 'q', 'r', 'b']);
    const pieceType = positions[active[0]][active[1]];
    let enPassant: number[] = [];
    if(sliders.has(pieceType.toLocaleLowerCase())){
        slidingMoves({positions, active, isValid, pieceType});
    }else if (pieceType.toLocaleLowerCase() == 'p'){
        const resp = pawnMove({positions, active, prevMove});
        isValid = resp?.isValid ?? new Set();
        enPassant = resp?.enPassant ?? [];

    }else if (pieceType.toLocaleLowerCase() == 'n'){
        knightMoves({positions, active, isValid, pieceType});
    }
    const isValidAndSafe = new Set<string>();
    for (let s of isValid){
        const m = s.split(' ');
        const mx = parseInt(m[0]), my=parseInt(m[1]);
        const activeX = active[0], activeY=active[1];
        const [kx, ky] = (isWhiteTurn) ? whiteKing : blackKing;
        if(pieceType.toLocaleLowerCase()=='k') {
            positions[activeX][activeY] = '-';
            const pieceAtmovePos = positions[mx][my];
            positions[mx][my] = pieceType;
            const kingCheck = SquareTargeted({positions, isWhiteTurn: !isWhiteTurn, kx: mx, ky: my}).length !== 0;
            if(!kingCheck) isValidAndSafe.add(s);
            positions[activeX][activeY] = pieceType;
            positions[mx][my] = pieceAtmovePos;
        } // not safe if new position open attack on own king     && !isKingThreat({positions, kx: mx, ky: my, activeX, activeY})
        else if(!isPiecePinned({positions, mx, my, kx, ky, activeX, activeY})) isValidAndSafe.add(s);
    }
    if(pieceType.toLocaleLowerCase()=='k'){
        const [kx, ky] = (isWhiteTurn) ? whiteKing : blackKing;
        validCastles({positions, isWhiteTurn, kx, ky, dy:0, isValidAndSafe, castlingRights});
    }
    return {isValidAndSafe, enPassant};
}



export default findValidMoves;