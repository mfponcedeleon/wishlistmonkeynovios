import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBGv9i9UPUCEkwWPSsTicCGwzEXZp5imQ0",
  authDomain: "wishlist-monkeynovios.firebaseapp.com",
  projectId: "wishlist-monkeynovios",
  storageBucket: "wishlist-monkeynovios.firebasestorage.app",
  messagingSenderId: "917134601512",
  appId: "1:917134601512:web:62c6872b27cc07973cf41d",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
