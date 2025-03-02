import { createMachine } from "xstate";
import { PieceKey } from "../components/Piece";
import validMoves, { isKingCheck, isPieceWhite } from "../utils/validMoves";
import findValidMoves from "../utils/validMoves";

enum GameMachineStates {
    IDLE = 'idle',
    CHECK_VALID_MOVES = 'checkValidMoves',
    MAKE_MOVE = 'makeMove',
    CHECKMATE = 'checkMate'
}

type GameMachineContext = {
    positions: PieceKey[][],
    validMoves: Set<string>,
    active: number[],
    whiteKing: number[],
    blackKing: number[],
    prevMove: number[][],
    kingCheck: boolean,
    enPassant: number[],
    row: number,
    col: number
}

type GameMachineEvents = {
    type: 'done.invoke.getValidMoves';
    data: {validMoves: Set<string>, enPassant: number[]};
} | {
    type: 'done.invoke.makeMove';
    data: {positions: PieceKey[][], prevMove: number[][], kingCheck: number[]};
} | {
    type: 'done.invoke.isKingCheck';
    data: {kingCheck: number[]};
} | {
    type: 'MOVE';
    data: {row: number, col: number};
} | {
    type: 'SELECT';
}

const defaultGameMachineContext: GameMachineContext = {
    positions: [],
    validMoves: new Set<string>(),
    active: [],
    whiteKing: [],
    blackKing: [],
    prevMove: [],
    kingCheck: false,
    enPassant: [],
    row: -1,
    col: -1

}

const gameMachine = createMachine<GameMachineContext, GameMachineEvents>(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwgBswBiAZQFEAZegYQBUBtABgF1FQADgHtYuAC64h+fiAAeiACwBWAMwkAnAHYVADgCMKruoBMehep0KANCACeiJTpJKDx4+rNKAbFx1LjAL4BNmhYeISk5FTUALIA8gBq9Nx8SCDCohJSMvIIxlx6JAo6FlyaXD5e6lrGNvZ5moUKKl46Kpo+7eUtQSEYOATEJDhgmADWCegU5DFCAG5w1BBSYGT4c0JjqzBik9MQswuwKTIZ4pLSabnG5hp6mu6+FsVexpp1iAC0Xpok+W4qdp6Ly6JTVXogUIDCIkDBbQ40ZaENYbLaw9Dw+ZgE5pM5ZS6gXI6LhqHQ3TSadReJRKBRcYwqD55BSFFoWAwlTQKB73CFQ8JDOFgBFLFYozarIUIjh6VKCETnbJXRDUtSUm7NEEMim1OyIPR6LgkFTGPwVB6Usp6ILBED4IQQOAyfmDIinBX4nJfLxMz56WkkcoAir5HR+Dp8-oCyKUMDuzIXL0IBS6+oGhR-DpKbTaWlmSNhV3DbCjCZTGZY+C4j2J5UIGlOf1+UwGyzuH16hCfW5Uw2A8rqZR6dS0gvQwUY4VY+OKglyRQjkheLxmBTNXQ1bRMhnqEhGEFt5TL7OBW0umEjcYxdBiOPVhNKwn6vQ3JfGJRcIwfgqaNrblfGgoIKUsoKguGSNoBEAA */
        initial: GameMachineStates.IDLE,
        context: { ...defaultGameMachineContext },
        states: {
            [GameMachineStates.IDLE]: {
                on: {
                    SELECT: GameMachineStates.CHECK_VALID_MOVES,
                    MOVE: GameMachineStates.MAKE_MOVE,
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
                            target: GameMachineStates.CHECKMATE,
                            cond: 'isCheckMate',
                            actions: 'setContext',
                        },
                        {
                            target: GameMachineStates.IDLE,
                            actions: 'setContext',
                        },
                    ],
                },
            },
            [GameMachineStates.CHECKMATE]: {
                type: 'final'
            }
        },
    },
    { 
        services: {
            checkValidMoves: async (
                context : GameMachineContext,
            ): Promise<{
                validMoves: Set<string>;
                enPassant: number[];
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
                positions: PieceKey[][];
                prevMove: number[][];
                kingCheck: boolean
            }> => {
                let {positions, prevMove, kingCheck, active, row, col, whiteKing, blackKing} = context;
                positions[row][col] = positions[active[0]][active[1]];
                positions[active[0]][active[1]] = '-';
                prevMove = [[active[0], active[1]], [row, col]];
                const [mx, my] = (isPieceWhite(positions[row][col])) ? blackKing : whiteKing;
                const [activeX, activeY] = active;
                kingCheck = isKingCheck({positions, mx, my, activeX, activeY});
                return {
                    positions,
                    prevMove,
                    kingCheck
                }
            }
        }
    }
)