import { View, LayoutChangeEvent } from 'react-native'
import React, { useCallback, useEffect, useState} from 'react'
import styles from '../utils/styles';
import GameBoardV2 from '../components/GameBoardV2';

const GameScreen = () => {
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [childHeights, setChildHeights] = useState<number[]>([]);
    const [boardDimension, setBoardDimension] = useState(0);

    const onScreenLayout = useCallback((event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerSize({width, height});
    }, []);

    const onChildLayout = (index: number) => (event: LayoutChangeEvent) => {
        const height = event.nativeEvent.layout.height;
        setChildHeights((prevHeights) => {
          const newHeights = [...prevHeights];
          newHeights[index] = height; // Store the height at the right index
          return newHeights;
        });
    };

    useEffect(()=>{
        const totalChildHeight = childHeights.reduce((sum, h) => sum + h, 0);
        const remainingHeight = containerSize.height - totalChildHeight;
        setBoardDimension(Math.min(containerSize.width*0.95, remainingHeight*0.95));
    }, [containerSize, childHeights]);

    return (
        <View style={styles.screen} onLayout={onScreenLayout}>
            <GameHeader onLayoutChange={onChildLayout(0)}/>
            <PlayerOneInfo onLayoutChange={onChildLayout(1)}/>
            {/* <GameBoard dimension={boardDimension} turn={whiteTurn} changeTurn={setWhiteTurn}/> */}
            <GameBoardV2 dimension={boardDimension}/>
            <PlayerOneInfo onLayoutChange={onChildLayout(2)}/>
            <GameFooter onLayoutChange={onChildLayout(3)}/>
        </View>
    )
}

type GameHeaderProps= {
    onLayoutChange: (event: LayoutChangeEvent) => void;
}

const GameHeader = ({onLayoutChange}: GameHeaderProps) => {
    return (
        <View style = {styles.header} onLayout={onLayoutChange}>

        </View>
    )
}

type GameFootProps= {
    onLayoutChange: (event: LayoutChangeEvent) => void;
}

const GameFooter = ({onLayoutChange}: GameFootProps) => {
    return (
        <View style = {styles.footer} onLayout={onLayoutChange}>

        </View>
    )
}

type PlayerInfoProps = {
    onLayoutChange: (event: LayoutChangeEvent) => void;
}

const PlayerOneInfo = ({onLayoutChange}: PlayerInfoProps) => {
    return(
        <View style={styles.playerInfo} onLayout={onLayoutChange}></View>
    )
}

export default GameScreen;