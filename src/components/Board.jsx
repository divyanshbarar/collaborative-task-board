import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, Users } from 'lucide-react';
import Column from './Column';
import Task from './Task';
import UserPresence from './UserPresence';
import { useFirebaseBoard, useBoardActions } from '../hooks/useFirebase';
import { useSelector } from 'react-redux';

const Board = () => {
  const [activeId, setActiveId] = useState(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  
  const { columns, tasks, columnOrder } = useFirebaseBoard();
  const { createColumn, moveTask, reorderTasksInColumn } = useBoardActions();
  const { loading, error } = useSelector(state => state.board);
  const { onlineUsers, totalUsers } = useSelector(state => state.user);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    try {
      await createColumn(newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAddingColumn(false);
    } catch (error) {
      console.error('Failed to add column:', error);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = tasks[activeId];
    if (!isActiveTask) return;

    const sourceColumn = Object.values(columns).find(col => 
      Array.isArray(col.taskIds) && col.taskIds.includes(activeId)
    );

    let destinationColumn;
    
    if (tasks[overId]) {
      destinationColumn = Object.values(columns).find(col =>
        Array.isArray(col.taskIds) && col.taskIds.includes(overId)
      );
    } else {
      destinationColumn = columns[overId];
    }

    if (!sourceColumn || !destinationColumn) return;
    if (sourceColumn.id === destinationColumn.id) return;

    const sourceIndex = sourceColumn.taskIds.indexOf(activeId);
    let destinationIndex;
    
    if (tasks[overId]) {
      destinationIndex = destinationColumn.taskIds.indexOf(overId);
    } else {
      destinationIndex = 0;
    }

    moveTask(
      activeId, 
      sourceColumn.id, 
      destinationColumn.id, 
      sourceIndex, 
      destinationIndex
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = tasks[activeId];
    const isOverTask = tasks[overId];

    if (isActiveTask && isOverTask) {
      const column = Object.values(columns).find(col =>
        Array.isArray(col.taskIds) &&
        col.taskIds.includes(activeId) &&
        col.taskIds.includes(overId)
      );

      if (column) {
        const activeIndex = column.taskIds.indexOf(activeId);
        const overIndex = column.taskIds.indexOf(overId);

        if (activeIndex !== overIndex) {
          const newTaskIds = arrayMove(column.taskIds, activeIndex, overIndex);
          reorderTasksInColumn(column.id, newTaskIds);
        }
      }

      if (!column) {
        return;
      }
    }
  };

  const activeTask = activeId ? tasks[activeId] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">

        <div className="text-center">

        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          
          <p className="mt-4 text-gray-600">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
      <div className="text-center text-red-600">
            <p className="text-xl font-semibold">Error loading board</p>
                <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(columnOrder)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
<div className="flex items-center space-x-4">
<h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
<div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
<Users className="h-3 w-3" />
<span className="text-sm">{totalUsers} online</span>
</div>
          </div>
               <UserPresence users={onlineUsers} />
        </div>
      </header>

      <div className="p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
              >
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  {columnOrder.map((columnId) => {
                    const column = columns[columnId];
                    return column ? (
                      <Column key={column.id} column={column} tasks={tasks} />
                    ) : null;
                  })}
                  
            <div className="w-80 flex-shrink-0">
              {isAddingColumn ? (
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-4">
                  <input
                    type="text"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Column title"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddColumn();
                      } else if (e.key === 'Escape') {
                        setIsAddingColumn(false);
                        setNewColumnTitle('');
                      }
                    }}
                    autoFocus
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex justify-end space-x-2 mt-3">
        <button
          onClick={() => {
            setIsAddingColumn(false);
            setNewColumnTitle('');
          }}
          className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
                             <button
                      onClick={handleAddColumn}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Column
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsAddingColumn(true)}
                            className="w-full h-12 border-dashed border-2 border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 rounded-lg flex items-center justify-center bg-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Column
                          </button>
              )}
            </div>
          </div>

                        <DragOverlay>
                          {activeTask ? <Task task={activeTask} columnId="" /> : null}
                        </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default Board;