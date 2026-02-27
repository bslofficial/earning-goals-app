const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');

// ১. পেজ লোড হওয়ার সময় আগের টাস্কগুলো মেমোরি থেকে নিয়ে আসা
document.addEventListener('DOMContentLoaded', getTasks);
document.getElementById('date-display').innerText = new Date().toDateString();

// ২. টাস্ক অ্যাড করার ফাংশন
addBtn.onclick = () => {
    if (taskInput.value.trim() !== "") {
        const taskText = taskInput.value;
        createTaskElement(taskText);
        
        // লোকাল স্টোরেজে সেভ করা
        saveLocalTasks(taskText);
        
        taskInput.value = "";
    } else {
        alert("Please write a task first!");
    }
};

// ৩. টাস্ক এলিমেন্ট তৈরি করার ফাংশন
function createTaskElement(taskText) {
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${taskText}</span>
        <div class="actions">
            <i class="fas fa-check" onclick="markComplete(this)"></i>
            <i class="fas fa-trash" onclick="removeTaskFromLocal(this)"></i>
        </div>
    `;
    taskList.appendChild(li);
}

// ৪. টাস্ক কমপ্লিট করার ফাংশন
function markComplete(element) {
    element.parentElement.parentElement.classList.toggle('completed');
}

// ৫. লোকাল স্টোরেজে ডাটা সেভ রাখা
function saveLocalTasks(task) {
    let tasks;
    if (localStorage.getItem('tasks') === null) {
        tasks = [];
    } else {
        tasks = JSON.parse(localStorage.getItem('tasks'));
    }
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ৬. সেভ করা ডাটা পেজে দেখানো
function getTasks() {
    let tasks;
    if (localStorage.getItem('tasks') === null) {
        tasks = [];
    } else {
        tasks = JSON.parse(localStorage.getItem('tasks'));
    }
    tasks.forEach(function(task) {
        createTaskElement(task);
    });
}

// ৭. ডিলিট করলে মেমোরি থেকেও মুছে ফেলা
function removeTaskFromLocal(element) {
    const li = element.parentElement.parentElement;
    const taskText = li.children[0].innerText;
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    tasks.splice(tasks.indexOf(taskText), 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    li.remove();
}
