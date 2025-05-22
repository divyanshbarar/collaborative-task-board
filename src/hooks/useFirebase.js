import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firebaseService from '../services/firebaseService';
import { 
  setBoardData, 
  setLoading, 
  setError 
} from '../store/slices/boardSlice';
import { 
  setOnlineUsers, 
  setCurrentUser 
} from '../store/slices/userSlice';

export const useFirebaseBoard = () => {
  const dispatch = useDispatch();
  const { columns, tasks, columnOrder } = useSelector(state => state.board);
  const currentUser = useSelector(state => state.user.currentUser);

  useEffect(() => {
    dispatch(setLoading(true));

    const setupSubscriptions = async () => {
      try {
        firebaseService.subscribeToBoardChanges((data) => {
          if (data) {
            dispatch(setBoardData({
              columns: data.columns || {},
              tasks: data.tasks || {},
              columnOrder: data.columnOrder || []
            }));
          }
          dispatch(setLoading(false));
        });

        firebaseService.subscribeToPresenceChanges((presenceData) => {
          dispatch(setOnlineUsers(presenceData));
        });

        await firebaseService.setUserOnline(currentUser);
      } catch (error) {
        dispatch(setError(error.message));
        dispatch(setLoading(false));
      }
    };

    setupSubscriptions();

    return () => {
      firebaseService.unsubscribeFromBoardChanges();
      firebaseService.unsubscribeFromPresenceChanges();
      firebaseService.setUserOffline(currentUser).catch(console.error);
    };
  }, [dispatch, currentUser]);

  return {
    columns,
    tasks,
    columnOrder,
  };
};

export const useBoardActions = () => {
  const dispatch = useDispatch();

  const createColumn = async (title) => {
    try {
      const column = {
        id: `column_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        taskIds: [],
        createdAt: new Date().toISOString(),
      };
      
      await firebaseService.createColumn(column);
      return column;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  };

  const updateColumn = async (columnId, title) => {
    try {
      const updates = {
        id: columnId,
        title,
        taskIds: [],
        updatedAt: new Date().toISOString(),
      };
      
      await firebaseService.updateColumn(columnId, updates);
      return updates;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  };

  const deleteColumn = async (columnId) => {
    try {
      await firebaseService.deleteColumn(columnId);
      return columnId;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  };

  const createTask = async (columnId, title, description = '') => {
    try {
      const task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await firebaseService.createTask(task, columnId);
      return task;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  };

  const updateTask = async (taskId, title, description) => {
    try {
      const updates = {
        id: taskId,
        title,
        description,
        updatedAt: new Date().toISOString(),
      };
      
      await firebaseService.updateTask(taskId, updates);
      return updates;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  };

  const deleteTask = async (taskId, columnId) => {
    try {
      await firebaseService.deleteTask(taskId, columnId);
      return taskId;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  };

  const reorderTasksInColumn = async (columnId, newTaskIds) => {
    try {
      await firebaseService.reorderTasksInColumn(columnId, newTaskIds);
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  };

  const moveTask = async (taskId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex) => {
    try {
      await firebaseService.moveTask(taskId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex);
      return { taskId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex };
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  };

  return {
    createColumn,
    updateColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    reorderTasksInColumn,
    moveTask,
  };
};