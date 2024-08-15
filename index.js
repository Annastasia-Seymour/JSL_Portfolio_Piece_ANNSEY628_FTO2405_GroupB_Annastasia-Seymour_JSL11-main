// TASK: import helper functions from utils
// TASK: import initialData
import { getTasks , createNewTask, patchTask , putTask , deleteTask } from './utils/taskFunctions.js';
import initialData from './initialData.js';
/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}
//console.log(localStorage)
initializeData();
// TASK: Get elements from the DOM
const elements = {
  // Get the task list container or any other container where tasks are displayed
  taskButton: document.querySelector('#add-new-task-btn'), // Assuming this is where tasks are listed
  // New Task Modal
  newTask: document.getElementById('new-task-modal-window'),
  // Update Task Modal
  updateTask: document.querySelector('.edit-task-modal-window'), // Assuming this is the update task modal
  // Sidebar elements
  sideBar: document.getElementById('side-bar-div'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  // Header elements
  headerBoardName: document.getElementById('header-board-name'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  editBoardBtn: document.getElementById('edit-board-btn'),
  // Filter overlay
  filterDiv: document.getElementById('filterDiv'),
  // Theme switch
  themeSwitch: document.getElementById('switch'),
  columnDivs: document.querySelectorAll('.column-div')//
};
console.log(elements);// trouble shoot'n
//make sure to comeback here, not sure what to do but i have an idea


let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard : boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    
    const boardElement = document.createElement("button");
    boardElement.textContent = board;

    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', function() {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs
// the boards werent showing because columnDiv wasnt defined!! coding can be a nightmare
  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);
    
      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click',() => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
// we can add if else for validation

}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
 
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      toggleModal(false, elements.editTaskModal);
    });
  }
  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click',() => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click',() => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  // createNewTaskBtn was conflicting with the addNewBtn
  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });
  
 const newTaskModal = elements.newTask;

  // Add new task form submission event listener
  elements.newTask.addEventListener('submit',  (event) => {
    addTask(event)
  });
}
//updates the task form submission of existing tasks first attempt
/*elements.updateTask.addEventListener('click', () => {
  toggleModal(true);
  elements.filterDiv.style.display = 'block'; // Also show the filter overlay
}); */

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.newTask) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();
  
  // Assign user input to the task object
  // trying to take {} out of an object
  /*const task = { 
    userInput : document.getElementById("modal-title-input"),// gets the task title
    userDescription : document.getElementById("modal-desc-input"),// gets the task description
    userStatus: document.getElementById("modal-select-status")//gets the status
    // Add task properties here
  };*/

  const titleValue = document.getElementById("title-input").value;
  const descriptionValue = document.getElementById("desc-input").value;
  const statusValue = document.getElementById("select-status").value;
 
const newTaskData = {
title: titleValue,
description: descriptionValue,
state: statusValue
};
console.log(newTaskData);

  const newTask = createNewTask(newTaskData);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    event.target.reset(); // Ensure this targets the correct form ,this was low key confusing
    refreshTasksUI();
  }
}

function toggleSidebar(show) {
  const sidebar = elements.sideBar; // kinda redundant because i add it to the top line 28, but makes it easier to reference variables in the functions relevant
  if (show) {
    sidebar.style.display = 'block'; // or add a class to show the sidebar
  } else {
    sidebar.style.display = 'none'; // or add a class to hide the sidebar
  }
}

function toggleTheme() {
  const body = document.body;
  body.classList.toggle('light-theme');
  localStorage.setItem('light-theme', body.classList.contains('light-theme') ? 'disabled' : 'enabled');
}


function openEditTaskModal(task) {
  const editModel = document.getElementById("edit-task-form");
  const editModalWindow = document.querySelector("edit-task-modal-window");
  editModalWindow.style.display = show ? 'block' : 'none';
  // Set task details in modal inputs
  // Get button elements from the task modal
  // Call saveTaskChanges upon click of Save Changes button
  // Delete task using a helper function and close the task modal

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}


//remember to call the function saveTaskChanges
function saveTaskChanges(taskId) {
  // Get new user inputs
  const newUserInput = document.getElementById("task-title-input");
  const newUserDescription = document.getElementById("edit-task-description-input");
  const newUserStatus = document.getElementById("edit-select-status");
  // remember to go back here const editTask = patchTask(updatedTaskData);
  
  // Create an object with the updated task details
  const updatedTaskData = {
    title: newUserInput,
    description: newUserDescription,
    state: newUserStatus
    };
  console.log(updatedTaskData);
  // Update task using a helper function
  
  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', () => {
  toggleTheme(); // Call toggleTheme without parentheses
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
