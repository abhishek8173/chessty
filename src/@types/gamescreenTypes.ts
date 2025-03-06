import { Image, ImageSourcePropType, LayoutChangeEvent } from "react-native";
import { GameMachineContext, GameMachineEvents } from "../machines/gameMachine";

export type PieceKey = 'k' | 'q' | 'b' | 'n' | 'r' | 'p' | 'K' | 'Q' | 'B' | 'N' | 'R' | 'P' | '-';


export type Piece = {
  img: any;
  weight: number
};

export type Pieces = Record<PieceKey, Piece>;


export type PieceProps={
  type : PieceKey;
  isPassnPlay: boolean
}

export type GameBoardProps = {
    dimension: number,
    sendEvent: (event :GameMachineEvents)=>void,
    stateContext: GameMachineContext
}

export type renderSquareProps = {
    row: number,
    col: number
}

export type boardBuilderReturn = {
    positions: PieceKey[][],
    whiteKing: number[],
    blackKing: number[]
}


export type GameHeaderProps= {
    onLayoutChange: (event: LayoutChangeEvent) => void;
}

export type GameFootProps= {
    onLayoutChange: (event: LayoutChangeEvent) => void;
}

export type PlayerInfoProps = {
    onLayoutChange: (event: LayoutChangeEvent) => void;
    playerNumber: number;
    isPassnPlay: boolean;
    handleWinner: React.Dispatch<React.SetStateAction<"White" | "Black" | "STALEMATE" | "NONE">>
}

export type ResignConfirmProps = {
    sendEvent: (event :GameMachineEvents)=>void;
    handleWinner: React.Dispatch<React.SetStateAction<"White" | "Black" | "STALEMATE" | "NONE">>;
}

export type findValidMovesProps = {
    positions: PieceKey[][],
    active: number[],
    prevMove: number[][],
    whiteKing: number[],
    blackKing: number[],
    isWhiteTurn: boolean,
    castlingRights: Set<string>
}

export type findValidReturn = {
    isValidAndSafe: Set<string>,
    enPassant: number[]
}

export type moveCheckProps = {
    positions: PieceKey[][],
    active: number[],
    isValid: Set<string>,
    pieceType: PieceKey
}

export type pawnMoveProps = {
    positions: PieceKey[][],
    active: number[],
    prevMove: number[][],
}

export type moveLoopProps = {
    positions: PieceKey[][],
    active: number[],
    isValid: Set<string>,
    move: number[],
    loopDepth: number
}

export type nextMoveCheckProps = {
    positions: PieceKey[][],
    mx: number,
    my: number,
    kx: number,
    ky: number,
    activeX: number,
    activeY: number
}

export type kingThreatProps = {
    positions: PieceKey[][],
    kx: number,
    ky: number,
    activeX: number,
    activeY: number
}

export type kingCheckProps = {
    positions: PieceKey[][],
    isWhiteTurn: boolean,
    kx: number,
    ky: number
}

export type checkHitProps = {
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

export type checkMateProps = {
    positions: PieceKey[][],
    isWhiteTurn: boolean,
    kx: number, ky: number,
    whiteKing: number[],
    blackKing: number[],
    prevMove: number[][],
    threatDirections: number[][],
    castlingRights: Set<string>
}

export type castleValidProps = {
    positions: PieceKey[][],
    isWhiteTurn: boolean,
    kx: number,
    ky: number,
    dy: number,
    isValidAndSafe: Set<string>,
    castlingRights: Set<string>
}

export type gameScreenContext = {
    isWhiteTurn: boolean,
    capturedBlacks: Map<PieceKey, number>,
    capturedWhites: Map<PieceKey, number>,
}