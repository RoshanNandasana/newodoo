import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import CreateEmployee from './pages/CreateEmployee';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import Salary from './pages/Salary';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      
      <Route path="/change-password" element={
        <ProtectedRoute>
          <ChangePassword />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/profile/:id" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/create-employee" element={
        <ProtectedRoute requireAdminOrHR>
          <CreateEmployee />
        </ProtectedRoute>
      } />
      
      <Route path="/attendance" element={
        <ProtectedRoute>
          <Attendance />
        </ProtectedRoute>
      } />
      
      <Route path="/leave" element={
        <ProtectedRoute>
          <Leave />
        </ProtectedRoute>
      } />
      
      <Route path="/salary" element={
        <ProtectedRoute requireAdmin>
          <Salary />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
