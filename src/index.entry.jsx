// src/index.js - main entry point for Vite build
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { FriendsTripPlanner } from './index.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <FriendsTripPlanner />
  </React.StrictMode>
);