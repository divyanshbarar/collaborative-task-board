/* eslint-disable no-useless-catch */
import { 
  ref, 
  push, 
  set, 
  remove, 
  onValue, 
  off, 
  onDisconnect,
  serverTimestamp,
  update
} from 'firebase/database';
import { database } from '../config/firebase';

class FirebaseService {
  constructor() {
    this.boardRef = ref(database, 'board');
    this.usersRef = ref(database, 'users');
    this.presenceRef = ref(database, 'presence');
  }

  async createColumn(column) {
    try {
      const columnRef = ref(database, `board/columns/${column.id}`);
      await set(columnRef, column);
      
      const orderRef = ref(database, 'board/columnOrder');
      const currentOrder = await this.getColumnOrder();
      await set(orderRef, [...currentOrder, column.id]);
      
      return column;
    } catch (error) {
      throw error;
    }
  }

  async updateColumn(columnId, updates) {
    try {
      const columnRef = ref(database, `board/columns/${columnId}`);
      await set(columnRef, updates);
      return updates;
    } catch (error) {
      throw error;
    }
  }

  async deleteColumn(columnId) {
    try {
      const columnRef = ref(database, `board/columns/${columnId}`);
      await remove(columnRef);
      
      const orderRef = ref(database, 'board/columnOrder');
      const currentOrder = await this.getColumnOrder();
      const newOrder = currentOrder.filter(id => id !== columnId);
      await set(orderRef, newOrder);
      
      return columnId;
    } catch (error) {
      throw error;
    }
  }

  async reorderTasksInColumn(columnId, newTaskIds) {
    const columnRef = ref(database, `board/columns/${columnId}/taskIds`);
    await set(columnRef, newTaskIds);
  }

  async createTask(task, columnId) {
    try {
      const taskRef = ref(database, `board/tasks/${task.id}`);
      await set(taskRef, task);
      
      const columnTasksRef = ref(database, `board/columns/${columnId}/taskIds`);
      const currentTasks = await this.getColumnTasks(columnId);
      await set(columnTasksRef, [...currentTasks, task.id]);
      
      return task;
    } catch (error) {
      throw error;
    }
  }

  async updateTask(taskId, updates) {
    try {
      const taskRef = ref(database, `board/tasks/${taskId}`);
      const updatedTask = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      await set(taskRef, updatedTask);
      return updatedTask;
    } catch (error) {
      throw error;
    }
  }

  async deleteTask(taskId, columnId) {
    try {
      const taskRef = ref(database, `board/tasks/${taskId}`);
      await remove(taskRef);
      
      const columnTasksRef = ref(database, `board/columns/${columnId}/taskIds`);
      const currentTasks = await this.getColumnTasks(columnId);
      const newTasks = currentTasks.filter(id => id !== taskId);
      await set(columnTasksRef, newTasks);
      
      return taskId;
    } catch (error) {
      throw error;
    }
  }

  async moveTask(taskId, sourceColumnId, destinationColumnId, sourceIndex, destinationIndex) {
    try {
      const sourceTasks = await this.getColumnTasks(sourceColumnId);
      const destTasks = sourceColumnId === destinationColumnId 
        ? [...sourceTasks] 
        : await this.getColumnTasks(destinationColumnId);
      
      const updatedSourceTasks = sourceTasks.filter((_, index) => index !== sourceIndex);
      
      const updatedDestTasks = [
        ...destTasks.slice(0, destinationIndex),
        taskId,
        ...destTasks.slice(destinationIndex)
      ];
      
      const updates = {};
      updates[`board/columns/${sourceColumnId}/taskIds`] = updatedSourceTasks;
      
      if (sourceColumnId !== destinationColumnId) {
        updates[`board/columns/${destinationColumnId}/taskIds`] = updatedDestTasks;
      }
      
      const dbRef = ref(database);
      await update(dbRef, updates);
      
      return { taskId, sourceColumnId, destinationColumnId };
    } catch (error) {
      throw error;
    }
  }

  async setUserOnline(user) {
    try {
      const userRef = ref(database, `presence/${user.id}`);
      await set(userRef, {
        ...user,
        isOnline: true,
        lastSeen: serverTimestamp()
      });
      
      onDisconnect(userRef).set({
        ...user,
        isOnline: false,
        lastSeen: serverTimestamp()
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  async setUserOffline(user) {
    try {
      const userId = typeof user === 'string' ? user : user?.id;
      if (!userId) throw new Error("Invalid userId");
      const userRef = ref(database, `presence/${userId}`);
      await set(userRef, {
        isOnline: false,
        lastSeen: serverTimestamp()
      });
      return userId;
    } catch (error) {
      throw error;
    }
  }

  subscribeToBoardChanges(callback) {
    onValue(this.boardRef, (snapshot) => {
      const data = snapshot.val();
      callback(data);
    });
  }

  subscribeToPresenceChanges(callback) {
    onValue(this.presenceRef, (snapshot) => {
      const data = snapshot.val() || {};
      callback(data);
    });
  }

  unsubscribeFromBoardChanges() {
    off(this.boardRef);
  }

  unsubscribeFromPresenceChanges() {
    off(this.presenceRef);
  }

  async getColumnOrder() {
    return new Promise((resolve) => {
      const orderRef = ref(database, 'board/columnOrder');
      onValue(orderRef, (snapshot) => {
        const data = snapshot.val() || [];
        resolve(data);
      }, { onlyOnce: true });
    });
  }

  async getColumnTasks(columnId) {
    return new Promise((resolve) => {
      const tasksRef = ref(database, `board/columns/${columnId}/taskIds`);
      onValue(tasksRef, (snapshot) => {
        const data = snapshot.val() || [];
        resolve(data);
      }, { onlyOnce: true });
    });
  }
}

export default new FirebaseService();