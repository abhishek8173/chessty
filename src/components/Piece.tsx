import { View, Image, Text, StyleSheet, LayoutChangeEvent } from 'react-native'
import React, { useState, useEffect } from 'react'
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


export type PieceKey = 'k' | 'q' | 'b' | 'n' | 'r' | 'p' | 'K' | 'Q' | 'B' | 'N' | 'R' | 'P' | '-';


type Piece = {
  img: any;
  weight: number
};

type Pieces = Record<PieceKey, Piece>;


type PieceProps={
  type : PieceKey;
}


const pieces: Pieces = {
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

const Piece = ({type}: PieceProps) => {
  return (
    <View style={styles.square}>
      <Image source={pieces[type].img} style={{width: "100%", height: "100%"}}/>
    </View>
  )
}

export default Piece;

const styles = StyleSheet.create({
  square: {
    display: "flex",
    //backgroundColor: "#774887",
    width: "100%",
    height: "100%",
  },
  img: {
    width : "100%",
    height : "100%",
  },
  rowNum: {
    position: "absolute",
    marginTop: 5,
    marginLeft: 5,
  }
})