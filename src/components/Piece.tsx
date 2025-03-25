import { View, Image, Text, StyleSheet } from 'react-native'
import React from 'react'
import { isPieceWhite } from '../utils/validMoves'
import bk from '../../assets/sprites/bk.png'
import bq from '../../assets/sprites/bq.png'
import bb from '../../assets/sprites/bb.png'
import bn from '../../assets/sprites/bn.png'
import br from '../../assets/sprites/br.png'
import bp from '../../assets/sprites/bp.png'
import wk from '../../assets/sprites/wk.png'
import wq from '../../assets/sprites/wq.png'
import wb from '../../assets/sprites/wb.png'
import wn from '../../assets/sprites/wn.png'
import wr from '../../assets/sprites/wr.png'
import wp from '../../assets/sprites/wp.png'
import { Pieces, PieceProps } from '../@types/gamescreenTypes'
import styles from '../utils/styles'



export const pieces: Pieces = {
  'k': { img: bk, weight: 0 },
  'q': { img: bq, weight: 0 },
  'b': { img: bb, weight: 0 },
  'n': { img: bn, weight: 0 },
  'r': { img: br, weight: 0 },
  'p': { img: bp, weight: 0 },
  'K': { img: wk, weight: 0 },
  'Q': { img: wq, weight: 0 },
  'B': { img: wb, weight: 0 },
  'N': { img: wn, weight: 0 },
  'R': { img: wr, weight: 0 },
  'P': { img: wp, weight: 0 },
  '-' : { img: null, weight: 0}
};

const Piece = ({type, isPassnPlay}: PieceProps) => {
  const rotation = !isPassnPlay ? '0deg' : isPieceWhite(type) ? '0deg' : '180deg';
  return (
    <View style={{...styles.square, transform: [{ rotate: rotation}]}}>
      <Image source={pieces[type].img} style={{width: "100%", height: "100%"}}/>
    </View>
  )
}

export default Piece;