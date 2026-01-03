import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Container
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
      fetchEmployees(); // Refresh employee list with updated attendance
    });
    return cleanup;
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeAPI.getWithStatus();
      
      // Fetch today's attendance for each employee
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
              todayAttendance
            };
          } catch (err) {
            return emp;
          }
        })
      );
      
      setEmployees(employeesWithAttendance);
    } catch (err) {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceUpdate = () => {
    fetchEmployees(); // Refresh employee data after attendance update
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navbar />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Employee Directory
        </Typography>
        
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Click on any employee card to view their profile. Click the status indicator to check in/out.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
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
        )}

        {!loading && employees.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="textSecondary">
              No employees found
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Dashboard;
