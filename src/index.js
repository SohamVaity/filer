import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter } from "react-router-dom";

<HashRouter>
  <App />
</HashRouter>

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
