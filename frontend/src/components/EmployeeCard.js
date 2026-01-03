import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Popover,
  Button,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlightIcon from '@mui/icons-material/Flight';
import CancelIcon from '@mui/icons-material/Cancel';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { attendanceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { emitAttendanceUpdate } from '../utils/attendanceEvents';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function EmployeeCard({ employee, onAttendanceUpdate }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isOwnCard = user?.employee?._id === employee._id;

  const getStatusIcon = () => {
    switch (employee.attendanceStatus) {
      case 'Present':
        return <FiberManualRecordIcon sx={{ color: '#4caf50', fontSize: 20 }} />;
      case 'OnLeave':
        return <FlightIcon sx={{ color: '#2196f3', fontSize: 20 }} />;
      case 'Absent':
        return <FiberManualRecordIcon sx={{ color: '#ff9800', fontSize: 20 }} />;
      default:
        return <FiberManualRecordIcon sx={{ color: '#f44336', fontSize: 20 }} />;
    }
  };

  const getStatusColor = () => {
    switch (employee.attendanceStatus) {
      case 'Present':
        return 'success';
      case 'OnLeave':
        return 'info';
      case 'Absent':
        return 'warning';
      default:
        return 'error';
    }
  };

  const getStatusText = () => {
    switch (employee.attendanceStatus) {
      case 'Present':
        return 'Present';
      case 'OnLeave':
        return 'On Leave';
      case 'Absent':
        return 'Absent';
      default:
        return 'Not Checked In';
    }
  };

  const handleStatusClick = (event) => {
    if (isOwnCard) {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setError('');
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');
    try {
      await attendanceAPI.checkIn();
      handleClose();
      emitAttendanceUpdate(); // Notify all components globally
      if (onAttendanceUpdate) onAttendanceUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError('');
    try {
      await attendanceAPI.checkOut();
      handleClose();
      emitAttendanceUpdate(); // Notify all components globally
      if (onAttendanceUpdate) onAttendanceUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  const getTimeSinceCheckIn = () => {
    if (employee.todayAttendance?.checkInTime) {
      const checkInTime = new Date(employee.todayAttendance.checkInTime);
      return checkInTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    return null;
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Card
        sx={{
          cursor: 'pointer',
          position: 'relative',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6
          }
        }}
        onClick={() => navigate(`/profile/${employee._id}`)}
      >
        {/* Status Indicator at Top-Right */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1
          }}
        >
          <IconButton
            size="small"
            onClick={handleStatusClick}
            sx={{
              bgcolor: 'white',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'white',
                transform: 'scale(1.1)'
              }
            }}
          >
            {getStatusIcon()}
          </IconButton>
        </Box>

        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={employee.profilePicture ? `${API_BASE_URL}${employee.profilePicture}` : ''}
              sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main' }}
            >
              {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
            </Avatar>
            
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {employee.firstName} {employee.lastName}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {employee.position || 'Employee'}
            </Typography>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {employee.department || 'N/A'}
            </Typography>
            
            <Chip
              label={getStatusText()}
              color={getStatusColor()}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Check-In/Check-Out Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          <Typography variant="h6" gutterBottom>
            Attendance
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {employee.attendanceStatus === 'OnLeave' ? (
            <Typography variant="body2" color="textSecondary">
              You are on approved leave today
            </Typography>
          ) : employee.attendanceStatus === 'Present' ? (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Checked in at: {getTimeSinceCheckIn()}
              </Typography>
              {!employee.todayAttendance?.checkOutTime ? (
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={handleCheckOut}
                  disabled={loading}
                  sx={{ mt: 1 }}
                >
                  Check Out
                </Button>
              ) : (
                <Typography variant="body2" color="success.main">
                  ✓ Already checked out for today
                </Typography>
              )}
            </Box>
          ) : (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCheckIn}
              disabled={loading}
            >
              Check In
            </Button>
          )}
        </Box>
      </Popover>
    </>
  );
}

export default EmployeeCard;
