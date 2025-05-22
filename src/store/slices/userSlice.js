import { createSlice } from '@reduxjs/toolkit';

const generateRandomColor = () => {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'teal'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const generateUserId = () => {
  return `user_${Math.random().toString(36).substr(2, 9)}`;
};

const initialState = {
  currentUser: {
    id: generateUserId(),
    name: `User ${Math.floor(Math.random() * 1000)}`,
    color: generateRandomColor(),
    isOnline: true,
  },
  onlineUsers: {},
  totalUsers: 0,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
      state.totalUsers = Object.keys(action.payload).length;
    },
    addOnlineUser: (state, action) => {
      const user = action.payload;
      state.onlineUsers[user.id] = user;
      state.totalUsers = Object.keys(state.onlineUsers).length;
    },
    removeOnlineUser: (state, action) => {
      const userId = action.payload;
      delete state.onlineUsers[userId];
      state.totalUsers = Object.keys(state.onlineUsers).length;
    },
    updateUserPresence: (state, action) => {
      const { userId, isOnline } = action.payload;
      if (state.onlineUsers[userId]) {
        state.onlineUsers[userId].isOnline = isOnline;
      }
    },
  },
});

export const {
  setCurrentUser,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  updateUserPresence,
} = userSlice.actions;

export default userSlice.reducer;