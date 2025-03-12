import { View, Text } from "react-native";
import { ResignConfirmProps } from "../@types/gamescreenTypes";
import styles from "../utils/styles";
import { memo } from "react";

const ResignConfirmation = ({sendEvent, handleWinner}: ResignConfirmProps) =>{
    const handleResign = () => {
        sendEvent({type: 'RESIGN'});
    }
    const handleCancel = () => {
        handleWinner('NONE');
    }
    return(
        <View style={styles.popUpContainer}>
            <View style={styles.popUpBox}>

                <Text style={styles.resignConfirmationText}>
                    {`Are You Sure You Want To\nRESIGN??`}
                </Text>

                <View style={styles.resignConfirmationCtaContainer}>

                    <View style={styles.resignConfirmationResignCta} onTouchStart={handleResign}>
                        <Text style={styles.resignText}>RESIGN</Text>
                    </View>

                    <View style={styles.resignConfirmationCancelCta} onTouchStart={handleCancel}>
                        <Text style={styles.cancelCta}>CANCEL</Text>
                    </View>

                </View>

            </View>
        </View>
    )
}

export default memo(ResignConfirmation);