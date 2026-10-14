const addBtn = document.getElementById('addBtn');
const addTask = document.getElementById('addTask');
const taskList = document.getElementById('taskList');
let todos = [];
addBtn.addEventListener('click', () => {
    if (addTask.value.trim() !== '') {
        const li = document.createElement('li');
        let newId = Date.now();
        todos.push({ id: newId, title: addTask.value, completed: false });
        let isDoneBtn = `isDoneBtn${newId}`;
        let deleteBtn = `deleteBtn${newId}`;
        li.innerHTML = `
        <hr>
        <div class='task'>
        ${addTask.value}
        <div class='task-btn'>
        <button id=${isDoneBtn} class='btn btn-success'>完了</button>
        <button id=${deleteBtn} class='btn btn-danger'>削除</button>
        </div></div>
        `;
        taskList.appendChild(li);

        const newIsDoneBtn = document.getElementById(`${isDoneBtn}`);
        const newDeleteBtn = document.getElementById(`${deleteBtn}`);
        newIsDoneBtn.addEventListener('click', () => {
            todos.forEach(todo=>{
                if(todo.id===newId){
                    newIsDoneBtn.textContent = (todo.completed === false) ? '未完了' : '完了';
                    todo.completed=(!todo.completed);
                }
            });
            newIsDoneBtn.classList.toggle('btn-primary');
            newIsDoneBtn.classList.toggle('btn-warning');
        });
        newDeleteBtn.addEventListener('click', () => {
            li.remove();
            todos = todos.filter(task => task.id !== newId);
        });
    }
    addTask.value = '';
});