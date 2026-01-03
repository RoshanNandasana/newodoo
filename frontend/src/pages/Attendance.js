import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab
} from '@mui/material';
import Navbar from '../components/Navbar';
import { attendanceAPI, employeeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { onAttendanceUpdate } from '../utils/attendanceEvents';

function Attendance() {
  const [myAttendance, setMyAttendance] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [tabValue, setTabValue] = useState(0);
  const { isAdminOrHR } = useAuth();

  useEffect(() => {
    if (isAdminOrHR && tabValue === 0) {
      fetchDayWiseAttendance();
    } else {
      fetchMyAttendance();
      fetchSummary();
    }
  }, [selectedDate, selectedMonth, selectedYear, tabValue]);

  // Listen for global attendance updates
  useEffect(() => {
    const cleanup = onAttendanceUpdate(() => {
      if (isAdminOrHR && tabValue === 0) {
        fetchDayWiseAttendance();
      } else {
        fetchMyAttendance();
        fetchSummary();
      }
    });
    return cleanup;
  }, [isAdminOrHR, tabValue]);

  const fetchDayWiseAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await attendanceAPI.getAll({ date: selectedDate });
      setAllAttendance(response.data);
    } catch (err) {
      setError('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await attendanceAPI.getMyAttendance({
        month: selectedMonth,
        year: selectedYear
      });
      setMyAttendance(response.data);
    } catch (err) {
      setError('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await attendanceAPI.getSummary(null, {
        month: selectedMonth,
        year: selectedYear
      });
      setSummary(response.data);
    } catch (err) {
      console.log('Failed to load summary');
    }
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric' 
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navbar />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Attendance Management
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {isAdminOrHR && (
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="Day-wise Attendance (All Employees)" />
              <Tab label="My Attendance" />
            </Tabs>
          </Paper>
        )}

        {/* Admin/HR Day-wise View */}
        {isAdminOrHR && tabValue === 0 ? (
          <>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Select Date
              </Typography>
              <TextField
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                sx={{ minWidth: 200 }}
                InputLabelProps={{ shrink: true }}
              />
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Attendance for {formatDate(selectedDate)}
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'primary.main' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Employee Name</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Check-In Time</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Check-Out Time</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Work Hours</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Extra Hours</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allAttendance.map((record) => (
                        <TableRow key={record._id} hover>
                          <TableCell>
                            {record.employee?.firstName} {record.employee?.lastName}
                          </TableCell>
                          <TableCell>{record.employee?.email || '-'}</TableCell>
                          <TableCell>{formatTime(record.checkInTime)}</TableCell>
                          <TableCell>{formatTime(record.checkOutTime)}</TableCell>
                          <TableCell>{record.workHours?.toFixed(2) || '0.00'} hrs</TableCell>
                          <TableCell>{record.extraHours?.toFixed(2) || '0.00'} hrs</TableCell>
                          <TableCell>
                            <Chip
                              label={record.status}
                              color={
                                record.status === 'Present' ? 'success' :
                                record.status === 'OnLeave' ? 'info' : 'warning'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {!loading && allAttendance.length === 0 && (
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', p: 4 }}>
                  No attendance records found for this date
                </Typography>
              )}
            </Paper>
          </>
        ) : (
          /* Employee Month-wise View */
          <>
            {/* Monthly Summary */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Summary
              </Typography>
              
              {summary ? (
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={4} md={2}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {summary.totalDays}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Days
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {summary.presentDays}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Present
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold" color="error.main">
                        {summary.absentDays}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Absent
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold" color="info.main">
                        {summary.leaveDays}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Leave Days
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold">
                        {summary.totalWorkHours?.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Work Hours
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold" color="warning.main">
                        {summary.totalExtraHours?.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Extra Hours
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  Loading summary...
                </Typography>
              )}
            </Paper>

            {/* Filter Section */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Select Month
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    label="Month"
                  >
                    {[...Array(12)].map((_, i) => (
                      <MenuItem key={i} value={i + 1}>
                        {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    label="Year"
                  >
                    {[2023, 2024, 2025, 2026].map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Paper>

            {/* My Attendance Table */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                My Attendance Records - {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'primary.main' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Check-In</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Check-Out</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Work Hours</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Extra Hours</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {myAttendance.map((record) => (
                        <TableRow key={record._id} hover>
                          <TableCell>{formatDate(record.date)}</TableCell>
                          <TableCell>{formatTime(record.checkInTime)}</TableCell>
                          <TableCell>{formatTime(record.checkOutTime)}</TableCell>
                          <TableCell>{record.workHours?.toFixed(2) || '0.00'} hrs</TableCell>
                          <TableCell>{record.extraHours?.toFixed(2) || '0.00'} hrs</TableCell>
                          <TableCell>
                            <Chip
                              label={record.status}
                              color={
                                record.status === 'Present' ? 'success' :
                                record.status === 'OnLeave' ? 'info' : 'warning'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {!loading && myAttendance.length === 0 && (
                <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', p: 4 }}>
                  No attendance records found for this period
                </Typography>
              )}
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
}

export default Attendance;
