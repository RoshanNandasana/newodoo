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
  Popover
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import LoginIcon from '@mui/icons-material/Login';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import FlightIcon from '@mui/icons-material/Flight';
import { attendanceAPI } from '../services/api';
import { emitAttendanceUpdate } from '../utils/attendanceEvents';

function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [attendanceAnchorEl, setAttendanceAnchorEl] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('NotCheckedIn');
  const [checkInTime, setCheckInTime] = useState(null);
  const [loading, setLoading] = useState(false);
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
        } else if (todayRecord.checkInTime) {
          setAttendanceStatus('Present');
          setCheckInTime(new Date(todayRecord.checkInTime));
        } else {
          setAttendanceStatus('NotCheckedIn');
        }
      } else {
        setAttendanceStatus('NotCheckedIn');
      }
    } catch (err) {
      console.log('Failed to fetch attendance');
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await attendanceAPI.checkIn();
      setAttendanceStatus('Present');
      setCheckInTime(new Date());
      handleAttendanceClose();
      emitAttendanceUpdate(); // Notify all components
    } catch (err) {
      console.error('Check-in failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await attendanceAPI.checkOut();
      await fetchTodayAttendance();
      handleAttendanceClose();
      emitAttendanceUpdate(); // Notify all components
    } catch (err) {
      console.error('Check-out failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (attendanceStatus) {
      case 'Present':
        return '#2196f3'; // Blue
      case 'OnLeave':
        return '#4caf50'; // Green
      case 'Absent':
        return '#ff9800'; // Yellow
      default:
        return '#f44336'; // Red
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
  };

  const handleAttendanceClose = () => {
    setAttendanceAnchorEl(null);
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
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <Box
            component="span"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.5rem'
            }}
          >
            HRMS
          </Box>
        </Typography>

        <Tabs value={getTabValue()} textColor="inherit" sx={{ flexGrow: 1 }}>
          <Tab label="Employees" onClick={() => navigate('/dashboard')} />
          <Tab label="Attendance" onClick={() => navigate('/attendance')} />
          <Tab label="Time Off" onClick={() => navigate('/leave')} />
          {user?.role === 'Admin' && (
            <Tab label="Salary" onClick={() => navigate('/salary')} />
          )}
        </Tabs>

        {isAdminOrHR && (
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-employee')}
            sx={{ mr: 2 }}
          >
            Add Employee
          </Button>
        )}

        {/* Attendance Status Circle */}
        <IconButton
          onClick={handleAttendanceClick}
          sx={{
            mr: 1,
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          {getStatusIcon()}
        </IconButton>

        <Popover
          open={Boolean(attendanceAnchorEl)}
          anchorEl={attendanceAnchorEl}
          onClose={handleAttendanceClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box sx={{ p: 2, minWidth: 220 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {getStatusIcon()}
              <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                {attendanceStatus === 'Present' && 'Present'}
                {attendanceStatus === 'OnLeave' && 'On Leave'}
                {attendanceStatus === 'Absent' && 'Absent'}
                {attendanceStatus === 'NotCheckedIn' && 'Not Checked In'}
              </Typography>
            </Box>

            {attendanceStatus === 'OnLeave' && (
              <Typography variant="body2" color="text.secondary">
                You are on approved leave today.
              </Typography>
            )}

            {attendanceStatus === 'Present' && checkInTime && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Checked in at: {checkInTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCheckOut}
                  disabled={loading}
                  startIcon={<LogoutOutlinedIcon />}
                >
                  Check Out
                </Button>
              </>
            )}

            {(attendanceStatus === 'NotCheckedIn' || attendanceStatus === 'Absent') && (
              <Button
                fullWidth
                variant="contained"
                onClick={handleCheckIn}
                disabled={loading}
                startIcon={<LoginIcon />}
              >
                Check In
              </Button>
            )}
          </Box>
        </Popover>

        <IconButton onClick={handleMenuOpen}>
          <Avatar
            src={user?.employee?.profilePicture ? `${API_BASE_URL}${user.employee.profilePicture}` : ''}
            sx={{ bgcolor: 'secondary.main' }}
          >
            {user?.employee?.firstName?.charAt(0) || user?.loginId?.charAt(0)}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <Divider />

          <MenuItem onClick={handleMyProfile}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText>My Profile</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText>Log Out</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
