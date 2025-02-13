const default_FEN : string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

class Piece {
    None: number = 0;
    King: number = 1;
    Pawn: number = 2;
    Knight: number = 3;
    Bishop: number = 4;
    Rook: number = 5;
    Queen: number = 6;

    White: number = 8;
    Black: number = 16;
}


class board {
    square: number[] = new Array<number>(64);

    constructor(){
        const piece = new Piece();
        this.square[0] = piece.White | piece.Bishop;
        this.square[63] = piece.Black | piece.Queen;
        this.square[7] = piece.Bishop | piece.Knight;
    }

    loadPositionFromFen(fen: string): void {
        const piece = new Piece();
        let pieceType = {
            'k': piece.King,
            'q': piece.Queen,
            'b': piece.Bishop,
            'n': piece.Knight,
            'r': piece.Rook,
            'p': piece.Pawn
        }

        let fenBoard: string = fen.split(' ')[0];
        let file: number = 0;
        let rank: number = 7;
    }
}

