const startBtn = document.getElementById("start-btn");
const welcomePage = document.getElementById("welcome-page");
const loginPage = document.getElementById("login-page");
const loginBtn = document.getElementById("login-btn");
const usernameInput = document.getElementById("username-input");
const pinInput = document.getElementById("pin-input");
const dashboardPage = document.getElementById("dashboard-page");
const dayText = document.getElementById("day-text");
const dateNumber = document.getElementById("date-number");
const monthText = document.getElementById("month-text");
const dateBox = document.getElementById("date-box");
const datePickerInput = document.getElementById("date-picker-input");
const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const progressFill = document.getElementById("progress-fill");
const finishBtn = document.getElementById("finish-btn");

let selectedDateKey = "";
let currentTasks = [];

pinInput.addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});

startBtn.addEventListener("click", function () {
  welcomePage.classList.add("hidden");
  loginPage.classList.remove("hidden");
});

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

function initDashboard() {
  const today = new Date();
  selectedDateKey = formatDateKey(today);
  datePickerInput.value = selectedDateKey;
  updateDateDisplay(today);
  loadTasksForDate(selectedDateKey);
}

function formatDateKey(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function updateDateDisplay(dateObj) {
  dayText.textContent = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
  });
  dateNumber.textContent = dateObj.getDate();
  monthText.textContent = dateObj.toLocaleDateString("en-US", {
    month: "long",
  });
}

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

datePickerInput.addEventListener("change", function () {
  const val = this.value;
  if (!val) return;

  const [year, month, day] = val.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  updateDateDisplay(localDate);
  selectedDateKey = val;
  loadTasksForDate(selectedDateKey);
});

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

function saveTasksForDate() {
  localStorage.setItem(
    `tasks_${selectedDateKey}`,
    JSON.stringify(currentTasks),
  );
}

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

taskInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

function renderTasks() {
  taskList.innerHTML = "";

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

    const leafIcon = document.createElement("ion-icon");
    leafIcon.setAttribute("name", "leaf");
    leafIcon.style.cursor = "pointer";
    leafIcon.style.color = task.completed ? "#88ab8e" : "#557c55";

    const taskText = document.createElement("span");
    taskText.textContent = task.text;
    taskText.style.flexGrow = "1";

    if (task.completed) {
      taskText.style.textDecoration = "line-through";
    }

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

function deleteTask(id) {
  currentTasks = currentTasks.filter(function (task) {
    return task.id !== id;
  });

  saveTasksForDate();
  renderTasks();
}

function updateProgress(completed, total) {
  const percentage = total === 0 ? 0 : (completed / total) * 100;
  progressFill.style.width = percentage + "%";
}

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
