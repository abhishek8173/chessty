import Sound from "react-native-sound";

export const playMoveSound = async() => {
    var move_self = new Sound('move_self.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            return;
        }

        // Play the sound with an onEnd callback
        move_self.play();
    })
};