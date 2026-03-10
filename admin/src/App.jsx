import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './Pages/AdminLogin';
import AdminLayout from './Pages/AdminLayout';
import Dashboard from './Pages/Dashboard';
import ManageEvents from './Pages/ManageEvents';
import ManageTeams from './Pages/ManageTeams';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ManageGallery from './Pages/ManageGallery';
import ViewFeedback from './Pages/ViewFeedback';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-500">
      <ToastContainer />
      <Routes>
        <Route 
          path="/" 
          element={token === '' ? <AdminLogin setToken={setToken} /> : <Navigate to="/admin" />} 
        />

        {/* FIX: Pass setToken to AdminLayout here */}
        {token !== '' && (
          <Route path="/admin" element={<AdminLayout setToken={setToken} />}>
            <Route index element={<Dashboard />} />
            <Route path="events" element={<ManageEvents />} />
            <Route path="teams" element={<ManageTeams />} />
            <Route path="gallery" element={<ManageGallery />} />
            <Route path="feedback" element={<ViewFeedback />} />
          </Route>
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;