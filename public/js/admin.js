// admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const bookingRequestsDiv = document.getElementById("bookingRequests");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "Users", user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists() || userSnap.data().isAdmin !== true) {
    alert("Access denied. You are not an admin.");
    window.location.href = "dashboard.html";
    return;
  }

  loadAllUserBookings();
});

async function loadAllUserBookings() {
  bookingRequestsDiv.innerHTML = "<h3>All User Bookings</h3>";

  const usersSnapshot = await getDocs(collection(db, "Users"));

  usersSnapshot.forEach((docSnap) => {
    const userData = docSnap.data();
    const userId = docSnap.id;

    const bookings = Array.isArray(userData.bookings) ? userData.bookings : [];

    bookings.forEach((booking, index) => {
      const card = document.createElement("div");
      card.className = "booking-card";

      card.innerHTML = `
      <p><strong>User:</strong> ${userData.name} (${userData.email})</p>
      <p><strong>Date:</strong> ${booking.date}</p>
      <p><strong>Status:</strong> <span id="status-${userId}-${index}">${booking.status}</span></p>
      <button onclick="handleStatusChange('${userId}', ${index}, 'Approved')">Approve</button>
      <button onclick="handleStatusChange('${userId}', ${index}, 'Rejected')">Reject</button>
      <hr>
    `;

      bookingRequestsDiv.appendChild(card);
    });
  });

  // Add event listeners for dynamically created buttons
  document
    .querySelectorAll(".approve")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        handleStatusChange(btn.dataset.user, btn.dataset.index, "Approved")
      )
    );
  document
    .querySelectorAll(".reject")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        handleStatusChange(btn.dataset.user, btn.dataset.index, "Rejected")
      )
    );
}

// ✅ Booking status change logic
async function handleStatusChange(userId, index, newStatus) {
  const userRef = doc(db, "Users", userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();
  const bookings = userData.bookings;

  if (bookings[index].status === newStatus) {
    alert(`Booking already marked as ${newStatus}.`);
    return;
  }

  bookings[index].status = newStatus;

  await updateDoc(userRef, { bookings });

  document.getElementById(`status-${userId}-${index}`).textContent = newStatus;
  alert(`Booking status updated to ${newStatus}`);
}

// ✅ Make function globally accessible
window.handleStatusChange = handleStatusChange;
