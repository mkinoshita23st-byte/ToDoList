const addBtn = document.getElementById('addBtn');
const addTask = document.getElementById('addTask');
const dueDate = document.getElementById('dueDate');
const dueTime = document.getElementById('dueTime');
const allTasksNumber = document.getElementById('allTasksNumber');
const incompletedTasksNumber = document.getElementById('incompletedTasksNumber');
const completedTasksNumber = document.getElementById('completedTasksNumber');
const keyword= document.getElementById('keyword');
const statusSelect = document.getElementById('statusSelect');
const sortSelect = document.getElementById('sortSelect');
const taskList = document.getElementById('taskList');
let strage = localStorage;
let todos = JSON.parse(strage.getItem('todos')) || [];
//期限時間に５分区切りでoptionを追加
for (let i = 0; i < 288; i++) {
    const totalMinutes = i * 5;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const timeText = `${hStr}:${mStr}`;
    const option = document.createElement('option');
    option.value = timeText;
    option.textContent = timeText;
    dueTime.appendChild(option);
}
//編集/保存時のその他のボタン無効化/有効化メソッド
function toggleAllBtns(isDisabled, editBtnId) {
    const taskBtns = document.querySelectorAll('#taskList button');
    const btns = [addBtn, addTask, allTasksBtn, incompletedTasksBtn, completedTasksBtn, ...taskBtns];
    btns.forEach(btn => {
        if (btn.id !== `editBtn${editBtnId}`) {
            btn.disabled = isDisabled;
        } else {
            btn.disabled = false;
        }
    });
}
//タスクの表示メソッド
function createTask(task) {
    //表示タスク及び関連ボタン生成
    const li = document.createElement('li');
    li.id = task.id;
    let isDoneBtn = `isDoneBtn${task.id}`;
    let editBtn = `editBtn${task.id}`;
    let deleteBtn = `deleteBtn${task.id}`;
    let isCompleted;
    let btnColor;
    if (task.completed) {
        isCompleted = '未完了';
        btnColor = 'btn-warning';
    } else {
        isCompleted = '完了';
        btnColor = 'btn-success';
    }
    li.innerHTML = `
        <hr style="margin-left: -20px; margin-right: -20px; border-color: #bebebe;">
        <div
                style="margin-top: -10px; margin-bottom: -10px; display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <div>
            <div>${task.title}</div>
             <div style="font-size: 0.8rem; color: #6c757d;">期限：2026/10/14 11:00</div>
        </div>
            <div style="text-align: right; display: flex; gap: 5px;">
                <button id="${isDoneBtn}" class="btn ${btnColor}" style="white-space: nowrap; width: auto;">${isCompleted}</button>
                <button id="${editBtn}" class="btn btn-primary" style="white-space: nowrap; width: auto;">編集</button>
                <button id="${deleteBtn}" class="btn btn-danger" style="white-space: nowrap; width: auto;">削除</button>
            </div>
        </div>
    `;
    taskList.appendChild(li);
    //各ボタンのイベント作成
    const newIsDoneBtn = document.getElementById(`${isDoneBtn}`);
    const newEditBtn = document.getElementById(`${editBtn}`);
    const newDeleteBtn = document.getElementById(`${deleteBtn}`);
    //完了/未完了ボタンイベント
    newIsDoneBtn.addEventListener('click', () => {
        const targetTodo = todos.find(todo => todo.id === task.id);
        //ボタン表示内容切り替え
        newIsDoneBtn.textContent = (targetTodo.completed === false) ? '未完了' : '完了';
        //タスク件数調整
        if (targetTodo.completed) {//完了ボタン押下
            completedTasksNumber.textContent = parseInt(completedTasksNumber.textContent, 10) - 1;
            incompletedTasksNumber.textContent = parseInt(incompletedTasksNumber.textContent, 10) + 1;
        } else {//未完了ボタン押下
            completedTasksNumber.textContent = parseInt(completedTasksNumber.textContent, 10) + 1;
            incompletedTasksNumber.textContent = parseInt(incompletedTasksNumber.textContent, 10) - 1;
        }
        //localStrage内容変更
        todos = todos.map(todo => {
            if (todo.id === task.id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        strage.setItem('todos', JSON.stringify(todos));
        //ボタンの色を切り替え
        newIsDoneBtn.classList.toggle('btn-success');
        newIsDoneBtn.classList.toggle('btn-warning');

        //表示に関する処理
if(statusSelect.value==='all'){
    if(sortSelected.value==='added'){
        
    }else if(sortSelected.value==='dueAsc'){

    }else{//sortSelected.value==='dueDesc'

    }
}else if(statusSelect.value==='incompleted'){
}else{//statusSelect.value==='completed'
}
//すべてのタスク表示イベント
allTasksBtn.addEventListener('click', () => {
    todos.forEach(todo => {
        const li = document.getElementById(`${todo.id}`);
        li.classList.remove('d-none');
    });
});
//未完了タスクのみ表示イベント
incompletedTasksBtn.addEventListener('click', () => {
    todos.forEach(todo => {
        const li = document.getElementById(`${todo.id}`);
        if (!todo.completed) {
            li.classList.remove('d-none');
        } else {
            li.classList.add('d-none');
        }
    });
});
//完了タスクのみ表示イベント
completedTasksBtn.addEventListener('click', () => {
    todos.forEach(todo => {
        const li = document.getElementById(`${todo.id}`);
        if (todo.completed) {
            li.classList.remove('d-none');
        } else {
            li.classList.add('d-none');
        }
    });
});
    });
    //編集/保存ボタンイベント
    newEditBtn.addEventListener('click', () => {
        const taskDiv = li.querySelector('.task');
        if (newEditBtn.textContent === '編集') {//編集ボタン押下
            //保存ボタンへ切り替え
            const span = li.querySelector('span');
            const newInput = document.createElement('input');
            newInput.id = `inputTaskName${task.id}`;
            newInput.type = 'text';
            newInput.value = span.textContent;
            newInput.className = 'form-control';
            newEditBtn.textContent = '保存';
            taskDiv.replaceChild(newInput, span);
            //その他のボタンを無効化
            toggleAllBtns(true, task.id);
        } else {//保存ボタン押下
            //編集内容を保存
            const input = li.querySelector('input');
            const inputTaskName = li.querySelector(`#inputTaskName${task.id}`);
            const newSpan = document.createElement('span');
            const targetIndex = todos.findIndex(todo => todo.id === task.id);
            if (inputTaskName.value.trim() !== '') {//編集が有効な場合タスク名を変更する
                newSpan.textContent = inputTaskName.value.trim();
                todos[targetIndex].title = inputTaskName.value.trim();
                strage.setItem('todos', JSON.stringify(todos));
            } else {//編集が無効な場合元に戻す
                newSpan.textContent = todos[targetIndex].title;
            }
            //編集ボタンへ切り替え
            newEditBtn.textContent = '編集';
            taskDiv.replaceChild(newSpan, input);
            //その他のボタンを有効化
            toggleAllBtns(false, task.id);
        }
        //ボタンの色を変更
        newEditBtn.classList.toggle('btn-primary');
        newEditBtn.classList.toggle('btn-warning');
    });
    //削除ボタンイベント
    newDeleteBtn.addEventListener('click', () => {
        const targetTodo = todos.find(todo => todo.id === task.id);
        //タスク件数の減算
        if (targetTodo.completed) {
            completedTasksNumber.textContent = parseInt(completedTasksNumber.textContent, 10) - 1;
        } else {
            incompletedTasksNumber.textContent = parseInt(incompletedTasksNumber.textContent, 10) - 1;
        }
        allTasksNumber.textContent = parseInt(allTasksNumber.textContent, 10) - 1;
        //表示タスクの削除
        li.remove();
        //localStrageからのタスク削除
        const todos = todos.filter(todo => todo.id !== task.id);
        strage.setItem('todos', JSON.stringify(todos));
    });
}
//localStrage内に保存済みのタスクを表示
function showInitTodos() {
    todos.forEach(todo => {
        //タスクの表示
        createTask(todo);
        //タスク件数の追加
        allTasksNumber.textContent = parseInt(allTasksNumber.textContent, 10) + 1;
        if (todo.completed) {
            completedTasksNumber.textContent = parseInt(completedTasksNumber.textContent, 10) + 1;
        } else {
            incompletedTasksNumber.textContent = parseInt(incompletedTasksNumber.textContent, 10) + 1;
        }
    });
}
showInitTodos();
//タスク追加イベント
addBtn.addEventListener('click', () => {
    //タスク名が空白でない場合新タスクを追加
    if (addTask.value.trim() !== '') {
        //localStrageに新タスクを追加
        let newId = Date.now();
        // , dueDate: addTaskDue.value, dueTime: addTaskDuwTime.value, createdAt
        todos.push({ id: newId, title: addTask.value.trim(), completed: false });
        strage.setItem('todos', JSON.stringify(todos));
        //新タスクを追加表示
        let targetTodo = todos.find(todo => todo.id === newId);
        createTask(targetTodo);
        //タスク件数を追加
        allTasksNumber.textContent = parseInt(allTasksNumber.textContent, 10) + 1;
        incompletedTasksNumber.textContent = parseInt(incompletedTasksNumber.textContent, 10) + 1;
    }//追加タスク名が空の時はなにも起こらない
    addTask.value = '';
    //追加したものの表示について
});
