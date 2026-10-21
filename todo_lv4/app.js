const addBtn = document.getElementById('addBtn');
const addTaskTitle = document.getElementById('addTaskTitle');
const addDueDate = document.getElementById('addDueDate');
const addDueTime = document.getElementById('addDueTime');
const allTasksNumber = document.getElementById('allTasksNumber');
const incompletedTasksNumber = document.getElementById('incompletedTasksNumber');
const completedTasksNumber = document.getElementById('completedTasksNumber');
const keyword = document.getElementById('keyword');
const statusSelect = document.getElementById('statusSelect');
const sortSelect = document.getElementById('sortSelect');
const taskList = document.getElementById('taskList');
let strage = localStorage;
let todos = JSON.parse(strage.getItem('todos')) || [];
//
function getTodayStr() {//呼び出し先：init,addTaskEvent.editBtn
    //期限日で選択できる日付を未来に制限
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let day = String(today.getDate()).padStart(2, '0');
    let todayStr = `${year}-${month}-${day}`;
    return todayStr;
}
function addDueTimeOptions(element) {//呼び出し先：init,addTaskEvent.editBtn
    for (let i = 108; i < 217; i++) {
        const totalMinutes = i * 5;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const hStr = String(hours).padStart(2, '0');
        const mStr = String(minutes).padStart(2, '0');
        const timeText = `${hStr}:${mStr}`;
        const option = document.createElement('option');
        option.value = timeText;
        option.textContent = timeText;
        element.appendChild(option);
    }
}
//編集/保存時のその他のボタン無効化/有効化切替関数
function toggleOtherBtns(isDisabled, editBtnId) {//呼び出し先：addTaskEvent.editBtn
    //リスト一覧のすべての完了/未完了・編集・削除ボタンの要素を配列に格納する
    let taskBtns = [];
    todos.forEach(todo => {
        const listBtns = document.querySelectorAll(`#list${todo.id} button`);
        taskBtns.push(...listBtns);
    });
    //画面上のすべての入力欄やボタンの有効化/無効化処理
    const btns = [addBtn, addTaskTitle, addDueDate, addDueTime, keyword, statusSelect, sortSelect, ...taskBtns];
    btns.forEach(btn => {
        if (btn.id !== `editBtn${editBtnId}`) {
            btn.disabled = isDisabled;
        } else {
            btn.disabled = false;
        }
    });
}
//並び順に変更した新配列生成関数
function sortTodos(todos) {//呼び出し先：updateTaskList
    let sortedTodos = [...todos];
    if (sortSelect.value === 'added') {//並び順：追加順
        sortedTodos = sortedTodos.sort((obj1, obj2) => {
            return obj1.createdAt - obj2.createdAt;
        });
    }
    else if (sortSelect.value === 'dueAsc') {//並び順：期限が近い順
        sortedTodos = sortedTodos.sort(function (obj1, obj2) {
            const due1 = new Date(`${obj1.dueDate}T${obj1.dueTime}:00`);
            const due2 = new Date(`${obj2.dueDate}T${obj2.dueTime}:00`);
            return due1 - due2;
        });
    } else {//sortSelect.value === 'dueDesc' 並び順：期限が遠い順
        sortedTodos = sortedTodos.sort(function (obj1, obj2) {
            const due1 = new Date(`${obj1.dueDate}T${obj1.dueTime}:00`);
            const due2 = new Date(`${obj2.dueDate}T${obj2.dueTime}:00`);
            return due2 - due1;

        });
    }
    //期限切れタスクを降順で配列の末尾に配置する
    const now = new Date();
    const validTasks = [];//有効期限内タスク
    const expiredTasks = [];//期限切れタスク
    sortedTodos.forEach(todo => {
        const due = new Date(`${todo.dueDate}T${todo.dueTime}:00`);
        if (due <= now) {
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
//キーワードと状態による一覧表示切替関数
function updateTaskList() {//呼び出し先：addTaskEvent.isDoneBtn,addTaskEvent.editBtn,init,addBtnEvent,keywordEvent,statusSelctEvent,sortSelectEvent
    const sortedTodos = sortTodos(todos);
    //ソートされた配列の並び順に処理する
    sortedTodos.forEach(todo => {
        const li = document.getElementById(`list${todo.id}`);
        taskList.appendChild(li);//末尾へ順に追加していく
        const now = new Date();
        const due = new Date(`${todo.dueDate}T${todo.dueTime}:00`);
        //キーワードと状態によるクラス内容変更
        const todoTitle = todo.title;
        if (todoTitle.includes(keyword.value) || keyword.value === '') {//キーワードの対象である場合
            if (statusSelect.value === 'all') {//状態：すべて
                li.classList.remove('d-none');
            } else if (statusSelect.value === 'incompleted') {//状態：未完了
                if (!todo.completed) {
                    li.classList.remove('d-none');
                } else {
                    li.classList.add('d-none');
                }
                if (due <= now) {//期限切れのタスクを非表示
                    li.classList.add('d-none');
                }
            } else {//statusSelect.value === 'completed'　状態：完了
                if (todo.completed) {
                    li.classList.remove('d-none');
                } else {
                    li.classList.add('d-none');
                }
                if (due <= now) {//期限切れのタスクを非表示
                    li.classList.add('d-none');
                }
            }
        } else {//キーワードの対象でない場合
            li.classList.add('d-none');
        }
        //期限切れのタスク処理
        if (due <= now) {
            //ボタン色変更と無効化
            const isDoneBtn = document.getElementById(`isDoneBtn${todo.id}`);
            const editBtn = document.getElementById(`editBtn${todo.id}`);
            const deleteBtn = document.getElementById(`deleteBtn${todo.id}`);
            const btns = [isDoneBtn, editBtn, deleteBtn];
            btns.forEach(btn => {
                btn.disabled = true;
                btn.classList.add('bg-secondary', 'bg-opacity-50');
            });
            li.classList.add('bg-secondary', 'bg-opacity-50');
        }
    });
}
//一覧表示にタスクを追加する関数
function addTaskList(task) {//呼び出し先：addTaskEvent.,init,addBtnEvent
    //表示タスク及び関連ボタン生成
    const li = document.createElement('li');
    li.id = `list${task.id}`;
    const now = new Date();
    const due = new Date(`${task.dueDate}T${task.dueTime}:00`);
    const expired = (due <= now) ? '<span class="text-danger small">期限切れ</span>' : '';
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
        <hr>
        <div class="task">
            <div id="taskInfo${task.id}">
                <div><span id="taskTitle" class="task-title">${task.title}</span></div>
                <div>${expired}</div>
                <div class="task-due">期限：${task.dueDate} ${task.dueTime}</div>
            </div>
            <div class="task-btn-group">
                <button id="isDoneBtn${task.id}" class="btn ${btnColor}">${isCompleted}</button>
                <button id="editBtn${task.id}" class="btn btn-primary">編集</button>
                <button id="deleteBtn${task.id}" class="btn btn-danger">削除</button>
            </div>
        </div>
    `;
    taskList.appendChild(li);
}
//タスク関連のイベント追加関数
function addTaskEvent(task) {//呼び出し先：init,addBtnEvent
    //各ボタンのイベント作成
    const newIsDoneBtn = document.getElementById(`isDoneBtn${task.id}`);
    const newEditBtn = document.getElementById(`editBtn${task.id}`);
    const newDeleteBtn = document.getElementById(`deleteBtn${task.id}`);
    const li = document.getElementById(`list${task.id}`);
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
        //ローカルストレージ更新
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
        //一覧表示並び替え
        updateTaskList();
    });
    //編集/保存ボタンイベント
    newEditBtn.addEventListener('click', () => {
        if (newEditBtn.textContent === '編集') {//編集ボタン押下
            //タスク表示欄を編集するための入力欄へ変更
            const taskDiv = li.querySelector(`#taskInfo${task.id}`);
            const todayStr = getTodayStr();
            taskDiv.innerHTML = `
                <div class="task-input-space">
                    <span>タスク名</span>
                    <input type="text" id="title" name="task" class="form-control" value="${task.title}" required>
                </div>
                <div class="row row-space">
                    <div class="col-md-6">
                        <span>期限日</span>
                        <input type="date" min="${todayStr}" id="dueDate" class="form-control" value="${task.dueDate}" required>
                    </div>
                    <div class="col-md-6">
                        <span>制限時間</span>
                        <select id="dueTime" class="form-select" required>
                            <option value="">時間を選択</option>
                        </select>
                    </div>
                </div>
            `;
            const dueTime = li.querySelector('#dueTime');
            addDueTimeOptions(dueTime);
            dueTime.value = task.dueTime;
            //保存ボタンへ切り替え
            newEditBtn.textContent = '保存';
            //その他のボタンを無効化
            toggleOtherBtns(true, task.id);
        } else {//保存ボタン押下
            //編集内容を保存
            const taskDiv = li.querySelector(`#taskInfo${task.id}`);
            const title = li.querySelector('#title');
            const dueDate = li.querySelector('#dueDate');
            const dueTime = li.querySelector('#dueTime');
            const targetIndex = todos.findIndex(todo => todo.id === task.id);
            if (title.value.trim() !== '' && dueDate.value !== '' && dueTime.value !== '') {//すべて入力値がある場合
                const now = new Date();
                const due = new Date(`${dueDate.value}T${dueTime.value}:00`);
                if (due > now) {//期限が有効の場合保存処理
                    taskDiv.innerHTML = `
                        <span id="taskTitle">${title.value.trim()}</span>
                        <div class="task-due">期限：${dueDate.value} ${dueTime.value}</div>
                    `;
                    //配列・ローカルストレージ更新
                    todos[targetIndex].title = title.value.trim();
                    todos[targetIndex].dueDate = dueDate.value;
                    todos[targetIndex].dueTime = dueTime.value;
                    strage.setItem('todos', JSON.stringify(todos));
                    updateTaskList();
                } else {//期限が無効の場合元に戻す
                    alert('期限には現在時刻より後の日時を指定してください。');
                    taskDiv.innerHTML = `
                        <span id="taskTitle">${task.title}</span>
                        <div class="task-due">期限：${task.dueDate} ${task.dueTime}</div>
                    `;
                }
            } else {//編集が無効な場合元に戻す
                alert('タスク名・期限日・制限時間をすべて入力してください。');
                taskDiv.innerHTML = `
                    <span id="taskTitle">${task.title}</span>
                    <div class="task-due">期限：${task.dueDate} ${task.dueTime}</div>
                `;
            }
            //編集ボタンへ切り替え
            newEditBtn.textContent = '編集';
            //その他のボタンを有効化
            toggleOtherBtns(false, task.id);
        }
        //ボタンの色を変更
        newEditBtn.classList.toggle('btn-primary');
        newEditBtn.classList.toggle('btn-warning');
    });
    //削除ボタンイベント
    newDeleteBtn.addEventListener('click', () => {
        const targetTask = todos.find(todo => todo.id === task.id);
        //タスク件数の減算
        if (targetTask.completed) {
            completedTasksNumber.textContent = parseInt(completedTasksNumber.textContent, 10) - 1;
        } else {
            incompletedTasksNumber.textContent = parseInt(incompletedTasksNumber.textContent, 10) - 1;
        }
        allTasksNumber.textContent = parseInt(allTasksNumber.textContent, 10) - 1;
        //表示タスクの削除
        li.remove();
        //ローカルストレージ更新（削除）
        todos = todos.filter(todo => todo.id !== task.id);
        strage.setItem('todos', JSON.stringify(todos));
    });
}
//初期関数
function init() {
    //期限日で選択できる日付を未来に制限
    const todayStr = getTodayStr();
    addDueDate.min = todayStr;
    //期限時間に５分区切りでoptionを追加
    addDueTimeOptions(addDueTime);
    //localStrage内に保存済みのタスクを表示
    const now = new Date();
    todos.forEach(todo => {
        //タスクの配列への追加と一覧表示への追加
        addTaskList(todo);
        addTaskEvent(todo);
        //有効期限内のタスク件数の追加
        const due = new Date(`${todo.dueDate}T${todo.dueTime}:00`);
        if (due > now) {
            allTasksNumber.textContent = parseInt(allTasksNumber.textContent, 10) + 1;
            if (todo.completed) {
                completedTasksNumber.textContent = parseInt(completedTasksNumber.textContent, 10) + 1;
            } else {
                incompletedTasksNumber.textContent = parseInt(incompletedTasksNumber.textContent, 10) + 1;
            }
        }
    });
    //一覧表示並び替え
    keyword.value = '';
    statusSelect.value = 'all';
    sortSelect.value = 'added';
    updateTaskList();
}
//初期化
init();
//タスク追加イベント
addBtn.addEventListener('click', () => {
    //タスク名・期限日付・期限時間が空白でない場合新タスクを追加
    if (addTaskTitle.value.trim() !== '' && addDueDate.value !== '' && addDueTime.value !== '') {
        //期限が過去の日時の場合
        const now = new Date();
        const due = new Date(`${addDueDate.value}T${addDueTime.value}:00`);
        if (due <= now) {
            addDueDate.value = '';
            addDueTime.value = '';
            alert('期限には現在時刻より後の日時を指定してください。');
        } else {
            //0から++増加する、空いている最小のid番号を新タスクのidとする
            const todoIds = todos.map(todo => todo.id);
            let newId = 0;
            while (todoIds.includes(newId)) {
                newId++;
            }
            //配列に新タスクを追加
            todos.push({
                id: newId, title: addTaskTitle.value.trim(), completed: false,
                dueDate: addDueDate.value, dueTime: addDueTime.value, createdAt: Date.now()
            });
            //ローカルストレージ更新（追加）
            strage.setItem('todos', JSON.stringify(todos));
            //タスクの配列への追加と一覧表示への追加、一覧表示の並び替え
            const targetTask = todos.find(todo => todo.id === newId);
            addTaskList(targetTask);
            addTaskEvent(targetTask);
            updateTaskList();
            //タスク件数を追加
            allTasksNumber.textContent = parseInt(allTasksNumber.textContent, 10) + 1;
            incompletedTasksNumber.textContent = parseInt(incompletedTasksNumber.textContent, 10) + 1;
            addTaskTitle.value = '';
            addDueDate.value = '';
            addDueTime.value = '';
        }
    } else {//空の入力値があった場合
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