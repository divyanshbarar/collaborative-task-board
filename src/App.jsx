import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import Board from './components/Board';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App min-h-screen bg-gray-50">
        <Board />
      </div>
    </Provider>
  );
}

export default App;