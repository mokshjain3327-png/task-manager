// ── State ──────────────────────────────────────────────
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let editingId = null;

// ── DOM Elements ────────────────────────────────────────
const taskInput     = document.getElementById('task-input');
const addBtn        = document.getElementById('add-btn');
const taskList      = document.getElementById('task-list');
const emptyState    = document.getElementById('empty-state');
const totalCount    = document.getElementById('total-count');
const doneCount     = document.getElementById('done-count');
const filterBtns    = document.querySelectorAll('.filter-btn');
const modalOverlay  = document.getElementById('modal-overlay');
const editInput     = document.getElementById('edit-input');
const saveBtn       = document.getElementById('save-btn');
const cancelBtn     = document.getElementById('cancel-btn');

// ── Save to localStorage ────────────────────────────────
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ── Generate unique ID ──────────────────────────────────
function generateId() {
  return Date.now().toString();
}

// ── Add Task ────────────────────────────────────────────
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const task = {
    id: generateId(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(task); // Add to top
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

// ── Delete Task ─────────────────────────────────────────
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// ── Toggle Complete ─────────────────────────────────────
function toggleTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasks();
  renderTasks();
}

// ── Open Edit Modal ─────────────────────────────────────
function openEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingId = id;
  editInput.value = task.text;
  modalOverlay.classList.add('visible');
  editInput.focus();
}

// ── Save Edit ───────────────────────────────────────────
function saveEdit() {
  const newText = editInput.value.trim();
  if (!newText) return;

  tasks = tasks.map(t =>
    t.id === editingId ? { ...t, text: newText } : t
  );
  saveTasks();
  renderTasks();
  closeModal();
}

// ── Close Modal ─────────────────────────────────────────
function closeModal() {
  modalOverlay.classList.remove('visible');
  editingId = null;
  editInput.value = '';
}

// ── Get Filtered Tasks ──────────────────────────────────
function getFilteredTasks() {
  if (currentFilter === 'completed') return tasks.filter(t => t.completed);
  if (currentFilter === 'pending')   return tasks.filter(t => !t.completed);
  return tasks;
}

// ── Render Tasks ────────────────────────────────────────
function renderTasks() {
  const filtered = getFilteredTasks();
  taskList.innerHTML = '';

  // Update stats
  totalCount.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
  doneCount.textContent  = `${tasks.filter(t => t.completed).length} done`;

  // Empty state
  if (filtered.length === 0) {
    emptyState.classList.add('visible');
  } else {
    emptyState.classList.remove('visible');
  }

  // Render each task
  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    li.innerHTML = `
      <div class="task-check ${task.completed ? 'checked' : ''}" data-id="${task.id}"></div>
      <span class="task-text">${escapeHTML(task.text)}</span>
      <div class="task-actions">
        <button class="edit-btn" data-id="${task.id}">Edit</button>
        <button class="delete-btn" data-id="${task.id}">Delete</button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

// ── Escape HTML to prevent XSS ──────────────────────────
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Event Listeners ─────────────────────────────────────

// Add task on button click
addBtn.addEventListener('click', addTask);

// Add task on Enter key
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// Task list click delegation (check, edit, delete)
taskList.addEventListener('click', e => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('task-check'))   toggleTask(id);
  if (e.target.classList.contains('edit-btn'))     openEdit(id);
  if (e.target.classList.contains('delete-btn'))   deleteTask(id);
});

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Modal save & cancel
saveBtn.addEventListener('click', saveEdit);
cancelBtn.addEventListener('click', closeModal);

// Save on Enter in edit input
editInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') saveEdit();
  if (e.key === 'Escape') closeModal();
});

// Close modal on overlay click
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

// ── Initial Render ──────────────────────────────────────
renderTasks();
