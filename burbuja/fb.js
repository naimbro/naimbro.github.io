/* LA BURBUJA — conexión a Firebase.
   Usa el proyecto del simulador de riesgo político (mgt300-risk-game) porque ya
   tiene sesión anónima: el alumno escanea y juega, sin cuentas. La configuración
   web no es secreta; lo que cada uno puede escribir lo deciden las reglas de
   Firestore de ese proyecto (colección `burbujas`). */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, signInAnonymously, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, connectFirestoreEmulator }
  from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// Pruebas locales: sólo desde localhost y con ?emu=1 se habla con los emuladores
// (en el repo del simulador: `npm run emu`). En el sitio publicado nunca se activa.
const EMULADOR = ["localhost", "127.0.0.1"].includes(location.hostname) && new URLSearchParams(location.search).has("emu");

const firebaseConfig = {
  apiKey: "AIzaSyBQYD4U5LIejha6Vt8yGTWljV1Q9Q3fzMg",
  authDomain: "mgt300-risk-game.firebaseapp.com",
  projectId: "mgt300-risk-game",
  storageBucket: "mgt300-risk-game.firebasestorage.app",
  messagingSenderId: "792715226145",
  appId: "1:792715226145:web:8995e2f6053e67d44a4760"
};

/* Cada pantalla abre su propia app con nombre: así el proyector y un teléfono de
   prueba en el mismo navegador son dos usuarios distintos (jugar.html?p=2 es un tercero). */
export async function conectar(nombreApp) {
  const app = initializeApp(firebaseConfig, nombreApp);
  const auth = getAuth(app);
  const db = getFirestore(app);
  if (EMULADOR) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
  await auth.authStateReady();
  const user = auth.currentUser || (await signInAnonymously(auth)).user;
  return { db, uid: user.uid };
}

export const salaRef = (db, codigo) => doc(db, "burbujas", codigo);
export const jugadorRef = (db, codigo, uid) => doc(db, "burbujas", codigo, "jugadores", uid);
export const jugadoresRef = (db, codigo) => collection(db, "burbujas", codigo, "jugadores");
export { getDoc, setDoc, onSnapshot };
