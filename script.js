// ==========================================
// 1. AMBIL ELEMEN HTML
// ==========================================

// Welcome
const startBtn = document.getElementById("start-btn");
const welcomePage = document.getElementById("welcome-page");

// Login
const loginPage = document.getElementById("login-page");
const loginBtn = document.getElementById("login-btn");

const usernameInput = document.getElementById("username-input");
const pinInput = document.getElementById("pin-input");

// Dashboard
const dashboardPage = document.getElementById("dashboard-page");

// Tanggal
const dayText = document.getElementById("day-text");
const dateNumber = document.getElementById("date-number");
const monthText = document.getElementById("month-text");

const dateBox = document.getElementById("date-box");
const datePickerInput = document.getElementById("date-picker-input");

// Task
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");

// Progress
const progressFill = document.getElementById("progress-fill");

// Finish
const finishBtn = document.getElementById("finish-btn");

// ==========================================
// 2. VARIABEL
// ==========================================

let selectedDateKey = "";
let currentTasks = [];

// ==========================================
// 3. INPUT PIN HANYA ANGKA
// ==========================================

pinInput.addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});

// ==========================================
// 4. TOMBOL START
// ==========================================

startBtn.addEventListener("click", function () {
  welcomePage.classList.add("hidden");

  loginPage.classList.remove("hidden");
});

// ==========================================
// 5. LOGIN ANGGOTA
// ==========================================

loginBtn.addEventListener("click", function () {
  const username = usernameInput.value.trim();

  const pin = pinInput.value.trim();

  if (username === "" || pin === "") {
    alert("Username dan PIN tidak boleh kosong ya!");

    return;
  }

  if (!/^\d{4}$/.test(pin)) {
    alert("PIN harus pas 4 digit angka!");

    return;
  }

  const savedPinKey = `user_pin_${username}`;

  const existingPin = localStorage.getItem(savedPinKey);

  if (existingPin) {
    if (existingPin !== pin) {
      alert("PIN salah! Silakan masukkan PIN yang benar.");

      return;
    }
  } else {
    localStorage.setItem(savedPinKey, pin);
  }

  localStorage.setItem("activeUser", username);

  loginPage.classList.add("hidden");

  dashboardPage.classList.remove("hidden");

  initDashboard();
});

// ==========================================
// 6. INISIALISASI DASHBOARD
// ==========================================

function initDashboard() {
  const today = new Date();

  selectedDateKey = formatDateKey(today);

  datePickerInput.value = selectedDateKey;

  updateDateDisplay(today);

  loadTasksForDate(selectedDateKey);
}

// ==========================================
// 7. FORMAT TANGGAL
// ==========================================

function formatDateKey(dateObj) {
  const year = dateObj.getFullYear();

  const month = String(dateObj.getMonth() + 1).padStart(2, "0");

  const day = String(dateObj.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ==========================================
// 8. UPDATE TAMPILAN TANGGAL
// ==========================================

function updateDateDisplay(dateObj) {
  // Nama hari
  dayText.textContent = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
  });

  // Angka tanggal saja
  dateNumber.textContent = dateObj.getDate();

  // Nama bulan
  monthText.textContent = dateObj.toLocaleDateString("en-US", {
    month: "long",
  });
}

// ==========================================
// 9. KLIK DATE BOX UNTUK MEMUNCULKAN KALENDER
// ==========================================

dateBox.addEventListener("click", function () {
  if (typeof datePickerInput.showPicker === "function") {
    try {
      datePickerInput.showPicker();
    } catch (error) {
      datePickerInput.focus();
    }
  } else {
    datePickerInput.focus();
  }
});

// ==========================================
// 10. KETIKA TANGGAL DIPILIH
// ==========================================

datePickerInput.addEventListener("change", function () {
  const val = this.value;

  if (!val) return;

  const [year, month, day] = val.split("-").map(Number);

  const localDate = new Date(year, month - 1, day);

  updateDateDisplay(localDate);

  selectedDateKey = val;

  loadTasksForDate(selectedDateKey);
});

// ==========================================
// 11. LOAD TUGAS BERDASARKAN TANGGAL
// ==========================================

function loadTasksForDate(dateKey) {
  const savedData = localStorage.getItem(`tasks_${dateKey}`);

  if (savedData) {
    try {
      currentTasks = JSON.parse(savedData);

      if (!Array.isArray(currentTasks)) {
        currentTasks = [];
      }
    } catch (error) {
      console.error("Gagal membaca data tugas:", error);

      currentTasks = [];
    }
  } else {
    currentTasks = [];
  }

  renderTasks();
}

// ==========================================
// 12. SIMPAN TUGAS
// ==========================================

function saveTasksForDate() {
  localStorage.setItem(
    `tasks_${selectedDateKey}`,

    JSON.stringify(currentTasks),
  );
}

// ==========================================
// 13. TAMBAH TUGAS
// ==========================================

function addTask() {
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
}

addTaskBtn.addEventListener("click", addTask);

// Tekan Enter untuk menambahkan tugas

taskInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

// ==========================================
// 14. RENDER DAFTAR TUGAS
// ==========================================

function renderTasks() {
  taskList.innerHTML = "";

  // Jika belum ada tugas

  if (currentTasks.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.textContent = "Belum ada tugas untuk tanggal ini~";

    emptyMessage.style.textAlign = "center";

    emptyMessage.style.color = "#888";

    emptyMessage.style.fontSize = "0.85rem";

    emptyMessage.style.marginTop = "20px";

    taskList.appendChild(emptyMessage);

    updateProgress(0, 0);

    return;
  }

  let completedCount = 0;

  currentTasks.forEach(function (task) {
    if (task.completed) {
      completedCount++;
    }

    const li = document.createElement("li");

    li.className = "task-item";

    if (task.completed) {
      li.style.opacity = "0.6";
    }

    // ICON DAUN

    const leafIcon = document.createElement("ion-icon");

    leafIcon.setAttribute("name", "leaf");

    leafIcon.style.cursor = "pointer";

    leafIcon.style.color = task.completed ? "#88ab8e" : "#557c55";

    // TEKS TUGAS

    const taskText = document.createElement("span");

    taskText.textContent = task.text;

    taskText.style.flexGrow = "1";

    if (task.completed) {
      taskText.style.textDecoration = "line-through";
    }

    // TOMBOL HAPUS

    const deleteBtn = document.createElement("button");

    deleteBtn.textContent = "✕";

    deleteBtn.style.background = "none";

    deleteBtn.style.border = "none";

    deleteBtn.style.color = "#c94c4c";

    deleteBtn.style.cursor = "pointer";

    deleteBtn.style.fontWeight = "bold";

    deleteBtn.addEventListener("click", function () {
      deleteTask(task.id);
    });

    // CHECKLIST

    leafIcon.addEventListener("click", function () {
      task.completed = !task.completed;

      saveTasksForDate();

      renderTasks();
    });

    li.appendChild(leafIcon);

    li.appendChild(taskText);

    li.appendChild(deleteBtn);

    taskList.appendChild(li);
  });

  updateProgress(completedCount, currentTasks.length);
}

// ==========================================
// 15. HAPUS TUGAS
// ==========================================

function deleteTask(id) {
  currentTasks = currentTasks.filter(function (task) {
    return task.id !== id;
  });

  saveTasksForDate();

  renderTasks();
}

// ==========================================
// 16. UPDATE PROGRESS BAR
// ==========================================

function updateProgress(completed, total) {
  const percentage = total === 0 ? 0 : (completed / total) * 100;

  progressFill.style.width = percentage + "%";
}

// ==========================================
// 17. TOMBOL FINISH
// ==========================================

finishBtn.addEventListener("click", function () {
  const total = currentTasks.length;

  if (total === 0) {
    alert("Belum ada tugas untuk diselesaikan. Yuk mulai produktif!");

    return;
  }

  const completed = currentTasks.filter(function (task) {
    return task.completed;
  }).length;

  if (completed === total) {
    alert("Kerja bagus! Semua tugas sudah selesai. 🎉");
  } else {
    alert(
      `Kamu sudah menyelesaikan ${completed} dari ${total} tugas. Tetap semangat! 🌿`,
    );
  }
});
