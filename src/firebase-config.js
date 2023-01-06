// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB5NXn1Rs9aRpDKT47YaNHHFfmQWrCBAdM",
    authDomain: "smart-energy-meter-84975.firebaseapp.com",
    projectId: "smart-energy-meter-84975",
    storageBucket: "smart-energy-meter-84975.appspot.com",
    messagingSenderId: "748195001507",
    appId: "1:748195001507:web:11eef065f557c87cc7bb16",
    measurementId: "G-54TW59RT7H"
};

export function getFirebaseConfig() {
    if (!firebaseConfig || !firebaseConfig.apiKey) {
        throw new Error('No Firebase configuration object provided.' + '\n' +
        'Add your web app\'s configuration object to firebase-config.js');
    } else {
        return firebaseConfig;
    }
}
