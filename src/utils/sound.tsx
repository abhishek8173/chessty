import Sound from "react-native-sound";

export const playMoveSound = () => {
    var move_self = new Sound('move_self.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
            console.log('failed to load the sound', error);
            return;
        }
        // loaded successfully
        console.log('duration in seconds: ' + move_self.getDuration() + 'number of channels: ' + move_self.getNumberOfChannels());

        // Play the sound with an onEnd callback
        move_self.play((success) => {
            if (success) {
            console.log('successfully finished playing');
            } else {
            console.log('playback failed due to audio decoding errors');
            }
        });
    })
};