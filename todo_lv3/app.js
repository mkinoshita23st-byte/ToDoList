const addBtn = document.getElementById('addBtn');
const addTaskTitle = document.getElementById('addTaskTitle');
const addDueDate = document.getElementById('dueDate');
const addDueTime = document.getElementById('dueTime');
const allTasksNumber = document.getElementById('allTasksNumber');
const incompletedTasksNumber = document.getElementById('incompletedTasksNumber');
const completedTasksNumber = document.getElementById('completedTasksNumber');
const keyword = document.getElementById('keyword');
const statusSelect = document.getElementById('statusSelect');
const sortSelect = document.getElementById('sortSelect');
const taskList = document.getElementById('taskList');
let strage = localStorage;
let todos = JSON.parse(strage.getItem('todos')) || [];

//並び順に変更した新配列生成関数
function sortTodos(todos) {
    let sortedTodos;
    if (sortSelect.value === 'added') {//並び順：追加順
        sortedTodos = todos.sort((obj1, obj2) => {
            return obj1.createdAt - obj2.createdAt;
        });
    }
    else if (sortSelect.value === 'dueAsc') {//並び順：期限が近い順
        sortedTodos = todos.sort(function (obj1, obj2) {
            return obj1.id - obj2.id;
        });
    } else {//sortSelect.value === 'dueDesc' 並び順：期限が遠い順
        sortedTodos = todos.sort(function (obj1, obj2) {
            return obj2.id - obj1.id;
        });
    }
    //期限切れタスクを降順で配列の末尾に配置する
    const now = new Date();
    const validTasks = [];//有効期限内タスク
    const expiredTasks = [];//期限切れタスク
    sortedTodos.forEach(todo => {
        const dueDateTime = new Date(`${todo.dueDate}T${todo.dueTime}:00`);//:00は秒
        if (dueDateTime < now) {
            expiredTasks.push(todo);
        } else {
            validTasks.push(todo);
        }
    });
    expiredTasks.sort((obj1, obj2) => {//期限切れの降順
        const due1 = new Date(`${obj1.dueDate}T${obj1.dueTime}:00`);
        const due2 = new Date(`${obj2.dueDate}T${obj2.dueTime}:00`);
        return due2 - due1;
    });
    return [...validTasks, ...expiredTasks];
}
//キーワードと状態によるToDo一覧表示切替関数
function updateTaskList() {
    const sortedTodos = sortTodos(todos);
    const now = new Date();
    taskListの内容全削除
    sortedTodos.forEach(todo => {
        const li = document.getElementById(`${todo.id}`);
        const todoTitle = todo.title;
        if (todoTitle.includes(keyword) || keyword === '') {//キーワードの対象である場合
            if (statusSelect.value === 'all') {//状態：すべて
                li.classList.remove('d-none');
            } else if (statusSelect.value === 'incompleted') {//状態：未完了
                if (!todo.completed) {
                    li.classList.remove('d-none');
                } else {
                    li.classList.add('d-none');
                }
            } else {//statusSelect.value === 'completed'　状態：完了
                if (todo.completed) {
                    li.classList.remove('d-none');
                } else {
                    li.classList.add('d-none');
                }
            }
        } else {//キーワードの対象でない場合
            li.classList.add('d-none');
        }
        const dueDateTime = new Date(`${todo.dueDate}T${todo.dueTime}:00`);
        if (dueDateTime < now) {//期限切れの場合
            li.classList.add('text-muted', 'bg-light');
        } else {//有効期限内の場合
            li.classList.remove('text-muted', 'bg-light');
        }
        taskList.appendChild(li);
    });
}
//編集/保存時のその他のボタン無効化/有効化切替関数
function toggleAllBtns(isDisabled, editBtnId) {
    const taskBtns = document.querySelectorAll('#taskList button');
    const btns = [addBtn, addTaskTitle, addDueDate, addDueTime, keyword, statusSelect, sortSelect, ...taskBtns];
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
             <div style="font-size: 0.8rem; color: #6c757d;">期限：${addDueDate} ${addDueTime}</div>
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
        updateTaskList();
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

//初期関数
function init() {
    //期限日で選択できる日付を制限するもの
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let day = String(today.getDate()).padStart(2, '0');
    let todayStr = `${year}-${month}-${day}`;
    dueDate.min = todayStr;
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
    //localStrage内に保存済みのタスクを表示
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
init();

//タスク追加イベント
addBtn.addEventListener('click', () => {
    //期限が過去の日時の場合
    const now = new Date();
    const due = new Date(`${addDueDate.value}T${addDueTime.value}:00`);
    if (due <= now) {
        addDueDate.value = '';
        addDueTime.value = '';
        alert('期限には現在時刻より後の日時を指定してください。');
        //タスク名・期限日付・期限時間が空白でない場合新タスクを追加
    } else if (addTaskTitle.value.trim() !== '' && addDueDate.value !== '' && addDueTime.value !== '') {
        //空いている最小のid番号を新タスクのidとする
        const todoIds = todos.map(todo => todo.id);
        let newId = 0;
        while (todoIds.includes(newId)) {
            newId++;
        }
        //配列に新タスクを追加
        todos.push({ id: newId, title: addTaskTitle.value.trim(), completed: false, dueDate: addDueDate.value, dueTime: addDueTime.value, createdAt: Date.now() });
        //localStrageに新タスクを追加
        strage.setItem('todos', JSON.stringify(todos));
        //一覧表示更新
        const newTask = todos.find(todo => todo.id === newId);
        createTask(newTask);
        updateTaskListAll();
        //タスク件数を追加
        allTasksNumber.textContent = parseInt(allTasksNumber.textContent, 10) + 1;
        incompletedTasksNumber.textContent = parseInt(incompletedTasksNumber.textContent, 10) + 1;
        addTaskTitle.value = '';
        addDueDate.value = '';
        addDueTime.value = '';
    } else {
        if (addTaskTitle.value.trim() === '') {//タスク名がない場合
            addTaskTitle.value = '';
            alert('タスク名を入力してください。');
        } else if (addDueDate.value === '') {//期限日がない場合
            addDueDate.value = '';
            alert('期限日を入力してください。');
        } else if (addDueTime.value === '') {//期限時間がない場合
            addDueTime.value = '';
            alert('期限時間を入力してください。');
        }
    }
    addTaskTitle.value = '';
});
// キーワード入力イベント
keyword.addEventListener('input', () => {
    updateTaskList();
});
// 状態の選択肢変更イベント
statusSelect.addEventListener('change', () => {
    updateTaskList();
});
// 並び順の選択肢変更イベント
sortSelect.addEventListener('change', () => {
    updateTaskList();
});