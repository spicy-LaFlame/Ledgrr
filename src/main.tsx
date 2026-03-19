import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { seedDatabase } from './db/seed';

// Seed the database on first load
seedDatabase().then(() => {
  console.log('Database ready');
}).catch((error) => {
  console.error('Failed to seed database:', error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
