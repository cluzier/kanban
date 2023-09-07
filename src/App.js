import React, { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import './App.css';

const initialData = {
  columns: {},
  tasks: {},
};

function App() {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the category modal
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [newTaskInput, setNewTaskInput] = useState(''); // State for the new task input
  const [activeColumnId, setActiveColumnId] = useState(null); // Track the active column for adding tasks

  const addCategory = () => {
    const categoryId = `column-${Object.keys(data.columns).length + 1}`;
    const newCategory = {
      id: categoryId,
      title: newCategoryTitle,
      taskIds: [],
    };
    setData((prevData) => ({
      ...prevData,
      columns: {
        ...prevData.columns,
        [categoryId]: newCategory,
      },
    }));
    setIsModalOpen(false); // Close the category modal after adding a category
    setNewCategoryTitle(''); // Clear the input field
  };

  const addTask = () => {
    if (activeColumnId) {
      const taskId = `task-${Object.keys(data.tasks).length + 1}`;
      const newTask = { id: taskId, content: newTaskInput };
      setData((prevData) => {
        const updatedCategory = {
          ...prevData.columns[activeColumnId],
          taskIds: [...prevData.columns[activeColumnId].taskIds, taskId],
        };
        return {
          ...prevData,
          columns: {
            ...prevData.columns,
            [activeColumnId]: updatedCategory,
          },
          tasks: {
            ...prevData.tasks,
            [taskId]: newTask,
          },
        };
      });
      setIsModalOpen(false); // Close the task modal after adding a task
      setNewTaskInput(''); // Clear the input field
    }
    setActiveColumnId(null)
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    setData((prevData) => {
      const sourceColumn = prevData.columns[source.droppableId];
      const destinationColumn = prevData.columns[destination.droppableId];
      const newSourceTaskIds = [...sourceColumn.taskIds];
      const newDestinationTaskIds = [...destinationColumn.taskIds];

      newSourceTaskIds.splice(source.index, 1);
      newDestinationTaskIds.splice(destination.index, 0, draggableId);

      return {
        ...prevData,
        columns: {
          ...prevData.columns,
          [source.droppableId]: {
            ...sourceColumn,
            taskIds: newSourceTaskIds,
          },
          [destination.droppableId]: {
            ...destinationColumn,
            taskIds: newDestinationTaskIds,
          },
        },
      };
    });
  };

  return (
    <div className="App">
      <button className="floating-button modal-button" onClick={() => setIsModalOpen(true)}>
        Add Category
      </button>
      {isModalOpen && ( // Conditional rendering of the category modal
        <div className="modal">
          <div className="modal-content">
            <h2 className="modal-title">Create New Category</h2>
            <input
              type="text"
              className="modal-input"
              placeholder="Category Title"
              value={newCategoryTitle}
              onChange={(e) => setNewCategoryTitle(e.target.value)}
            />
            <button className="modal-button" onClick={addCategory}>
              Create
            </button>
          </div>
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="category-container">
          {Object.values(data.columns).map((column) => (
            <div className="column" key={column.id}>
              <h3 className="category-title">{column.title}</h3>
              {/* Add Task button */}
              <button
                className="add-task-button"
                onClick={() => setActiveColumnId(column.id)}
              >
                +
              </button>
              {activeColumnId === column.id && (
                // Display the task modal when the column is active
                <div className="modal">
                  <div className="modal-content">
                    <h2 className="modal-title">Create New Task</h2>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder={`New task in ${column.title}`}
                      value={newTaskInput}
                      onChange={(e) => setNewTaskInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTaskInput.trim() !== '') {
                          addTask(column.id, newTaskInput);
                        }
                      }}
                    />
                    <button className="modal-button" onClick={addTask}>
                      Create
                    </button>
                  </div>
                </div>
              )}
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    className="task-list"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {column.taskIds.map((taskId, index) => {
                      const task = data.tasks[taskId];
                      return (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="task"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              {task.content}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default App;
