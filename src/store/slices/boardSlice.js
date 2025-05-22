import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  columns: {},
  tasks: {},
  columnOrder: [],
  loading: false,
  error: null,
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setBoardData: (state, action) => {
      const { columns, tasks, columnOrder } = action.payload;
      state.columns = columns || {};
      state.tasks = tasks || {};
      state.columnOrder = columnOrder || [];
    },
    addColumn: (state, action) => {
      const column = action.payload;
      state.columns[column.id] = column;
      state.columnOrder.push(column.id);
    },
    updateColumn: (state, action) => {
      const { id, title } = action.payload;
      if (state.columns[id]) {
        state.columns[id].title = title;
      }
    },
    deleteColumn: (state, action) => {
      const columnId = action.payload;
      const taskIds = state.columns[columnId]?.taskIds || [];
      taskIds.forEach(taskId => {
        delete state.tasks[taskId];
      });
      delete state.columns[columnId];
      state.columnOrder = state.columnOrder.filter(id => id !== columnId);
    },
    addTask: (state, action) => {
      const { task, columnId } = action.payload;
      state.tasks[task.id] = task;
      if (state.columns[columnId]) {
        state.columns[columnId].taskIds.push(task.id);
      }
    },
    updateTask: (state, action) => {
      const { id, title, description } = action.payload;
      if (state.tasks[id]) {
        state.tasks[id].title = title;
        state.tasks[id].description = description;
        state.tasks[id].updatedAt = new Date().toISOString();
      }
    },
    deleteTask: (state, action) => {
      const taskId = action.payload;
      Object.keys(state.columns).forEach(columnId => {
        state.columns[columnId].taskIds = state.columns[columnId].taskIds.filter(
          id => id !== taskId
        );
      });
      delete state.tasks[taskId];
    },
    moveTask: (state, action) => {
      const { taskId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex } = action.payload;
      
      if (state.columns[sourceColumnId]) {
        state.columns[sourceColumnId].taskIds.splice(sourceIndex, 1);
      }
      
      if (state.columns[destinationColumnId]) {
        state.columns[destinationColumnId].taskIds.splice(destinationIndex, 0, taskId);
      }
    },
    reorderColumns: (state, action) => {
      state.columnOrder = action.payload;
    },
    reorderTasks: (state, action) => {
      const { columnId, taskIds } = action.payload;
      if (state.columns[columnId]) {
        state.columns[columnId].taskIds = taskIds;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setBoardData,
  addColumn,
  updateColumn,
  deleteColumn,
  addTask,
  updateTask,
  deleteTask,
  moveTask,
  reorderColumns,
  reorderTasks,
} = boardSlice.actions;

export default boardSlice.reducer;