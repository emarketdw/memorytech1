/**
 * TEMPLATE DE CONFIGURAÇÃO FIREBASE
 * 
 * 1. Copie este arquivo para firebase-config.js
 * 2. Preencha com suas credenciais do Firebase
 * 3. Coloque firebase-config.js no .gitignore (já está feito)
 * 4. O arquivo será carregado automaticamente pelo techmemory.html
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSy_YOUR_API_KEY_HERE",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123xyz"
};

// Inicializar automaticamente
if (typeof initFirebase === 'function') {
  initFirebase(FIREBASE_CONFIG);
}
