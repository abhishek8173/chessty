import { assign, createMachine } from "xstate";
import { playMoveSound } from '../utils/sound';
import findValidMoves, { SquareTargeted, isPieceWhite, isCheckMate } from "../utils/validMoves";
import { PieceKey, PromotionPieces } from "../@types/gamescreenTypes";
import { MAX_MOVES_WITHOUT_CAPTURE } from "../utils/constants";

enum GameMachineStates {
    INITIALIZE = 'initialize',
    IDLE = 'idle',
    CHECK_VALID_MOVES = 'checkValidMoves',
    MAKE_MOVE = 'makeMove',
    PAWN_PROMOTION_INIT = 'pawnPromotionInit',
    PROMOTE_PAWN = 'promotePawn',
    CHECK_CHECKMATE_STALEMATE_TEST = 'checkCheckmateStalemateTest',
    CHECKMATE = 'checkMate',
    RESIGNED = 'resigned',
    STALEMATE = 'stalemate'
}

type castleDirection = 'k' | 'K' | 'q' | 'Q' | '-';

export type GameMachineContext = {
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
    checkMate: boolean,
    enPassant: number[],
    file: number,
    rank: number,
    numberOfMovesSinceLastCapture: number,
    pawnPromotion: number[],
    promotionPiece: PromotionPieces | '-'
}

export type GameMachineEvents = {
    type: 'done.invoke.initialize';
    data: {positions: PieceKey[][],  whiteKing: number[], blackKing: number[], isWhiteTurn: boolean, castlingRights: Set<castleDirection>, enPassant: number[]};
} | {
    type: 'done.invoke.getValidMoves';
    data: {validMoves: Set<string>, enPassant: number[]};
} | {
    type: 'done.invoke.promotePawn';
    data: {positions: PieceKey[][], pawnPromotion: number[], promotionPiece: PromotionPieces};
} | {
    type: 'done.invoke.makeMove';
    data: {positions: PieceKey[][], prevMove: number[][], active: number[], 
        capturedBlacks: Map<PieceKey, number>, capturedWhites: Map<PieceKey, number>,
        validMoves: Set<string>, enPassant: number[], whiteKing: number[], 
        blackKing: number[], numberOfMovesSinceLastCapture: number, pawnPromotion: number[]};
} | {
    type: 'done.invoke.checkThreatsAndGameContinuationTest';
    data: {kingCheck: boolean, checkMate: boolean, isWhiteTurn: boolean};
} | {
    type: 'MOVE';
    data: {row: number, col: number};
} | {
    type: 'SELECT';
    data : {row: number, col: number};
} | {
    type: 'SELECT_PROMOTION';
    data : {promotionPiece: PromotionPieces};
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
    checkMate: false,
    enPassant: [],
    file: -1,
    rank: -1,
    numberOfMovesSinceLastCapture: 0,
    pawnPromotion: [],
    promotionPiece: '-'

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
        /** @xstate-layout N4IgpgJg5mDOIC5QHECGBbMBZVBjAFgJYB2YAdCYQC6GoA2hAXmAMQQD2pFxAbuwNblKNekzABtAAwBdRKAAO7WNUKc5IAB6IATADZJAFjKTdAVgMBGUwE4A7AA5bk27YA0IAJ6ID1stusWAMwu9oGS9gY+BgC+0e5omDgEJEIQdKwAygCiADJZAMIAKlKySCCKyjRqZVoIerbaZA2mNrp22raB7l4IBqaN1oG6Fi6SI7oR1jFxIAnYeERchGmsWADyAGpZJeoVKtWgtdqWFmSmgSOOgfYjktbdiAC02oHGBhd259b61i+x8Rh5sklisWAAlLIZACSyAAcjsynsqsR1EdbFYyCMWucDPZrIZdF1PDoDLZMSN3kEDNoLNoxv9ZoCkotyAQwLh+BtRBAsOweHA2JwhLwBOQYFQuQweXy4AiFEp9iiajp7G0yIFAriLBZdLYzPZtA8EGFTH4+qEbN9+rZTAy5syUmR0KhBLz+YKliLBE6XdgZXLygrkajEBZLKbhn1CdrI20jY8rLpjJJzv5AnTrKrtPY7UyFo7na6ZR7hXxvYW-fzxBZSvLKqolYdQ2FXgZJENVaZdAZdHpDcTehifNZvg4LKEXoFc4l81x5KgAO7EAAKACd2Oh2MiocRqCxsnkigB9ZdgtbrQpQtbwmS7IMNkMIMPfM79STaOmdUwGtwD0lNAJSV1Uxx2GKcZntWdyHkddNyoMBl0XYgS24MtoNXOCEKQgMkQfZUn2-XwXDpcwIhefR7CNbN7CabMGg6CZAgCcCARnYFWXwdl+HyTiOWdeCMioegwH4sBCjgKgUJINCyDZDlCnwVcwFQKhYAAQWICA5nyTgaGIABXFSG3E2AqBw+8Dk0HQ7kaWwRw1bRv27C4jTbXwhkAujxyY7RpyBFlZN47igtEwThNEkzJI4T0ZLk-gFKUlT1M07TdJIQzkUi6ta0DetLNqCwR0kMhhmcRzCSmNoLCo4ZMUsa5qV1dF32mVj-MdOKeK40KhPSCKJJYDRTJU8hUAAM3g1cAApTEkSQAEoWEg9jAq4rq+JGsK+pGrLb0RCzGysp98TJQIQO1PQzFAo1zlNG5cW7X4ghpWw-IdLhOpCzbepEnaBqGoT4LIcbJpmubFuWgLPu677wr+0zsrvPLDoK-FTl0XUY3xF58VMI1eyMAIgnsQx0wxkxYhmYh2AgOB1EhlIkcVR9aRaMg2w7Mxu17Xt42OU0QhtFMe3CdNXogvMVuEWgGGYJng3wvRwnVEiU0KuwInjKwaI6RwWjuWaXltCW2IC5Z0nlvCmzqH4yHsA0Nb1Rr7gHByzgcI2Re1Jxxba96OK4yVljdOn9uRx9szZxw7Lm3sW2qv9+kxXs7PsEC8Uiaw3qgn0i35S38p0Cw5sxNPY-HHUUy178-AcG1ZusQ2ztaxlTcdeclzXDctwbHdqALlHQ1mslG8ML92ymTN42pEq9C7foLtaWwW4ZudYK3LClwHlmfBouwXE1YXhgxo0RlOHVi9xNsSezLOTfaj6gvW-gerh+DIu3-CdUsO3MxsC51Zhlcu2WiZh-6-GXpmbOK04o4Hgp-a2H5G7qjaJqSwURNQ3Q1MYR6tI9DpjCHfP2OclLKCgKQCACCjp0RovrJiBowgpjxgOMMNF7YNEMIVOiGpoEBWGtteBYdmaKzCDRIY-hszOCYnZX8PReyNAvtSFwy8uxQMpkAA */
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
                            target: GameMachineStates.PAWN_PROMOTION_INIT,
                            cond: 'isPawnPromotionPossible',
                            actions: 'setContext',
                        },
                        {
                            target: GameMachineStates.CHECK_CHECKMATE_STALEMATE_TEST,
                            actions: 'setContext',
                        },
                    ],
                },
                // after: {
                //     500: [
                //         {
                //             target: GameMachineStates.CHECKMATE,
                //             cond: 'isCheckMate',
                //         },
                //         {
                //             target: GameMachineStates.STALEMATE,
                //             cond: 'isStaleMate',
                //         },
                //     ],
                // },
            },
            [GameMachineStates.PAWN_PROMOTION_INIT]: {
                on: {
                    SELECT_PROMOTION: {
                        target: GameMachineStates.PROMOTE_PAWN,
                        actions: 'setContext',
                    }
                }
            },
            [GameMachineStates.PROMOTE_PAWN]: {
                invoke: {
                    id: 'prmotePawn',
                    src: 'promotePawn',
                    onDone: {
                        target: GameMachineStates.CHECK_CHECKMATE_STALEMATE_TEST,
                        actions: 'setContext',
                    }
                }
            },
            [GameMachineStates.CHECK_CHECKMATE_STALEMATE_TEST]: {
                invoke: {
                    id: 'checkThreatsAndGameContinuationTest',
                    src: 'checkThreatsAndGameContinuationTest',
                    onDone: [
                        {
                            target: GameMachineStates.IDLE,
                            cond: 'isGameNotOver',
                            actions: 'setContext',
                        },
                        {
                            actions: 'setContext',
                        },
                    ]

                },
                after: {
                    500: [
                        {
                            target: GameMachineStates.CHECKMATE,
                            cond: 'isCheckMate',
                        },
                        {
                            target: GameMachineStates.STALEMATE,
                            cond: 'isStaleMate',
                        },
                    ],
                }
            },
            [GameMachineStates.CHECKMATE]: {
                type: 'final'
            },
            [GameMachineStates.RESIGNED]: {
                type: 'final'
            },
            [GameMachineStates.STALEMATE]:{
                type: 'final'
            }
        },

        id: "GameMachine"
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
                console.log('validMoves');
                const {positions, active, prevMove, whiteKing, blackKing, isWhiteTurn, castlingRights} = context;
                const {isValidAndSafe, enPassant} = findValidMoves({positions, active, prevMove, whiteKing, blackKing, isWhiteTurn, castlingRights});
                return {
                    validMoves: isValidAndSafe,
                    enPassant
                }
            },
            makeMove: async (
                context : GameMachineContext,
                _
            ): Promise<{
                positions: PieceKey[][],
                prevMove: number[][],
                capturedBlacks: Map<PieceKey, number>,
                capturedWhites: Map<PieceKey, number>,
                validMoves: Set<String>,
                active: number[],
                whiteKing: number[],
                blackKing: number[],
                enPassant: number[],
                numberOfMovesSinceLastCapture: number,
                pawnPromotion: number[]
            }> => {
                console.log('makeMove');
                let {positions, prevMove, active, file, rank, whiteKing, blackKing, 
                    isWhiteTurn, capturedWhites, capturedBlacks, validMoves, enPassant, castlingRights, 
                    numberOfMovesSinceLastCapture, pawnPromotion} = context;
                
                const targetPiece = positions[file][rank];
                numberOfMovesSinceLastCapture++;
                const activePiece = positions[active[0]][active[1]];

                // Rmoving castling rights if King is moved
                if(activePiece=='K'){
                    castlingRights.delete('K');
                    castlingRights.delete('Q');
                }else if (activePiece=='k'){
                    castlingRights.delete('k');
                    castlingRights.delete('q');
                }

                // Removing castling rights for the direction where rook is moved
                if(activePiece=='R'){
                    if(active[1]==0) castlingRights.delete('Q');
                    else castlingRights.delete('K');
                }else if (activePiece=='r'){
                    if(active[1]==0) castlingRights.delete('q');
                    else castlingRights.delete('k');
                }

                // if moving enPassant
                if(enPassant.length!=0 && file==enPassant[0] && rank==enPassant[1]){
                    if(isWhiteTurn){
                        const currCount = capturedBlacks.get('p') ?? 0;
                        capturedBlacks.set(targetPiece, currCount+1);
                        numberOfMovesSinceLastCapture=0;
                        positions[enPassant[0]+1][enPassant[1]] = '-';
                    }else{
                        const currCount = capturedWhites.get('P') ?? 0;
                        capturedWhites.set(targetPiece, currCount+1);
                        numberOfMovesSinceLastCapture=0;
                        positions[enPassant[0]+1][enPassant[1]] = '-';
                    }
                    enPassant = [];
                }

                // capture update
                if(targetPiece != '-'){
                    if(isPieceWhite(targetPiece)){
                        const currCount = capturedWhites.get(targetPiece) ?? 0;
                        capturedWhites.set(targetPiece, currCount+1);
                        numberOfMovesSinceLastCapture=0;
                    }else{
                        const currCount = capturedBlacks.get(targetPiece) ?? 0;
                        capturedBlacks.set(targetPiece, currCount+1);
                        numberOfMovesSinceLastCapture=0;
                    }
                }
                
                // moving to new position
                positions[file][rank] = positions[active[0]][active[1]];
                positions[active[0]][active[1]] = '-'; //marking old position empty
                prevMove = [[active[0], active[1]], [file, rank]]; // updating prevMove

                // handling Castle
                if(positions[file][rank].toLocaleLowerCase()=='k'){
                    if(isWhiteTurn) whiteKing=[file, rank];
                    else blackKing=[file, rank];
                    if(Math.abs(active[1]-rank)===2){
                        if(rank===2){
                            positions[file][0]='-';
                            positions[file][3]=(isWhiteTurn)?'R':'r';
                        }else if (rank===6){
                            positions[file][7]='-';
                            positions[file][5]=(isWhiteTurn)?'R':'r';
                        }
                    }
                }

                // checking for pawn promotion
                if((file==7 || file==0) && positions[file][rank].toLocaleLowerCase()=='p') pawnPromotion=[file, rank];
                else pawnPromotion = [];

                validMoves.clear();
                active = [];
                playMoveSound();
                return {
                    positions,
                    prevMove,
                    capturedBlacks,
                    capturedWhites,
                    validMoves,
                    active,
                    blackKing,
                    whiteKing,
                    enPassant,
                    numberOfMovesSinceLastCapture,
                    pawnPromotion
                }
            },
            promotePawn: async (
                context: GameMachineContext
            ) : Promise<{
                positions: PieceKey[][],
                pawnPromotion: number[],
                promotionPiece: PromotionPieces
            }> => {
                console.log('pawnPromotion');
                let {positions, pawnPromotion, promotionPiece} = context;
                positions[pawnPromotion[0]][pawnPromotion[1]] = promotionPiece;
                promotionPiece='-' as PromotionPieces;
                pawnPromotion=[];
                return {
                    positions,
                    pawnPromotion,
                    promotionPiece
                }
            },
            checkThreatsAndGameContinuationTest: async (
                context: GameMachineContext
            ) : Promise<{
                kingCheck: boolean,
                checkMate: boolean,
                isWhiteTurn: boolean
            }> => {
                console.log('checkThreats');
                let {kingCheck, checkMate, positions, isWhiteTurn, whiteKing, blackKing, prevMove, castlingRights} = context;

                const [kx, ky] = (isWhiteTurn) ? blackKing : whiteKing;
                const threatsToKing = SquareTargeted({positions, isWhiteTurn, kx, ky});
                kingCheck = threatsToKing.length !=0;
                checkMate = isCheckMate({positions, isWhiteTurn, kx, ky, whiteKing, blackKing, prevMove, threatDirections: threatsToKing, castlingRights});

                return {
                    kingCheck,
                    checkMate,
                    isWhiteTurn: !isWhiteTurn
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
                    case 'SELECT_PROMOTION': {
                        context.promotionPiece = event.data.promotionPiece;
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
                        context.capturedBlacks = event.data.capturedBlacks;
                        context.capturedWhites = event.data.capturedWhites;
                        context.validMoves = event.data.validMoves;
                        context.active = event.data.active;
                        context.enPassant = event.data.enPassant;
                        context.blackKing = event.data.blackKing;
                        context.whiteKing = event.data.whiteKing;
                        context.numberOfMovesSinceLastCapture = event.data.numberOfMovesSinceLastCapture;
                        context.pawnPromotion = event.data.pawnPromotion;
                        return context;
                    }
                    case 'done.invoke.promotePawn': {
                        context.pawnPromotion = event.data.pawnPromotion;
                        context.positions = event.data.positions;
                        context.promotionPiece = event.data.promotionPiece;
                        return context;
                    }
                    case 'done.invoke.checkThreatsAndGameContinuationTest': {
                        context.checkMate = event.data.checkMate;
                        context.kingCheck = event.data.kingCheck;
                        context.isWhiteTurn = event.data.isWhiteTurn;
                        return context;
                    }
                }
                return context;
            })
        },
        guards: {
            isCheckMate: (context): boolean => {
                return context.checkMate;
            },
            isStaleMate: (context): boolean =>{
                return context.numberOfMovesSinceLastCapture >= MAX_MOVES_WITHOUT_CAPTURE;
            },
            isGameNotOver: (context, event): boolean => {
                if(event.type === 'done.invoke.checkThreatsAndGameContinuationTest'){
                    return !(context.numberOfMovesSinceLastCapture >= MAX_MOVES_WITHOUT_CAPTURE) && !event.data.checkMate;
                }
                return false;
            },
            isPawnPromotionPossible: (_,event): boolean => {
                if(event.type === 'done.invoke.makeMove'){
                    return event.data.pawnPromotion.length !=0;
                }
                return false;
            }
        }
    }
)