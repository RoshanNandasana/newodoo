import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  IconButton,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Popover,
  Badge,
  Chip
} from '@mui/material';
import Alert from '@mui/material/Alert';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import LoginIcon from '@mui/icons-material/Login';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import FlightIcon from '@mui/icons-material/Flight';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaidIcon from '@mui/icons-material/Paid';
import { attendanceAPI } from '../services/api';
import { emitAttendanceUpdate } from '../utils/attendanceEvents';

function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [attendanceAnchorEl, setAttendanceAnchorEl] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('NotCheckedIn');
  const [checkInTime, setCheckInTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdminOrHR } = useAuth();

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const response = await attendanceAPI.getMyAttendance({
        month: today.getMonth() + 1,
        year: today.getFullYear()
      });
      
      const todayRecord = response.data.find(record => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() === today.toDateString();
      });

      if (todayRecord) {
        if (todayRecord.status === 'OnLeave') {
          setAttendanceStatus('OnLeave');
          setCheckInTime(null);
        } else if (todayRecord.checkInTime && !todayRecord.checkOutTime) {
          setAttendanceStatus('Present');
          setCheckInTime(new Date(todayRecord.checkInTime));
        } else if (todayRecord.checkInTime && todayRecord.checkOutTime) {
          setAttendanceStatus('Present'); // Still present but checked out
          setCheckInTime(new Date(todayRecord.checkInTime));
        } else if (todayRecord.status === 'Absent') {
          setAttendanceStatus('Absent');
          setCheckInTime(null);
        } else {
          setAttendanceStatus('NotCheckedIn');
          setCheckInTime(null);
        }
      } else {
        setAttendanceStatus('NotCheckedIn');
        setCheckInTime(null);
      }
    } catch (err) {
      console.log('Failed to fetch attendance');
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setAttendanceMessage({ type: '', text: '' });
    try {
      await attendanceAPI.checkIn();
      setAttendanceStatus('Present');
      setCheckInTime(new Date());
      handleAttendanceClose();
      emitAttendanceUpdate(); // Notify all components
      setAttendanceMessage({ type: 'success', text: 'Checked in successfully' });
    } catch (err) {
      setAttendanceMessage({ type: 'error', text: err.response?.data?.error || 'Check-in failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setAttendanceMessage({ type: '', text: '' });
    try {
      await attendanceAPI.checkOut();
      await fetchTodayAttendance();
      handleAttendanceClose();
      emitAttendanceUpdate(); // Notify all components
      setAttendanceMessage({ type: 'success', text: 'Checked out successfully' });
    } catch (err) {
      setAttendanceMessage({ type: 'error', text: err.response?.data?.error || 'Check-out failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (attendanceStatus) {
      case 'Present':
        return '#4caf50'; // Green
      case 'OnLeave':
        return '#2196f3'; // Blue (Airplane icon)
      case 'Absent':
        return '#ff9800'; // Yellow
      default:
        return '#f44336'; // Red
    }
  };

  const getStatusLabel = () => {
    switch (attendanceStatus) {
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

  const getStatusIcon = () => {
    if (attendanceStatus === 'OnLeave') {
      return <FlightIcon sx={{ color: '#2196f3', fontSize: 28 }} />;
    }
    return <FiberManualRecordIcon sx={{ color: getStatusColor(), fontSize: 28 }} />;
  };

  const handleAttendanceClick = (event) => {
    setAttendanceAnchorEl(event.currentTarget);
    setAttendanceMessage({ type: '', text: '' });
  };

  const handleAttendanceClose = () => {
    setAttendanceAnchorEl(null);
    setAttendanceMessage({ type: '', text: '' });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMyProfile = () => {
    navigate(`/profile/${user?.employee?._id}`);
    handleMenuClose();
  };

  const getTabValue = () => {
    if (location.pathname === '/dashboard') return 0;
    if (location.pathname === '/attendance') return 1;
    if (location.pathname === '/leave') return 2;
    if (location.pathname === '/salary') return 3;
    return false;
  };

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  return (
    <AppBar 
      position="static" 
      elevation={1}
      sx={{ 
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0'
      }}
    >
      <Toolbar sx={{ minHeight: '72px', px: { xs: 2, md: 3 } }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 6 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              backgroundColor: '#714B67',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2.5,
              boxShadow: '0 2px 8px rgba(113, 75, 103, 0.2)'
            }}
          >
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '20px' }}>
              D
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: '#2c3e50',
              fontSize: '1.4rem',
              letterSpacing: '-0.3px'
            }}
          >
            Dayflow
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Tabs 
          value={getTabValue()} 
          sx={{ 
            flexGrow: 1,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '15px',
              fontWeight: 500,
              minHeight: '52px',
              minWidth: '120px',
              color: '#666666',
              mx: 0.5,
              '&.Mui-selected': {
                color: '#714B67',
                fontWeight: 600
              },
              '&:hover': {
                backgroundColor: 'rgba(113, 75, 103, 0.04)',
                borderRadius: '6px'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#714B67',
              height: '3px',
              borderRadius: '3px'
            }
          }}
        >
          <Tab 
            icon={<DashboardIcon sx={{ fontSize: 22, mr: 1.5 }} />} 
            iconPosition="start" 
            label="Dashboard" 
            onClick={() => navigate('/dashboard')} 
          />
          <Tab 
            icon={<CalendarTodayIcon sx={{ fontSize: 22, mr: 1.5 }} />} 
            iconPosition="start" 
            label="Attendance" 
            onClick={() => navigate('/attendance')} 
          />
          <Tab 
            icon={<FlightIcon sx={{ fontSize: 22, mr: 1.5 }} />} 
            iconPosition="start" 
            label="Time Off" 
            onClick={() => navigate('/leave')} 
          />
          {user?.role === 'Admin' && (
            <Tab 
              icon={<PaidIcon sx={{ fontSize: 22, mr: 1.5 }} />} 
              iconPosition="start" 
              label="Salary" 
              onClick={() => navigate('/salary')} 
            />
          )}
        </Tabs>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mr: 4 }}>
          {isAdminOrHR && (
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 22 }} />}
              onClick={() => navigate('/create-employee')}
              sx={{
                backgroundColor: '#714B67',
                color: '#ffffff',
                textTransform: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 500,
                px: 3.5,
                py: 1.25,
                boxShadow: '0 2px 8px rgba(113, 75, 103, 0.25)',
                transition: 'all 0.2s ease',
                minHeight: '44px',
                '&:hover': {
                  backgroundColor: '#5d3d54',
                  boxShadow: '0 4px 12px rgba(113, 75, 103, 0.35)',
                  transform: 'translateY(-1px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                }
              }}
            >
              Add Employee
            </Button>
          )}

          {/* Attendance Status Chip - Only for Employees */}
          {user?.role !== 'Admin' && (
            <Chip
              icon={getStatusIcon()}
              label={getStatusLabel()}
              onClick={handleAttendanceClick}
              sx={{
                backgroundColor: `${getStatusColor()}15`,
                color: getStatusColor(),
                border: `2px solid ${getStatusColor()}40`,
                borderRadius: '24px',
                fontWeight: 500,
                fontSize: '14px',
                height: '42px',
                padding: '0 16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: `${getStatusColor()}25`,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${getStatusColor()}20`
                },
                '& .MuiChip-icon': {
                  color: getStatusColor(),
                  ml: 1,
                  fontSize: '22px'
                },
                '& .MuiChip-label': {
                  px: 1.5,
                  fontSize: '14px',
                  fontWeight: 500
                }
              }}
            />
          )}
        </Box>

        {/* Attendance Popover */}
        <Popover
          open={Boolean(attendanceAnchorEl)}
          anchorEl={attendanceAnchorEl}
          onClose={handleAttendanceClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          PaperProps={{
            sx: {
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              minWidth: '320px',
              overflow: 'visible',
              border: '1px solid #e0e0e0',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: '-9px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: '18px',
                height: '18px',
                backgroundColor: '#ffffff',
                borderTop: '1px solid #e0e0e0',
                borderLeft: '1px solid #e0e0e0'
              }
            }
          }}
        >
          <Box sx={{ p: 3.5 }}>
            {attendanceMessage.text && (
              <Alert 
                severity={attendanceMessage.type === 'error' ? 'error' : 'success'}
                sx={{ mb: 2.5, borderRadius: '10px' }}
              >
                {attendanceMessage.text}
              </Alert>
            )}

            {/* Status Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3.5 }}>
              <Box sx={{ 
                backgroundColor: `${getStatusColor()}15`,
                borderRadius: '50%',
                p: 2,
                mr: 2.5
              }}>
                {React.cloneElement(getStatusIcon(), { 
                  sx: { 
                    color: getStatusColor(),
                    fontSize: 28
                  } 
                })}
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '13px' }}>
                  Today's Status
                </Typography>
                <Typography variant="h6" fontWeight="600" color={getStatusColor()} sx={{ fontSize: '18px' }}>
                  {getStatusLabel()}
                </Typography>
              </Box>
            </Box>

            {attendanceStatus === 'OnLeave' && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, fontSize: '14px', lineHeight: 1.6 }}>
                You are on approved leave today. Enjoy your time off!
              </Typography>
            )}

            {attendanceStatus === 'Present' && checkInTime && (
              <>
                <Box sx={{ 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '10px', 
                  p: 2.5, 
                  mb: 3.5 
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '13px' }}>
                    Checked in at
                  </Typography>
                  <Typography variant="h6" fontWeight="600" color="#2c3e50" sx={{ fontSize: '20px' }}>
                    {checkInTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleCheckOut}
                  disabled={loading}
                  startIcon={<LogoutOutlinedIcon sx={{ fontSize: 22 }} />}
                  sx={{
                    borderColor: '#dc3545',
                    color: '#dc3545',
                    textTransform: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 500,
                    py: 1.75,
                    minHeight: '48px',
                    borderWidth: '2px',
                    '&:hover': {
                      backgroundColor: '#dc354510',
                      borderColor: '#dc3545',
                      borderWidth: '2px'
                    }
                  }}
                >
                  {loading ? 'Processing...' : 'Check Out'}
                </Button>
              </>
            )}

            {(attendanceStatus === 'NotCheckedIn' || attendanceStatus === 'Absent') && (
              <Button
                fullWidth
                variant="contained"
                onClick={handleCheckIn}
                disabled={loading}
                startIcon={<LoginIcon sx={{ fontSize: 22 }} />}
                sx={{
                  backgroundColor: '#714B67',
                  textTransform: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 500,
                  py: 1.75,
                  minHeight: '48px',
                  boxShadow: '0 4px 12px rgba(113, 75, 103, 0.25)',
                  '&:hover': {
                    backgroundColor: '#5d3d54',
                    boxShadow: '0 6px 16px rgba(113, 75, 103, 0.35)'
                  }
                }}
              >
                {loading ? 'Checking In...' : 'Check In Now'}
              </Button>
            )}
          </Box>
        </Popover>

        {/* User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, ml: 1 }}>
          <Box sx={{ textAlign: 'right', mr: 1 }}>
            <Typography variant="body2" fontWeight="600" color="#2c3e50" sx={{ fontSize: '15px', mb: 0.5 }}>
              {user?.employee?.firstName} {user?.employee?.lastName}
            </Typography>
            <Typography variant="caption" color="#666" sx={{ fontSize: '12px' }}>
              {user?.role === 'Admin' ? 'Administrator' : user?.role}
            </Typography>
          </Box>
          
          <IconButton 
            onClick={handleMenuOpen}
            sx={{ 
              p: 0.75,
              border: '3px solid #714B67',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#5d3d54',
                transform: 'scale(1.05)'
              }
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              sx={{
                '& .MuiBadge-dot': {
                  backgroundColor: '#4caf50',
                  border: '3px solid #ffffff',
                  width: '14px',
                  height: '14px'
                }
              }}
            >
              <Avatar
                src={user?.employee?.profilePicture ? `${API_BASE_URL}${user.employee.profilePicture}` : ''}
                sx={{ 
                  width: 48, 
                  height: 48,
                  backgroundColor: '#714B67',
                  fontSize: '18px',
                  fontWeight: 600
                }}
              >
                {user?.employee?.firstName?.charAt(0) || user?.loginId?.charAt(0)}
              </Avatar>
            </Badge>
          </IconButton>
        </Box>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              minWidth: '220px',
              mt: 2,
              border: '1px solid #e0e0e0'
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleMyProfile} sx={{ py: 1.75, px: 2.5 }}>
            <ListItemIcon>
              <PersonIcon sx={{ color: '#666', fontSize: 24, mr: 2 }} />
            </ListItemIcon>
            <ListItemText 
              primary="My Profile" 
              primaryTypographyProps={{ fontSize: '15px', fontWeight: 500 }}
            />
          </MenuItem>

          <Divider sx={{ my: 1.5, mx: 2 }} />

          <MenuItem onClick={handleLogout} sx={{ py: 1.75, px: 2.5 }}>
            <ListItemIcon>
              <LogoutIcon sx={{ color: '#dc3545', fontSize: 24, mr: 2 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Log Out" 
              primaryTypographyProps={{ 
                fontSize: '15px',
                color: '#dc3545',
                fontWeight: 500 
              }}
            />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
