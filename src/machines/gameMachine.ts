import { actions, assign, createMachine } from "xstate";
import { PieceKey } from "../components/Piece";
import findValidMoves, { isKingCheck, isPieceWhite } from "../utils/validMoves";

enum GameMachineStates {
    INITIALIZE = 'initialize',
    IDLE = 'idle',
    CHECK_VALID_MOVES = 'checkValidMoves',
    MAKE_MOVE = 'makeMove',
    CHECKMATE = 'checkMate',
    RESIGNED = 'resigned'
}

type castleDirection = 'k' | 'K' | 'q' | 'Q' | '-';

type GameMachineContext = {
    positions: PieceKey[][],
    castlingRights: Set<castleDirection>,
    capturedBlacks: Map<PieceKey, number>,
    capturedWhites: Map<PieceKey, number>,
    validMoves: Set<string>,
    active: number[],
    whiteKing: number[],
    blackKing: number[],
    prevMove: number[][],
    isWhiteTurn: boolean,
    kingCheck: boolean,
    enPassant: number[],
    file: number,
    rank: number
}

type GameMachineEvents = {
    type: 'done.invoke.initialize';
    data: {positions: PieceKey[][],  whiteKing: number[], blackKing: number[], isWhiteTurn: boolean, castlingRights: Set<castleDirection>, enPassant: number[]};
} |
{
    type: 'done.invoke.getValidMoves';
    data: {validMoves: Set<string>, enPassant: number[]};
} | {
    type: 'done.invoke.makeMove';
    data: {positions: PieceKey[][], prevMove: number[][], kingCheck: boolean, isWhiteTurn: boolean, active: number[],
        capturedBlacks: Map<PieceKey, number>, capturedWhites: Map<PieceKey, number>, validMoves: Set<string>};
} | {
    type: 'MOVE';
    data: {row: number, col: number};
} | {
    type: 'SELECT';
    data : {row: number, col: number};
} | {
    type: 'RESIGN';
}

const defaultGameMachineContext: GameMachineContext = {
    positions: [],
    castlingRights: new Set<castleDirection>,
    validMoves: new Set<string>(),
    capturedBlacks: new Map<PieceKey, number>(),
    capturedWhites: new Map<PieceKey, number>(),
    active: [],
    whiteKing: [],
    blackKing: [],
    prevMove: [],
    isWhiteTurn: true,
    kingCheck: false,
    enPassant: [],
    file: -1,
    rank: -1

}

type boardBuilderReturn = {
    positions: PieceKey[][],
    whiteKing: number[],
    blackKing: number[]
}

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
        "positions": board,
        "whiteKing": w_k,
        "blackKing": b_k
    }
    return resp;
}

export const gameMachine = createMachine<GameMachineContext, GameMachineEvents>(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgNwBdd0AbXALzAGIIB7Qs-AN1YGsxOlanUYBtAAwBdRKAAOrWEPYyQAD0QBaAIwlx4gBziALAHYAbPtMAmI2aNGArABoQAT01atV3Va0Oj4gCcJqZaZlqBAL6RLmhYeISkuBA0zADKAKIAMhkAwgAqEtJIIPKKVMol6giO4iQmgQDMXuKNDsb6Lu41JiSNhoaORsF2vtGxGDgExGQpzACyAPIAahlFKmVK+CrVVuI6RvqBhibiZmeBwVZdiFYmB40WjeatJqeP4yBxU4mzqUwAJQyaQAkgBxABy6xKmwq2yqiAiJFs+gcVjMl0CWn0Xis1zctyCJECVgcJj2gXae1O+k+3wSMxwYEwvGWtGS81YXDgLHYAgIPH4JBgFDZdAgnO5sGhcgUWx2iL8JAcgX2ljM5kOjXx3Q0d10zxM2qMbSOzzCdMmDNIGH4kuYbA4Ar4AltYHtMtKcrhCoQhkaJH0NjegTMDn84isjRuCBsOkexy0-WC1i0Jkt8WmNvQdq5Dr5nEFrpz7rzoi0xVl5VwlVA1TDAYaNhNZm1hp1irq2tRZ3JDXE92iMRA+FYEDgKnpWY23pr8LrmiNyMc-gijXXDn0jxjGmagRIZijIQC-bJRgzPxm5Co7MYM+rtbUmlJy-DRjXG63DjMO6j3i8zz2HsQT6G857DlOvzJKk97ygiNQdggnhGCQdxhkaRqruBEyZr8TIsmKHJ5vAMKzo+1RogGaZBHooZ6OEnQEgg2j+MSUZHO+ljhv4tIQVaWYkG69qwT68HDA4B7hPYJrJn20ZMVG+5BK2lg2N+6FWBe1okPhvDzOgFBgCJc6+p4NgHqStHtPsJhbjG6LxrYzyBI4bTYppfG4TMABOcC4FAhAQMZ5EeK+DjPOEWKNAOtjOExjQmiQWjDEaninHi-RDpEQA */
        initial: GameMachineStates.INITIALIZE,
        context: { ...defaultGameMachineContext },
        states: {
            [GameMachineStates.INITIALIZE]: {
                invoke: {
                    id: 'initialize',
                    src: 'initialize',
                    onDone: [
                        {
                            target: GameMachineStates.IDLE,
                            actions: 'setContext',
                        },
                    ],
                },
            },
            [GameMachineStates.IDLE]: {
                on: {
                    SELECT: {
                        target: GameMachineStates.CHECK_VALID_MOVES,
                        actions: 'setContext',
                    },
                    MOVE: {
                        target: GameMachineStates.MAKE_MOVE,
                        actions: 'setContext',
                    },
                    RESIGN: GameMachineStates.RESIGNED,
                },
            },
            [GameMachineStates.CHECK_VALID_MOVES]: {
                invoke: {
                    id: 'getValidMoves',
                    src: 'checkValidMoves',
                    onDone: [
                        {
                            target: GameMachineStates.IDLE,
                            actions: 'setContext',
                        },
                    ],
                },
            },
            [GameMachineStates.MAKE_MOVE]: {
                invoke: {
                    id: 'makeMove',
                    src: 'makeMove',
                    onDone: [
                        {
                            target: GameMachineStates.IDLE,
                            //cond: 'isCheckMate',
                            actions: 'setContext',
                        },
                        // {
                        //     target: GameMachineStates.IDLE,
                        //     actions: 'setContext',
                        // },
                    ],
                },
            },
            [GameMachineStates.CHECKMATE]: {
                type: 'final'
            },
            [GameMachineStates.RESIGNED]: {
                type: 'final'
            }
        },
    },
    { 
        services: {
            initialize: async (): Promise<{
                positions: PieceKey[][],
                whiteKing: number[],
                blackKing: number[],
                isWhiteTurn: boolean,
                castlingRights: Set<castleDirection>,
                enPassant: number[]
            }> => {
                const fen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
                const fenData = fen.split(' ');
                const {positions, whiteKing, blackKing}= boardBuilder(fenData[0]);
                const isWhiteTurn = fenData[1]=='w';
                const castleDirection: castleDirection[] = fenData[2].split('') as castleDirection[];
                const castlingRights = new Set<castleDirection>(castleDirection);
                const enPassant: number[] = (fenData[3]=='-') ? [] :  [fenData[3].charCodeAt(0) - 97, 7-parseInt(fenData[3].charAt(1))];
                
                return {
                    positions,
                    whiteKing,
                    blackKing,
                    isWhiteTurn,
                    castlingRights,
                    enPassant
                }


            },
            checkValidMoves: async (
                context : GameMachineContext,
            ): Promise<{
                validMoves: Set<string>,
                enPassant: number[]
            }> => {
                const {positions, active, prevMove, whiteKing, blackKing} = context;
                const {isValidAndSafe, enPassant} = findValidMoves({positions, active, prevMove, whiteKing, blackKing});
                return {
                    validMoves: isValidAndSafe,
                    enPassant
                }
            },
            makeMove: async (
                context : GameMachineContext,
                event: GameMachineEvents
            ): Promise<{
                positions: PieceKey[][],
                prevMove: number[][],
                kingCheck: boolean,
                isWhiteTurn: boolean,
                capturedBlacks: Map<PieceKey, number>,
                capturedWhites: Map<PieceKey, number>,
                validMoves: Set<String>,
                active: number[]
            }> => {
                let {positions, prevMove, kingCheck, active, file, rank, whiteKing, blackKing, isWhiteTurn, capturedWhites, capturedBlacks, validMoves} = context;
                const targetPiece = positions[file][rank];
                if(targetPiece != '-'){
                    if(isPieceWhite(targetPiece)){
                        const currCount = capturedWhites.get(targetPiece) ?? 0;
                        capturedWhites.set(targetPiece, currCount+1);
                    }else{
                        const currCount = capturedBlacks.get(targetPiece) ?? 0;
                        capturedBlacks.set(targetPiece, currCount+1);
                    }
                }
                positions[file][rank] = positions[active[0]][active[1]];
                positions[active[0]][active[1]] = '-';
                prevMove = [[active[0], active[1]], [file, rank]];
                const [mx, my] = (isPieceWhite(positions[file][rank])) ? blackKing : whiteKing;
                const [activeX, activeY] = [file, rank];
                kingCheck = isKingCheck({positions, mx, my, activeX, activeY});
                validMoves.clear();
                active = [];
                return {
                    positions,
                    prevMove,
                    kingCheck,
                    isWhiteTurn: !isWhiteTurn,
                    capturedBlacks,
                    capturedWhites,
                    validMoves,
                    active
                }
            }
        },
        actions: {
            setContext: assign((context, event) =>{
                switch (event.type){
                    case 'done.invoke.initialize': {
                        const {
                            positions,
                            whiteKing,
                            blackKing,
                            isWhiteTurn,
                            castlingRights,
                            enPassant
                        } = event.data;

                        context.positions = positions;
                        context.whiteKing = whiteKing;
                        context.blackKing = blackKing;
                        context.isWhiteTurn = isWhiteTurn;
                        context.castlingRights = castlingRights;
                        context.enPassant = enPassant;

                        return context;
                    }
                    case 'SELECT': {
                        context.active = [event.data.row, event.data.col];
                        return context;
                    }
                    case 'done.invoke.getValidMoves': {
                        context.validMoves = event.data.validMoves;
                        context.enPassant = event.data.enPassant;
                        return context;
                    }
                    case 'MOVE': {
                        context.file = event.data.row;
                        context.rank = event.data.col;
                        return context;
                    }
                    case 'done.invoke.makeMove': {
                        context.positions = event.data.positions;
                        context.prevMove = event.data.prevMove;
                        context.kingCheck = event.data.kingCheck;
                        context.isWhiteTurn = event.data.isWhiteTurn;
                        context.capturedBlacks = event.data.capturedBlacks;
                        context.capturedWhites = event.data.capturedWhites;
                        context.validMoves = event.data.validMoves;
                        context.active = event.data.active;
                        return context;
                    }
                }
                return context;
            })
        }
    }
)