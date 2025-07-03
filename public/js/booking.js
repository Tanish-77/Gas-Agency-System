// booking.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC9O2QzwVsVPbN0suMjloIyfb6NPuEyDWk",
  authDomain: "gasagencysystem-940bc.firebaseapp.com",
  projectId: "gasagencysystem-940bc",
  storageBucket: "gasagencysystem-940bc.appspot.com",
  messagingSenderId: "804191491008",
  appId: "1:804191491008:web:a9f986fc0f32ca1b926e25",
};

// ✅ Initialize Modular Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser;
const MAX_CYLINDERS = 12;

// ✅ On Auth state changed
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    document.getElementById("username").textContent = user.email;
    await ensureUserDocument();
    await loadBookings();
  } else {
    window.location.href = "login.html";
  }
});

// ✅ Ensure Firestore document exists
async function ensureUserDocument() {
  const userRef = doc(db, "Users", currentUser.uid);
  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) {
    await setDoc(userRef, {
      name: currentUser.displayName || "",
      email: currentUser.email,
      balance: 12,
      bookings: [],
    });
  }
}

// ✅ Book new cylinder
window.bookCylinder = async function () {
  const userRef = doc(db, "Users", currentUser.uid);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();

  if (!userData || typeof userData.balance !== "number") {
    alert("User data is incomplete.");
    return;
  }

  if (userData.balance <= 0) {
    alert("No cylinders left to book.");
    return;
  }

  const newBooking = {
    date: new Date().toLocaleString(),
    status: "Booked",
  };

  await updateDoc(userRef, {
    balance: userData.balance - 1,
    bookings: arrayUnion(newBooking),
  });

  alert("Booking successful. Check history below.");

  await generateInvoice(newBooking);
  await sendBookingEmailToAdmin(newBooking);
  await loadBookings();
};

// ✅ Load booking history and balance
async function loadBookings() {
  const userRef = doc(db, "Users", currentUser.uid);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();

  const balanceDisplay = document.getElementById("balanceCount");
  if (balanceDisplay) {
    balanceDisplay.textContent = `${userData.balance} of ${MAX_CYLINDERS}`;
  }

  const list = document.getElementById("bookingList");
  list.innerHTML = "";
  userData.bookings?.forEach((b) => {
    const li = document.createElement("li");

    const statusSpan = document.createElement("span");
    statusSpan.className = `booking-status ${b.status.toLowerCase()}`;
    statusSpan.textContent = b.status;

    li.textContent = `${b.date} - `;
    li.appendChild(statusSpan);

    list.appendChild(li);
  });
}
// ✅ Generate PDF Invoice
async function generateInvoice(booking) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Gas Cylinder Booking Invoice", 20, 20);
  doc.setFontSize(12);
  doc.text(`Email: ${currentUser.email}`, 20, 40);
  doc.text(`Booking Date: ${booking.date}`, 20, 50);
  doc.text(`Status: ${booking.status}`, 20, 60);
  doc.save(`Invoice_${Date.now()}.pdf`);
}

// ✅ Send email to admin
// ✅ Send Booking Email to Admin using EmailJS
async function sendBookingEmailToAdmin(booking) {
  const templateParams = {
    user_email: currentUser.email,
    booking_date: booking.date,
    booking_status: booking.status,
  };

  try {
    const result = await emailjs.send(
      "service_2k7ursj", // ⬅️ Replace this
      "template_28z62wl", // ⬅️ Replace this
      templateParams
    );
    console.log("📧 Email sent:", result.status);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
}
