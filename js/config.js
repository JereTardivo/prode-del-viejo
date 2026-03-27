const firebaseConfig = {
  apiKey: "AIzaSyAsIXQc1mNQxGt_2zfBet40zTA2Q-aAMkM",
  authDomain: "prode-del-viejo.firebaseapp.com",
  databaseURL: "https://prode-del-viejo-default-rtdb.firebaseio.com",
  projectId: "prode-del-viejo",
  storageBucket: "prode-del-viejo.firebasestorage.app",
  messagingSenderId: "249292021098",
  appId: "1:249292021098:web:a7e338584c4f292f275913"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

const FB_PATH = 'prode_fechas';
