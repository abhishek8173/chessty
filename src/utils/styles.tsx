import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor : "#404e00",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center"
    },
    header: {
        width: "100%",
        height: "7%",
        backgroundColor : "#bbffdd",
    },
    footer: {
        width: "100%",
        height: "15%",
        backgroundColor : "#bbffdd",
    },
    playerInfo: {
        width: "100%",
        height: "10%",
        backgroundColor: "#ddbbff",
    },
    boardContainer: {
        flex: 0.9,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#aabbff"
    },
    gameBoard: {
        backgroundColor: "#26619c",
        flexDirection: "column",
    },
    row: {
      flexDirection: 'row',
    }
})

export default styles;