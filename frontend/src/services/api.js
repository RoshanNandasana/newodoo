import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  changePassword: (data) => api.post('/auth/change-password', data),
  getProfile: () => api.get('/auth/profile'),
  createEmployee: (data) => api.post('/auth/create-employee', data)
};

// Employee APIs
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getWithStatus: () => api.get('/employees/status'),
  getById: (id) => api.get(`/employees/${id}`),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`)
};

// Attendance APIs
export const attendanceAPI = {
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.post('/attendance/check-out'),
  getMyAttendance: (params) => api.get('/attendance/my-attendance', { params }),
  getAll: (params) => api.get('/attendance/all', { params }),
  getSummary: (employeeId, params) => 
    api.get(`/attendance/summary/${employeeId || ''}`, { params })
};

// Leave APIs
export const leaveAPI = {
  apply: (data) => api.post('/leave/apply', data),
  getMyLeaves: () => api.get('/leave/my-leaves'),
  getBalance: () => api.get('/leave/balance'),
  getAll: (params) => api.get('/leave/all', { params }),
  review: (id, data) => api.put(`/leave/${id}/review`, data)
};

// Salary APIs
export const salaryAPI = {
  get: (employeeId) => api.get(`/salary/${employeeId}`),
  getAll: () => api.get('/salary'),
  createOrUpdate: (data) => api.post('/salary', data),
  calculatePayroll: (data) => api.post('/salary/payroll', data),
  delete: (employeeId) => api.delete(`/salary/${employeeId}`)
};

// Upload APIs
export const uploadAPI = {
  profilePicture: (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return api.post('/upload/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  resume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/upload/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  leaveAttachment: (file) => {
    const formData = new FormData();
    formData.append('attachment', file);
    return api.post('/upload/leave-attachment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default api;
