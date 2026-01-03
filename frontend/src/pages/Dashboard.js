import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Container,
  Paper,
  alpha,
  Button
} from '@mui/material';
import Navbar from '../components/Navbar';
import EmployeeCard from '../components/EmployeeCard';
import { employeeAPI, attendanceAPI } from '../services/api';
import { onAttendanceUpdate } from '../utils/attendanceEvents';

function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Listen for global attendance updates
  useEffect(() => {
    const cleanup = onAttendanceUpdate(() => {
      fetchEmployees();
    });
    return cleanup;
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeAPI.getWithStatus();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const employeesWithAttendance = await Promise.all(
        response.data.map(async (emp) => {
          try {
            const attendanceResponse = await attendanceAPI.getAll({
              employeeId: emp._id,
              date: today.toISOString().split('T')[0]
            });
            
            const todayAttendance = attendanceResponse.data.find(a => 
              new Date(a.date).toDateString() === today.toDateString()
            );
            
            return {
              ...emp,
              todayAttendance,
              attendanceStatus: todayAttendance?.status || emp.attendanceStatus || 'NotCheckedIn'
            };
          } catch (err) {
            return {
              ...emp,
              attendanceStatus: emp.attendanceStatus || 'NotCheckedIn'
            };
          }
        })
      );
      
      setEmployees(employeesWithAttendance);
      setError('');
    } catch (err) {
      setError('Failed to load employees. Please refresh the page or try again later.');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceUpdate = () => {
    fetchEmployees();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Navbar />
      
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="600" color="#2c3e50" gutterBottom>
            Employee Directory
          </Typography>
          <Typography variant="body1" color="#666666" sx={{ mb: 3, maxWidth: '800px' }}>
            Manage and monitor your team's attendance and information. Click on any card to view employee details.
            You can update your own attendance status by clicking the status chip on your card.
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: '8px',
              border: '1px solid #f5c6cb'
            }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={fetchEmployees}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px',
            flexDirection: 'column'
          }}>
            <CircularProgress 
              size={60} 
              sx={{ 
                color: '#714B67', 
                mb: 3 
              }} 
            />
            <Typography variant="body1" color="#666666">
              Loading employee directory...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Employee Grid Header */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 4,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Typography variant="h5" fontWeight="600" color="#2c3e50">
                All Employees ({employees.length})
              </Typography>
              <Typography variant="body2" color="#666666" sx={{ fontSize: '14px' }}>
                {employees.length} employees • Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Typography>
            </Box>

            {/* Employee Grid */}
            <Grid container spacing={3}>
              {employees.map((employee) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={employee._id}>
                  <EmployeeCard 
                    employee={employee} 
                    onAttendanceUpdate={handleAttendanceUpdate}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Empty State */}
            {employees.length === 0 && !loading && (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                mt: 4
              }}>
                <Typography variant="h6" color="#666666" gutterBottom sx={{ mb: 1 }}>
                  No employees found
                </Typography>
                <Typography variant="body2" color="#999999" sx={{ mb: 3 }}>
                  Add employees to get started with Dayflow
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

export default Dashboard;
