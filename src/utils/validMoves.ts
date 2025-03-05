import { PieceKey } from "../components/Piece"

type findValidMovesProps = {
    positions: PieceKey[][],
    active: number[],
    prevMove: number[][],
    whiteKing: number[],
    blackKing: number[],
    isWhiteTurn: boolean
}

type findValidReturn = {
    isValidAndSafe: Set<string>,
    enPassant: number[]
}

type moveCheckProps = {
    positions: PieceKey[][],
    active: number[],
    isValid: Set<string>,
    pieceType: PieceKey
}

type pawnMoveProps = {
    positions: PieceKey[][],
    active: number[],
    isValid: Set<string>,
    prevMove: number[][]
}

type moveLoopProps = {
    positions: PieceKey[][],
    active: number[],
    isValid: Set<string>,
    move: number[],
    loopDepth: number
}

type nextMoveCheckProps = {
    positions: PieceKey[][],
    mx: number,
    my: number,
    kx: number,
    ky: number,
    activeX: number,
    activeY: number,
    isWhiteTurn: boolean,
    fromMachine: boolean
}

type kingCheckProps = {
    positions: PieceKey[][],
    kx: number,
    ky: number,
    activeX: number,
    activeY: number,
    isWhiteTurn: boolean,
    fromMachine: boolean
}

type checkHitProps = {
    positions: PieceKey[][],
    activeX: number,
    activeY: number,
    dx: number,
    dy: number,
    nx: number,
    ny: number,
    mx: number,
    my: number,
    isWhite: boolean
}

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
        console.log (`checking hit at ${nx}, ${ny} for mx: ${mx}, my: ${my}, dx: ${dx}, dy: ${dy}, active: [${activeX}, ${activeY}], isWhite: ${isWhite}`);
        if ((positions[nx][ny]!='-' && (nx != activeX || ny != activeY) && (isWhite == isPieceWhite(positions[nx][ny])) || (nx == mx && ny == my))) {
            console.log(`broke loop with condition at ${nx}, ${ny} for mx: ${mx}, my: ${my}, dx: ${dx}, dy: ${dy}, active: [${activeX}, ${activeY}], isWhite: ${isWhite}`)
            return false;
        }
        else if (positions[nx][ny]!='-' && isWhite !== isPieceWhite(positions[nx][ny])) {
            const enemyPiece = positions[nx][ny].toLocaleLowerCase();
            const straightKillers = ['r', 'q'];
            const diagonalKillers = ['b', 'q'];
            if (dx * dy === 0 && straightKillers.includes(enemyPiece)) {
                console.log(`hitting ${positions[nx][ny]}`);
                return true;
            }
            else if (dx * dy !== 0 && diagonalKillers.includes(enemyPiece)) {
                console.log(`hitting ${positions[nx][ny]}`);
                return true;
            }else return false;
        }
        else if(positions[nx][ny]!='-' && isWhite === isPieceWhite(positions[nx][ny]) && (nx === mx && ny === my) && (nx != activeX || ny !== activeY)){
            console.log('ally piece');
            return false;
        }
        console.log('empty square');
        nx+=dx;
        ny+=dy;
    }
    return false;
}

// const isOppKingCheck = ({positions, mx, my, activeX, activeY}: nextMoveCheckProps) : boolean =>{

//     return false;
// }

export const isKingCheck = (positions: PieceKey[][], isWhiteTurn: boolean, kx: number, ky: number) =>{ //kx, ky os king's position
    const isKingWhite = !isWhiteTurn;

    let isCheckFromPawnOrKnight = false;
    if(isKingWhite){
        pawnsAndKnights.pawn.kingWhite.forEach(([dx, dy])=>{
            let nx = kx+dx, ny= ky+dy;
            if(isInBounds(nx, ny) && positions[nx][ny]=='p') {isCheckFromPawnOrKnight=true;
            }
        })
        pawnsAndKnights.knight.forEach(([dx, dy])=>{
            let nx = kx+dx, ny= ky+dy;
            if(isInBounds(nx, ny) && positions[nx][ny]=='n') isCheckFromPawnOrKnight=true;
        })
    }else{
        pawnsAndKnights.pawn.kingBlack.forEach(([dx, dy])=>{
            let nx = kx+dx, ny= ky+dy;
            if(isInBounds(nx, ny) && positions[nx][ny]=='P') isCheckFromPawnOrKnight=true;
        })
        pawnsAndKnights.knight.forEach(([dx, dy])=>{
            let nx = kx+dx, ny= ky+dy;
            if(isInBounds(nx, ny) && positions[nx][ny]=='N') isCheckFromPawnOrKnight=true;
        })
    }
    if(isCheckFromPawnOrKnight) return true;
    for (const [dx, dy] of kingDirections) {
        let nx = kx + dx, ny = ky + dy;
        if(checkHit({positions, activeX: -1, activeY: -1, dx, dy, nx, ny, mx: -1, my: -1, isWhite: !isWhiteTurn})) return true;
    }
    return false;
}

const isKingThreat = ({positions, kx, ky, activeX, activeY, isWhiteTurn, fromMachine}: kingCheckProps) : boolean => {
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
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
    const isWhite = (fromMachine) ? !isWhiteTurn: isPieceWhite(positions[activeX][activeY]);
    let isCheckFromPawnOrKnightAtNewPos = false;
    if(isWhite){
        pawnsAndKnights.pawn.kingWhite.forEach(([dx, dy])=>{
            let nx = kx+dx, ny= ky+dy;
            if(isInBounds(nx, ny) && positions[nx][ny]=='p') {isCheckFromPawnOrKnightAtNewPos=true;
            }
        })
        pawnsAndKnights.knight.forEach(([dx, dy])=>{
            let nx = kx+dx, ny= ky+dy;
            if(isInBounds(nx, ny) && positions[nx][ny]=='n') isCheckFromPawnOrKnightAtNewPos=true;
        })
    }else{
        pawnsAndKnights.pawn.kingBlack.forEach(([dx, dy])=>{
            let nx = kx+dx, ny= ky+dy;
            if(isInBounds(nx, ny) && positions[nx][ny]=='P') isCheckFromPawnOrKnightAtNewPos=true;
        })
        pawnsAndKnights.knight.forEach(([dx, dy])=>{
            let nx = kx+dx, ny= ky+dy;
            if(isInBounds(nx, ny) && positions[nx][ny]=='N') isCheckFromPawnOrKnightAtNewPos=true;
        })
    }
    if(isCheckFromPawnOrKnightAtNewPos) return true;
    for (const [dx, dy] of directions) {
        let nx = kx + dx, ny = ky + dy;
        if(checkHit({positions, activeX, activeY, dx, dy, nx, ny, mx: kx, my: ky, isWhite})) return true;
    }
    return false;
}

const isPiecePinned = ({positions, mx, my, kx, ky, activeX, activeY}: nextMoveCheckProps) : boolean => {
    // Simplified check detection (expand with full check validation)
    console.log(`new Piece active: ${positions[activeX][activeY]}`)
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
    const isWhite = isPieceWhite(positions[activeX][activeY]);
    for (let [dx, dy] of directions) {
        let nx = kx + dx, ny = ky + dy;
        if(checkHit({positions, activeX, activeY, dx, dy, nx, ny, mx, my, isWhite})) return true;
    }
    return false;
};

const pawnMove = ({positions, active, isValid, prevMove}: pawnMoveProps)=>{
    const activePiece = positions[active[0]][active[1]];
    const prevMovedPiece = (prevMove.length!=0) ? positions[prevMove[1][0]][prevMove[1][1]] : '';
    //console.log('last piece: '+prevMovedPiece);

    if(isPieceWhite(activePiece)){
        if(active[0]<=0) return;
        if(positions[active[0]-1][active[1]]=='-') isValid.add((active[0]-1)+' '+active[1]);
        if(active[0]==6 && positions[active[0]-2][active[1]]=='-') isValid.add((active[0]-2)+' '+active[1]);

        //diagnal capture
        if(active[0]-1>=0 && active[1]-1>=0 && positions[active[0]-1][active[1]-1] !='-' && !isPieceWhite(positions[active[0]-1][active[1]-1])) isValid.add((active[0]-1)+' '+(active[1]-1));
        if(active[0]-1>=0 && active[1]+1<=7 && positions[active[0]-1][active[1]+1] !='-' && !isPieceWhite(positions[active[0]-1][active[1]+1])) isValid.add((active[0]-1)+' '+(active[1]+1));

        //en passant
        if(prevMove.length!=0 && prevMovedPiece=='p' && prevMove[1][0]-prevMove[0][0]==2 && prevMove[0][1]==active[1]-1 && prevMove[1][0]==active[0]) isValid.add((active[0]-1)+' '+(active[1]-1));
        if(prevMove.length!=0 && prevMovedPiece=='p' && prevMove[1][0]-prevMove[0][0]==2 && prevMove[0][1]==active[1]+1 && prevMove[1][0]==active[0]) isValid.add((active[0]-1)+' '+(active[1]+1));
    }else{
        if(active[0]>=7) return;
        if(positions[active[0]+1][active[1]]=='-') isValid.add((active[0]+1)+' '+active[1]);
        if(active[0]==1 && positions[active[0]+2][active[1]]=='-') isValid.add((active[0]+2)+' '+active[1]);

        //diagnal capture
        if(active[0]+1<=7 && active[1]-1>=0 && positions[active[0]+1][active[1]-1] !='-' && isPieceWhite(positions[active[0]+1][active[1]-1])) isValid.add((active[0]+1)+' '+(active[1]-1));
        if(active[0]+1<7 && active[1]+1<=7 && positions[active[0]+1][active[1]+1] !='-' && isPieceWhite(positions[active[0]+1][active[1]+1])) isValid.add((active[0]+1)+' '+(active[1]+1));

        //en passant
        if(prevMove.length!=0 && prevMovedPiece=='P' && prevMove[0][0]-prevMove[1][0]==2 && prevMove[0][1]==active[1]-1 && prevMove[1][0]==active[0]) isValid.add((active[0]+1)+' '+(active[1]-1));
        if(prevMove.length!=0 && prevMovedPiece=='P' && prevMove[0][0]-prevMove[1][0]==2 && prevMove[0][1]==active[1]+1 && prevMove[1][0]==active[0]) isValid.add((active[0]+1)+' '+(active[1]+1));
    }
    return;
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

const findValidMoves = (props: findValidMovesProps): findValidReturn=>{
    const {positions, active, prevMove, whiteKing, blackKing, isWhiteTurn} = props;
    const isValid = new Set<string>();
    const sliders = new Set(['k', 'q', 'r', 'b']);
    const pieceType = positions[active[0]][active[1]];
    if(sliders.has(pieceType.toLocaleLowerCase())){
        slidingMoves({positions, active, isValid, pieceType});
    }else if (pieceType.toLocaleLowerCase() == 'p'){
        pawnMove({positions, active, isValid, prevMove});
    }else if (pieceType.toLocaleLowerCase() == 'n'){
        knightMoves({positions, active, isValid, pieceType});
    }
    const isValidAndSafe = new Set<string>();
    for (let s of isValid){
        const m = s.split(' ');
        const mx = parseInt(m[0]), my=parseInt(m[1]);
        const activeX = active[0], activeY=active[1];
        const [kx, ky] = (isWhiteTurn) ? whiteKing : blackKing;
        if(pieceType.toLocaleLowerCase()=='k' && !isKingThreat({positions, kx: mx, ky: my, activeX, activeY, isWhiteTurn, fromMachine: false})) isValidAndSafe.add(s); // not safe if new position open attack on own king
        else if(!isPiecePinned({positions, mx, my, kx, ky, activeX, activeY, isWhiteTurn, fromMachine: false})) isValidAndSafe.add(s);
    }
    const enPassant: number[] = [];
    return {isValidAndSafe, enPassant};
}

export default findValidMoves;