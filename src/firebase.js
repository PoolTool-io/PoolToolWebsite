import firebase from 'firebase/compat/app';
import "firebase/compat/messaging";
import "firebase/compat/database";

var firebaseConfig = {
  appId: "1:575892729285:android:097c65dc9c24e717182fac",
  apiKey: "AIzaSyCR5macOse2vgWvZnxYYbJpUq2e29RQRic",
  authDomain: "pegasus-pool.firebaseapp.com",
  databaseURL: "https://pegasus-pool.firebaseio.com",
  projectId: "pegasus-pool",
  storageBucket: "pegasus-pool.appspot.com",
  messagingSenderId: "575892729285",
  measurementId: "G-962EBX03SR",
};

firebase.initializeApp(firebaseConfig);

export var messaging = null;
if (firebase.messaging.isSupported()){
    messaging = firebase.messaging();
}

export const db = firebase.database();
