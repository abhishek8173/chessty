import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor : "#404e00",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 0,
    },
    header: {
        width: "100%",
        height: "7%",
        display: "flex",
        flexDirection: "row",
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderBottomWidth: 2,
        borderColor: "#eeeed2"
    },
    footer: {
        width: "100%",
        height: "15%",
        borderTopWidth: 2,
        borderColor: "#eeeed2"
    },
    playerInfo: {
        width: "100%",
        height: "10%",
        backgroundColor: "#76a757",
        display: 'flex',
        flexDirection: 'row',
        padding: "2.5%",
        alignItems: 'center',
        justifyContent: 'space-between'
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
    },
    popUpContainer: {
        backgroundColor: '#000000aa',
        width: '100%',
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'absolute', 
        zIndex: 10
    },
    popUpBox : {
        width:'80%', 
        aspectRatio: 1, 
        backgroundColor: '#76a757', 
        position: 'absolute', 
        borderRadius: '10%', 
        borderWidth: 4, 
        borderColor: '#eeeed2', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '5%', 
        alignItems: 'center', 
        justifyContent:'space-around'
    },
    resignConfirmationText: {
        fontSize: 22, 
        color: '#fff', 
        fontWeight: 700, 
        textAlign: 'center'
    },
    resignConfirmationCtaContainer: {
        width: '100%', 
        height: '40%', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 10, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    resignConfirmationResignCta: {
        height: "45%", 
        width: '100%', 
        borderWidth: 2, 
        borderRadius: 20, 
        borderColor: '#eeeed2', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'row', 
        alignItems:'center', 
        justifyContent: 'center'
    },
    resignConfirmationCancelCta: {
        height: "45%", 
        width: '100%', 
        borderWidth: 2, 
        borderRadius: 20, 
        backgroundColor: '#eeeed2',
        borderColor: '#eeeed2', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'row', 
        alignItems:'center', 
        justifyContent: 'center'
    },
    resignText: {
        textAlign: 'center', 
        fontSize: 18, 
        color: '#eeeed2', 
        fontWeight: '600'
    },
    cancelCta: {
        textAlign: 'center',
        fontSize: 18, 
        color: '#76a757', 
        fontWeight: '600'
    },
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

export default styles;