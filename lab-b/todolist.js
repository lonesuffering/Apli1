document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const searchInput = document.getElementById('search');
    const newTaskInput = document.getElementById('new-task');
    const taskDateInput = document.getElementById('task-date');
    const addTaskBtn = document.getElementById('add-task-btn');

    // Load tasks from Local Storage
    const loadTasks = () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        taskList.innerHTML = '';
        tasks.forEach(task => createTaskElement(task.text, task.date, task.completed));
    };

    // Save task to Local Storage
    const saveTask = (text, date) => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push({ text, date });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Create a task element
    const createTaskElement = (taskText, taskDate, completed = false) => {
        const li = document.createElement('li');


        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('task-checkbox');
        checkbox.checked = completed;

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                textSpan.style.textDecoration = 'line-through'; // Зачеркиваем текст
                textSpan.style.opacity = '0.5'; // Уменьшаем непрозрачность
                dateSpan.style.textDecoration = 'line-through'; // Зачеркиваем дату
                dateSpan.style.opacity = '0.5'; // Уменьшаем непрозрачность
            } else {
                textSpan.style.textDecoration = 'none'; // Убираем зачеркивание
                textSpan.style.opacity = '1'; // Восстанавливаем непрозрачность
                dateSpan.style.textDecoration = 'none'; // Убираем зачеркивание
                dateSpan.style.opacity = '1'; // Восстанавливаем непрозрачность
            }
            updateLocalStorage(); // Обновляем localStorage при изменении состояния чекбокса
        });

        li.appendChild(checkbox);

        // Task text span
        const textSpan = document.createElement('span');
        textSpan.textContent = taskText;
        li.appendChild(textSpan);

        // Task date span
        const dateSpan = document.createElement('span');
        dateSpan.textContent = taskDate ? ` ${taskDate}` : ' (No Date)';
        dateSpan.style.marginLeft = '10px';
        li.appendChild(dateSpan);

        if (completed) {
            textSpan.style.textDecoration = 'line-through';
            textSpan.style.opacity = '0.5';
            dateSpan.style.textDecoration = 'line-through';
            dateSpan.style.opacity = '0.5';
        }

        // Allow task text and date editing on click
        textSpan.addEventListener('click', () => {
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.value = taskText;
            textInput.style.width = '150px'; // Set a reasonable width for text input
            li.replaceChild(textInput, textSpan);

            const dateInput = document.createElement('input');
            dateInput.type = 'date';
            dateInput.value = taskDate || '';
            li.replaceChild(dateInput, dateSpan);

            // Function to save text and date simultaneously
            const saveChanges = () => {
                const updatedText = textInput.value.trim();
                const updatedDate = dateInput.value;

                const today = new Date().toISOString().split('T')[0];

                // Validate task text and date
                if (updatedText.length < 3 || updatedText.length > 255) {
                    alert('Task must be between 3 and 255 characters.');
                    return;
                }
                if (updatedDate && updatedDate < today) {
                    alert('Task date must be today or in the future.');
                    return;
                }

                taskText = updatedText;
                taskDate = updatedDate;

                textSpan.textContent = taskText;
                dateSpan.textContent = taskDate ? ` ${taskDate}` : ' (No Date)';

                li.replaceChild(textSpan, textInput);
                li.replaceChild(dateSpan, dateInput);

                updateLocalStorage();
            };

            // Save changes on blur or pressing Enter
            textInput.addEventListener('blur', saveChanges);
            dateInput.addEventListener('blur', saveChanges);
            textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') saveChanges();
            });
            dateInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') saveChanges();
            });
        });

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => {
            li.remove();
            updateLocalStorage();
        });
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    };

    // Add new task
    addTaskBtn.addEventListener('click', () => {
        const taskText = newTaskInput.value.trim();
        const taskDate = taskDateInput.value;

        // Validate task text
        if (taskText.length < 3 || taskText.length > 255) {
            alert('Task must be between 3 and 255 characters.');
            return;
        }

        // Validate date
        const today = new Date().toISOString().split('T')[0];
        if (taskDate && taskDate < today) {
            alert('Task date must be today or in the future.');
            return;
        }

        createTaskElement(taskText, taskDate);
        saveTask(taskText, taskDate);

        // Clear inputs
        newTaskInput.value = '';
        taskDateInput.value = '';
    });

    // Search tasks and highlight matching query
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const items = taskList.getElementsByTagName('li');

        for (let item of items) {
            const textSpan = item.querySelector('span');
            const originalText = textSpan.textContent;
            const lowerText = originalText.toLowerCase();

            // Remove any previous highlights
            textSpan.innerHTML = originalText;

            // If the search query is empty, show all items
            if (query === '') {
                item.style.display = ''; // Show all tasks
            } 
            // If there is a search query, highlight matching text
            else if (query.length >= 2 && lowerText.includes(query)) {
                const regex = new RegExp(`(${query})`, 'gi'); // Create a case-insensitive regex
                const highlightedText = originalText.replace(regex, '<span class="highlight">$1</span>');
                textSpan.innerHTML = highlightedText;
                item.style.display = ''; // Show the item if it matches the search query
            } 
            // Hide items that don't match the search query
            else {
                item.style.display = 'none';
            }
        }
    });

    // Update localStorage after any change
    const updateLocalStorage = () => {
        const tasks = [];
        const items = taskList.getElementsByTagName('li');
        for (let item of items) {
            const checkbox = item.querySelector('.task-checkbox');
            const spans = item.getElementsByTagName('span'); // Получаем все элементы span в элементе li
            const text = spans[0].textContent; // Первый span - это текст задачи
            const date = spans[1].textContent.trim(); // Второй span - это дата задачи
            const completed = checkbox.checked; // Состояние чекбокса
            tasks.push({ text, date: date.includes('No Date') ? '' : date, completed }); // Сохраняем completed
        }
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Load tasks on page load
    loadTasks();
});
