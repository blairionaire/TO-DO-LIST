// Ambil elemen dari HTML
const startBtn = document.getElementById("start-btn");
const welcomePage = document.getElementById("welcome-page");
const loginPage = document.getElementById("login-page");
const dashboardPage = document.getElementById("dashboard-page");
const loginBtn = document.getElementById("login-btn");
const pinInput = document.getElementById("pin-input");

// Elemen Dashboard
const dayText = document.getElementById("day-text");
const dateNumber = document.getElementById("date-number");
const monthText = document.getElementById("month-text");
const datePickerInput = document.getElementById("date-picker-input");
const dateBoxTrigger = document.getElementById("date-box-trigger");

const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const progressFill = document.getElementById("progress-fill");
const finishBtn = document.getElementById("finish-btn");

// Variabel tanggal aktif & daftar tugas
let selectedDateKey = "";
let currentTasks = [];

// Batasi input PIN agar HANYA BISA ANGKA (0-9)
pinInput.addEventListener("input", function (e) {
  this.value = this.value.replace(/[^0-9]/g, "");
});

// Saat tombol START diklik, pindah ke halaman login
startBtn.addEventListener("click", function () {
  welcomePage.classList.add("hidden");
  loginPage.classList.remove("hidden");
});

// Saat tombol MASUK diklik (Sistem Verifikasi PIN Anggota)
loginBtn.addEventListener("click", function () {
  const username = document.getElementById("username-input").value.trim();
  const pin = pinInput.value.trim();

  if (username === "" || pin === "") {
    alert("Username dan PIN tidak boleh kosong ya!");
    return;
  }

  if (pin.length !== 4) {
    alert("PIN harus pas 4 digit angka!");
    return;
  }

  // Cek database lokal untuk user ini
  const savedPinKey = `user_pin_${username}`;
  const existingPin = localStorage.getItem(savedPinKey);

  if (existingPin) {
    // Jika user sudah pernah terdaftar, cek apakah PIN-nya cocok
    if (existingPin !== pin) {
      alert("PIN salah! Silakan masukkan PIN yang benar untuk nama ini.");
      return;
    }
  } else {
    // Jika user baru, daftarkan PIN otomatis ke localStorage
    localStorage.setItem(savedPinKey, pin);
  }

  // Simpan user aktif ke Local Storage
  localStorage.setItem("activeUser", username);

  // Sembunyikan login page, tampilkan dashboard page!
  loginPage.classList.add("hidden");
  dashboardPage.classList.remove("hidden");

  // Inisialisasi Dashboard dengan tanggal hari ini
  initDashboard();
});

// Inisialisasi Tanggal & Tugas Saat Masuk Dashboard
function initDashboard() {
  const today = new Date();
  selectedDateKey = formatDateKey(today);
  datePickerInput.value = selectedDateKey;
  updateDateDisplay(today);
  loadTasksForDate(selectedDateKey);
}

// Format tanggal jadi string YYYY-MM-DD buat kunci localStorage
function formatDateKey(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Update Tampilan Kotak Tanggal di Kiri Atas
function updateDateDisplay(dateObj) {
  const optionsDay = { weekday: "long" };
  const optionsMonth = { month: "long" };

  dayText.textContent = dateObj.toLocaleDateString("en-US", optionsDay);
  dateNumber.textContent = dateObj.getDate();
  monthText.textContent = dateObj.toLocaleDateString("en-US", optionsMonth);
}

// Memaksa date picker terbuka ketika kotak tanggal diklik
dateBoxTrigger.addEventListener("click", function () {
  if (typeof datePickerInput.showPicker === "function") {
    datePickerInput.showPicker();
  } else {
    datePickerInput.click();
  }
});

// Ketika tanggal dipilih dari kalender
datePickerInput.addEventListener("change", function (e) {
  const val = e.target.value;
  if (!val) return;

  const chosenDate = new Date(val);
  if (!isNaN(chosenDate)) {
    const localDate = new Date(
      chosenDate.getTime() + chosenDate.getTimezoneOffset() * 60000,
    );
    updateDateDisplay(localDate);
    selectedDateKey = val;
    loadTasksForDate(selectedDateKey);
  }
});

// Load tugas berdasarkan tanggal dari localStorage
function loadTasksForDate(dateKey) {
  const savedData = localStorage.getItem(`tasks_${dateKey}`);
  if (savedData) {
    currentTasks = JSON.parse(savedData);
  } else {
    currentTasks = [];
  }
  renderTasks();
}

// Simpan tugas berdasarkan tanggal ke localStorage
function saveTasksForDate() {
  localStorage.setItem(
    `tasks_${selectedDateKey}`,
    JSON.stringify(currentTasks),
  );
}

// Fungsi Tambah Tugas
addTaskBtn.addEventListener("click", function () {
  const taskText = taskInput.value.trim();
  if (taskText === "") {
    alert("Tulis dulu tugasnya ya!");
    return;
  }

  const newTask = {
    id: Date.now(),
    text: taskText,
    completed: false,
  };

  currentTasks.push(newTask);
  saveTasksForDate();
  taskInput.value = "";
  renderTasks();
});

// Bisa juga tekan Enter untuk tambah tugas
taskInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTaskBtn.click();
  }
});

// Render Daftar Tugas ke HTML
function renderTasks() {
  taskList.innerHTML = "";

  if (currentTasks.length === 0) {
    taskList.innerHTML = `<p style="text-align: center; color: #888; font-size: 0.85rem; margin-top: 20px;">Belum ada tugas untuk tanggal ini~</p>`;
    updateProgress(0, 0);
    return;
  }

  let completedCount = 0;

  currentTasks.forEach((task) => {
    if (task.completed) completedCount++;

    const li = document.createElement("li");
    li.className = "task-item";
    if (task.completed) li.style.opacity = "0.6";

    li.innerHTML = `
      <ion-icon name="leaf" style="cursor: pointer; ${task.completed ? "color: #88ab8e;" : "color: #557c55;"}"></ion-icon>
      <span style="flex-grow: 1; ${task.completed ? "text-decoration: line-through;" : ""}">${task.text}</span>
      <button onclick="deleteTask(${task.id})" style="background: none; border: none; color: #c94c4c; cursor: pointer; font-weight: bold;">✕</button>
    `;

    const leafIcon = li.querySelector("ion-icon");
    leafIcon.addEventListener("click", function () {
      task.completed = !task.completed;
      saveTasksForDate();
      renderTasks();
    });

    taskList.appendChild(li);
  });

  updateProgress(completedCount, currentTasks.length);
}

// Hapus Tugas
window.deleteTask = function (id) {
  currentTasks = currentTasks.filter((task) => task.id !== id);
  saveTasksForDate();
  renderTasks();
};

// Update Progression Bar
function updateProgress(completed, total) {
  const percentage = total === 0 ? 0 : (completed / total) * 100;
  progressFill.style.width = percentage + "%";
}

// Tombol FINISH
finishBtn.addEventListener("click", function () {
  alert("Kerja bagus! Hari ini produktif sekali. 🎉");
});
