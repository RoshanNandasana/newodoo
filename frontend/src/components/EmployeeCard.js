import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
  Button,
  Popover,
  Alert,
  alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  FiberManualRecord,
  FlightTakeoff,
  ArrowForward,
  Work,
  CorporateFare,
  AccessTime
} from '@mui/icons-material';
import { attendanceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { emitAttendanceUpdate } from '../utils/attendanceEvents';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function EmployeeCard({ employee, onAttendanceUpdate }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isOwnCard = user?.employee?._id === employee._id;

  const getStatusInfo = () => {
    const status = employee.attendanceStatus || 'NotCheckedIn';
    const info = {
      Present: { 
        color: '#4caf50', 
        icon: <FiberManualRecord />, 
        label: 'Present', 
        bgColor: '#e8f5e9' 
      },
      OnLeave: { 
        color: '#2196f3', 
        icon: <FlightTakeoff />, 
        label: 'On Leave', 
        bgColor: '#e3f2fd' 
      },
      Absent: { 
        color: '#ff9800', 
        icon: <FiberManualRecord />, 
        label: 'Absent', 
        bgColor: '#fff3e0' 
      },
      NotCheckedIn: { 
        color: '#f44336', 
        icon: <FiberManualRecord />, 
        label: 'Not Checked In', 
        bgColor: '#ffebee' 
      }
    };
    return info[status] || info.NotCheckedIn;
  };

  const statusInfo = getStatusInfo();

  const handleStatusClick = (event) => {
    if (isOwnCard) {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setError('');
    setSuccess('');
  };

  const handleViewProfile = (event) => {
    event.stopPropagation();
    navigate(`/profile/${employee._id}`);
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
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          overflow: 'visible',
          position: 'relative',
          border: '1px solid #e0e0e0',
          backgroundColor: '#ffffff',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
            borderColor: alpha('#714B67', 0.3),
            '& .view-profile-btn': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
      >
        {/* Status Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: 16,
            zIndex: 2
          }}
        >
          <Chip
            icon={statusInfo.icon}
            label={statusInfo.label}
            size="small"
            sx={{
              backgroundColor: statusInfo.bgColor,
              color: statusInfo.color,
              border: `1px solid ${alpha(statusInfo.color, 0.3)}`,
              fontWeight: 500,
              fontSize: '12px',
              height: '28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              cursor: isOwnCard ? 'pointer' : 'default',
              '& .MuiChip-icon': {
                color: statusInfo.color,
                fontSize: '16px'
              },
              '&:hover': isOwnCard ? {
                backgroundColor: alpha(statusInfo.color, 0.1),
                transform: 'scale(1.05)'
              } : {}
            }}
            onClick={handleStatusClick}
          />
        </Box>

        {/* Card Content */}
        <CardContent sx={{ 
          p: 3, 
          pt: 4, 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Avatar */}
          <Box
            sx={{
              position: 'relative',
              mb: 3
            }}
          >
            <Avatar
              src={employee.profilePicture ? `${API_BASE_URL}${employee.profilePicture}` : ''}
              sx={{ 
                width: 88, 
                height: 88,
                backgroundColor: '#714B67',
                fontSize: '28px',
                fontWeight: 600,
                border: '4px solid #ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            >
              {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
            </Avatar>
          </Box>

          {/* Employee Name */}
          <Typography
            variant="h6"
            fontWeight="600"
            color="#2c3e50"
            align="center"
            gutterBottom
            sx={{
              lineHeight: 1.3,
              fontSize: '18px',
              mb: 1
            }}
          >
            {employee.firstName} {employee.lastName}
          </Typography>

          {/* Position */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Work sx={{ fontSize: 16, color: '#666666', mr: 1, opacity: 0.8 }} />
            <Typography
              variant="body2"
              color="#666666"
              sx={{
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              {employee.position || 'Employee'}
            </Typography>
          </Box>

          {/* Department */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CorporateFare sx={{ fontSize: 16, color: '#666666', mr: 1, opacity: 0.8 }} />
            <Typography
              variant="body2"
              color="#666666"
              sx={{
                fontSize: '14px'
              }}
            >
              {employee.department || 'Department'}
            </Typography>
          </Box>

          {/* Check-in time */}
          {employee.todayAttendance?.checkInTime && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              p: 1,
              mt: 'auto',
              width: '100%',
              justifyContent: 'center'
            }}>
              <AccessTime sx={{ fontSize: 14, color: '#666666', mr: 1, opacity: 0.8 }} />
              <Typography variant="caption" color="#666666">
                Checked in: {getTimeSinceCheckIn()}
              </Typography>
            </Box>
          )}

          {/* View Profile Button */}
          <Box sx={{ mt: 'auto', pt: 2, width: '100%' }}>
            <Button
              fullWidth
              variant="outlined"
              endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
              onClick={handleViewProfile}
              className="view-profile-btn"
              sx={{
                opacity: 0,
                transform: 'translateY(10px)',
                transition: 'all 0.3s ease',
                borderColor: '#714B67',
                color: '#714B67',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '8px',
                py: 1,
                '&:hover': {
                  backgroundColor: alpha('#714B67', 0.04),
                  borderColor: '#5d3d54'
                }
              }}
            >
              View Profile
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Attendance Popover */}
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
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: '280px',
            border: '1px solid #e0e0e0',
            overflow: 'visible',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: '-8px',
              right: '20px',
              transform: 'rotate(45deg)',
              width: '16px',
              height: '16px',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e0e0e0',
              borderLeft: '1px solid #e0e0e0'
            }
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="600" color="#2c3e50" gutterBottom sx={{ fontSize: '16px' }}>
            Update Attendance
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                borderRadius: '8px',
                fontSize: '13px'
              }}
            >
              {error}
            </Alert>
          )}

          {statusInfo.label === 'On Leave' ? (
            <Typography variant="body2" color="#666666" sx={{ mb: 2, lineHeight: 1.6 }}>
              You are on approved leave today.
            </Typography>
          ) : statusInfo.label === 'Present' ? (
            <Box>
              <Box sx={{ 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px', 
                p: 2, 
                mb: 3 
              }}>
                <Typography variant="caption" color="#666666" sx={{ mb: 0.5, display: 'block' }}>
                  Checked in at
                </Typography>
                <Typography variant="h6" fontWeight="600" color="#2c3e50" sx={{ fontSize: '20px' }}>
                  {getTimeSinceCheckIn()}
                </Typography>
              </Box>
              {!employee.todayAttendance?.checkOutTime ? (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCheckOut}
                  disabled={loading}
                  sx={{
                    backgroundColor: '#714B67',
                    color: '#ffffff',
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    py: 1.5,
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: '#5d3d54',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {loading ? 'Processing...' : 'Check Out'}
                </Button>
              ) : (
                <Alert severity="info" sx={{ borderRadius: '8px' }}>
                  Already checked out for today
                </Alert>
              )}
            </Box>
          ) : (
            <Button
              variant="contained"
              fullWidth
              onClick={handleCheckIn}
              disabled={loading}
              sx={{
                backgroundColor: '#714B67',
                color: '#ffffff',
                textTransform: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                py: 1.5,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#5d3d54',
                  boxShadow: 'none'
                }
              }}
            >
              {loading ? 'Checking In...' : 'Check In Now'}
            </Button>
          )}
        </Box>
      </Popover>
    </>
  );
}

export default EmployeeCard;
