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
  addModalWindow: document.getElementById('new-task-modal-window'),
  cancelEditBtn : document.getElementById('cancel-edit-btn'),
  // Filter overlay
  filterDiv: document.getElementById('filterDiv'),
  // Theme switch
  themeSwitch: document.getElementById('switch'),
  editModalWindow : document.querySelector(".edit-task-modal-window"),
  editSelectStatus: document.getElementById("edit-select-status"),
    columnDivs: document.querySelectorAll('.column-div'),//
  clearStorage :  document.getElementById('clear-storage-button')
};
console.log(elements);// trouble shoot'n
//make sure to comeback here, not sure what to do but i have an idea

//clear storage 
function clearLocalStorage() {
  localStorage.clear();
  console.log("Local storage has been cleared.");
  // Optionally, refresh the UI or reinitialize application state
  refreshTasksUI(); // Example: Refresh UI after clearing storage
}


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
  
 console.log("Filtered tasks:", filterAndDisplayTasksByBoard);
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
  //const task = getTasks();
  //console.log(`Task state: ${task.state}`); // Log task state for debugging
  console.log(task);
  const column = document.querySelector(`.column-div[data-status="${task.state}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.state}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }
// Create and add the task element
  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      console.log(elements.editModalWindow);
      toggleModal(false, elements.editTaskModal);
    });
  }
  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false,elements.addModalWindow);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });
  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false, elements.addModalWindow);
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
    toggleModal(true, elements.newTask);
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
function toggleModal(show, modal ) {
  if (show) {
    modal.style.display = 'flex'; // Show the modal
  } else {
    modal.style.display = 'none'; // Hide the modal
  }
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();
  toggleModal(true, elements.addModalWindow)
    // Assign user input to the task object
  // Assign user input to the task object
  
  const titleValue = document.getElementById("title-input").value;
  const descriptionValue = document.getElementById("desc-input").value;
  const statusValue = document.getElementById("select-status").value;
  console.log(statusValue)
 
  // Because of error index.js:145 Column not found for status: undefined i need to check if statusValue appears
  if (!statusValue) {
    console.error('Status value is not defined.');
    return;
  }

  const task = {
    //id: Date.now(), // unique id
    title: titleValue,
    description: descriptionValue,
    state: statusValue, // Ensure this matches your column's data attribute
    board: activeBoard
  };
console.log(task);

const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}

function toggleSidebar(show) {
  const sidebar = elements.sideBar; // kinda redundant because i add it to the top line 28, but makes it easier to reference variables in the functions relevant
  if (show) {
    sidebar.style.display = 'block';
    elements.showSideBarBtn.style.display ='none'; 
    // or add a class to show the sidebar
    
  } else {
    sidebar.style.display = 'none'; // or add a class to hide the sidebar
    elements.showSideBarBtn.style.display ='flex';
  }
}



function toggleTheme() {
  const body = document.body;
  const logo = document.getElementById("logo"); // link logo to theme switch

  // Define the paths to your SVG files for light and dark themes
  const lightThemeLogo = './assets/logo-light.svg';
  const darkThemeLogo = './assets/logo-dark.svg';

  // Toggle theme and update the logo
  const isLightTheme = body.classList.toggle('light-theme');
  logo.src = isLightTheme ? lightThemeLogo : darkThemeLogo; // Swap SVGs based on the theme

  // Save the theme preference
  localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
  // Set the theme on page load based on the saved preference

}
// theme switch works well
//i need to swop logo based on themes
//WOOHOOO ITS WORKS IM SUCH A GENIUS!!!!!!
//no actually its dumb!!!!
//Also sorry for exclaiming in the commit , its past midnight ive been trying to figure it out for almost 14hours 

function openEditTaskModal(task) {
  const editModalWindow = elements.editModalWindow;

  // Set task details in modal inputs
  document.getElementById("edit-task-title-input").value = task.title;
  document.getElementById("edit-task-desc-input").value = task.description;
  const selectedStatus = elements.editSelectStatus.querySelector(`option[value="${task.status}"]`);
  selectedStatus.selected = true;

  toggleModal(true, editModalWindow);

  addEventListenersToModalButtons(task.id, editModalWindow);
}

function addEventListenersToModalButtons(taskId, editModalWindow) {
  const saveButton = document.getElementById("save-task-changes-btn");
  const deleteButton = document.getElementById("delete-task-btn");

  saveButton.addEventListener('click', (event) => {
    event.preventDefault();
    try {
      saveTaskChanges(taskId);
    } catch (error) {
      console.error("Error saving task changes:", error);
    } 
  });

  deleteButton.addEventListener('click', (event) => {
    event.preventDefault();
    try {
    deleteTask(taskId);
    toggleModal(false,editModalWindow);
    } catch (error) {
      console.error("Error saving task changes:", error);
    } 
  });


}
//remember to call the function saveTaskChanges, this is for updates aka patches
function saveTaskChanges(taskId) {
  // Get new user inputs
  const newUserInput = document.getElementById("task-title-input").value;
  const newUserDescription = document.getElementById("edit-task-description-input").value;
  const newUserStatus = document.getElementById("edit-select-status").value;
  // remember to go back here const editTask = patchTask(updatedTaskData);
  
  // Create an object with the updated task details
  const updatedTaskData = {
    title: newUserInput,
    description: newUserDescription,
    state: newUserStatus
    };
  console.log(updatedTaskData);
  // Update task using a helper function
  patchTask(taskId, updatedTaskData)
  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editModalWindow);
  refreshTasksUI();
}



/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', () => {
  toggleTheme(); // Call toggleTheme without parentheses
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
