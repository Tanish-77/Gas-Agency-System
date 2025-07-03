import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC9O2QzwVsVPbN0suMjloIyfb6NPuEyDWk",
  authDomain: "gasagencysystem-940bc.firebaseapp.com",
  projectId: "gasagencysystem-940bc",
  storageBucket: "gasagencysystem-940bc.appspot.com",
  messagingSenderId: "804191491008",
  appId: "1:804191491008:web:a9f986fc0f32ca1b926e25",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Register User
window.registerUser = async function () {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCred.user;

    const userDoc = doc(db, "Users", user.uid);
    const existing = await getDoc(userDoc);

    if (!existing.exists()) {
      await setDoc(userDoc, {
        name: name,
        email: email,
        balance: 12,
        bookings: [],
        isAdmin: false, // 👈 default false for normal users
      });
    }

    alert("Registration successful");
    window.location.href = "dashboard.html";
  } catch (e) {
    alert("Registration Error: " + e.message);
  }
};

// ✅ Login User (with Admin Check)
window.loginUser = async function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    const userDoc = await getDoc(doc(db, "Users", user.uid));
    const userData = userDoc.data();

    if (userData?.isAdmin) {
      alert("Admin login successful");
      window.location.href = "admin.html"; // 👈 Admin Panel
    } else {
      alert("User login successful");
      window.location.href = "dashboard.html"; // 👈 User Panel
    }
  } catch (e) {
    alert("Login Error: " + e.message);
  }
};

// ✅ Logout
window.logoutUser = async function () {
  try {
    await auth.signOut();
    alert("Logout successful");
    window.location.href = "login.html";
  } catch (e) {
    alert("Logout Error: " + e.message);
  }
};
