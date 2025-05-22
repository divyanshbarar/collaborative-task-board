import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, Edit3, Trash2, X } from 'lucide-react';
import Task from './Task';
import { useBoardActions } from '../hooks/useFirebase';

const Column = ({ column, tasks }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [editColumnTitle, setEditColumnTitle] = useState(column.title);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  
  const { createTask, updateColumn, deleteColumn } = useBoardActions();
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const columnTasks = column.taskIds?.map(taskId => tasks[taskId]).filter(Boolean);

  const handleAddTask = async () => {
    
    if (!newTaskTitle.trim()) return;

    try {
      await createTask(column.id, newTaskTitle.trim(), newTaskDescription.trim());
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsAddingTask(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateColumn = async () => {
    if (!editColumnTitle.trim()) return;
    try {
      await updateColumn(column.id, editColumnTitle.trim());
      setIsEditingColumn(false);
      setIsColumnDialogOpen(false);
    } catch (error) {
      console.error('Failed to update column:', error);
    }
  };

  const handleDeleteColumn = async () => {
    try {
      await deleteColumn(column.id);
      setIsColumnDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete column:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditColumnTitle(column.title);
    setIsEditingColumn(false);
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    } else if (e.key === 'Escape') {
      if (action === handleAddTask) {
        setIsAddingTask(false);
        setNewTaskTitle('');
        setNewTaskDescription('');
      } else if (action === handleUpdateColumn) {
        handleCancelEdit();
      }
    }
  };

  return (
    <>
      <div ref={setNodeRef}className={`w-80 h-fit max-h-96 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm ${isOver ? 'ring-2 ring-blue-400' : ''}`}>
        <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-gray-800">{column.title}</h2>
      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
        {columnTasks?.length}
      </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsAddingTask(true)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              >
                <Plus className="h-4 w-4" />
              </button>
                          <button
                            onClick={() => setIsColumnDialogOpen(true)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {isAddingTask && (
            <div className="mb-3 border-2 border-dashed border-blue-300 rounded-lg p-3">
              <div className="space-y-2">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Task title"
                        onKeyDown={(e) => handleKeyPress(e, handleAddTask)}
                        autoFocus
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleAddTask();
                    } else if (e.key === 'Escape') {
                      setIsAddingTask(false);
                      setNewTaskTitle('');
                      setNewTaskDescription('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex justify-end space-x-2">
        <button
          onClick={() => {
            setIsAddingTask(false);
            setNewTaskTitle('');
            setNewTaskDescription('');
          }}
          className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
                  <button
                    onClick={handleAddTask}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {Array.isArray(column?.taskIds) && column.taskIds.length > 0 ? (
            <SortableContext
              items={column.taskIds}
              strategy={verticalListSortingStrategy}
            >
              {Array.isArray(column.taskIds) && column.taskIds
                .map(taskId => tasks[taskId])
                .filter(task => task)
                .map((task) => (
                  <Task 
                    key={`${task.id}_${column.id}`}
                    task={task} 
                    columnId={column.id} 
                  />
                ))
              }
            </SortableContext>
          ) : (
            <div className="text-gray-400 text-sm p-2">No tasks</div>
          )}
          
          {!isAddingTask && columnTasks?.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <p className="text-sm">No tasks yet</p>
              <button
                onClick={() => setIsAddingTask(true)}
                className="mt-2 px-3 py-1 text-sm text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first task
              </button>
            </div>
                          )}
                        </div>
                      </div>

                      {isColumnDialogOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="flex items-center justify-between mb-4">
                              <h2 className="text-lg font-semibold">Column Settings</h2>
                              <button
                                onClick={() => setIsColumnDialogOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Column Title</label>
                <input
                  type="text"
                  value={editColumnTitle}
                  onChange={(e) => setEditColumnTitle(e.target.value)}
                  placeholder="Column title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-between">
                <button
                  onClick={handleDeleteColumn}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Column
                </button>
                <div className="space-x-2">
                  <button
                    onClick={() => setIsColumnDialogOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                                </button>
                                <button
                                  onClick={handleUpdateColumn}
                                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Update
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
        </div>
      )}
    </>
  );
};

export default Column;