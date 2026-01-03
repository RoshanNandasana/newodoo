import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Card,
  CardContent,
  Divider,
  alpha,
  Tooltip
} from '@mui/material';
import Navbar from '../components/Navbar';
import { leaveAPI, uploadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SickIcon from '@mui/icons-material/Sick';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PolicyIcon from '@mui/icons-material/Policy';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const primaryColor = '#714B67';
const secondaryColor = '#9A7B9A';
const accentColor = '#C895C6';
const backgroundColor = '#F8F5F8';
const successColor = '#4CAF50';
const warningColor = '#FF9800';
const errorColor = '#F44336';
const infoColor = '#2196F3';

function Leave() {
  const [myLeaves, setMyLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [reviewDialog, setReviewDialog] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const { isAdminOrHR, user } = useAuth();

  const [formData, setFormData] = useState({
    leaveType: 'PaidLeave',
    startDate: '',
    endDate: '',
    reason: '',
    attachment: null
  });

  useEffect(() => {
    if (user?.role !== 'Admin') {
      fetchMyLeaves();
      fetchBalance();
    }
    if (isAdminOrHR) {
      fetchAllLeaves();
      fetchPendingLeaves();
    }
  }, []);

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const response = await leaveAPI.getMyLeaves();
      setMyLeaves(response.data);
    } catch (err) {
      setError('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLeaves = async () => {
    try {
      const response = await leaveAPI.getAll();
      setAllLeaves(response.data);
    } catch (err) {
      console.log('Failed to load all leaves');
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      const response = await leaveAPI.getAll({ status: 'Pending' });
      setPendingLeaves(response.data);
    } catch (err) {
      console.log('Failed to load pending leaves');
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await leaveAPI.getBalance();
      setBalance(response.data);
    } catch (err) {
      console.log('Failed to load balance');
    }
  };

  const handleRefresh = () => {
    if (user?.role !== 'Admin') {
      fetchMyLeaves();
      fetchBalance();
    }
    if (isAdminOrHR) {
      fetchAllLeaves();
      fetchPendingLeaves();
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const response = await uploadAPI.leaveAttachment(file);
      setFormData({ ...formData, attachment: response.data.url });
      setSuccess('File uploaded successfully');
    } catch (err) {
      setError('Failed to upload file');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    const numberOfDays = calculateDays();
    if (numberOfDays <= 0) {
      setError('Invalid date range');
      return;
    }

    try {
      await leaveAPI.apply({
        ...formData,
        numberOfDays
      });
      setSuccess('Leave application submitted successfully!');
      setOpenDialog(false);
      setFormData({
        leaveType: 'PaidLeave',
        startDate: '',
        endDate: '',
        reason: '',
        attachment: null
      });
      fetchMyLeaves();
      fetchBalance();
      if (isAdminOrHR) {
        fetchAllLeaves();
        fetchPendingLeaves();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply for leave');
    }
  };

  const handleReview = async (id, status, comments) => {
    setError('');
    setSuccess('');

    try {
      await leaveAPI.review(id, { status, reviewComments: comments });
      setSuccess(`Leave ${status.toLowerCase()} successfully!`);
      setReviewDialog(null);
      fetchAllLeaves();
      fetchPendingLeaves();
      if (user?.role !== 'Admin') {
        fetchBalance();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to review leave');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return successColor;
      case 'Pending': return warningColor;
      case 'Rejected': return errorColor;
      default: return '#757575';
    }
  };

  const getLeaveTypeIcon = (type) => {
    switch (type) {
      case 'PaidLeave': return <BeachAccessIcon sx={{ mr: 1, color: accentColor }} />;
      case 'SickLeave': return <SickIcon sx={{ mr: 1, color: '#FF6B6B' }} />;
      case 'UnpaidLeave': return <EventNoteIcon sx={{ mr: 1, color: '#757575' }} />;
      default: return <EventNoteIcon sx={{ mr: 1 }} />;
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'PaidLeave': return accentColor;
      case 'SickLeave': return '#FF6B6B';
      case 'UnpaidLeave': return '#757575';
      default: return '#757575';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: backgroundColor }}>
      <Navbar />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
              Leave Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {isAdminOrHR ? 'Manage employee leaves and approvals' : 'Track and apply for leave'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh data">
              <IconButton
                onClick={handleRefresh}
                sx={{
                  bgcolor: 'white',
                  color: primaryColor,
                  '&:hover': { bgcolor: alpha(primaryColor, 0.1) }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                bgcolor: primaryColor,
                '&:hover': {
                  bgcolor: alpha(primaryColor, 0.9),
                },
                px: 4,
                py: 1.2,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(113, 75, 103, 0.2)'
              }}
            >
              Apply for Leave
            </Button>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: 1,
              border: `1px solid ${errorColor}`
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              boxShadow: 1,
              border: `1px solid ${successColor}`
            }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Leave Balance Cards */}
        {balance && user?.role !== 'Admin' && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                bgcolor: 'white', 
                borderRadius: 3, 
                boxShadow: '0 4px 12px rgba(113, 75, 103, 0.1)',
                borderLeft: `4px solid ${accentColor}`,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(113, 75, 103, 0.15)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BeachAccessIcon sx={{ fontSize: 40, color: accentColor, mr: 2 }} />
                    <Box>
                      <Typography variant="h6" color="text.primary" fontWeight="medium">
                        Paid Leave
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Annual leave balance
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2, borderColor: alpha(accentColor, 0.2) }} />
                  <Typography variant="h2" fontWeight="bold" color={primaryColor} textAlign="center" sx={{ py: 2 }}>
                    {balance.paidLeave}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    days remaining
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                bgcolor: 'white', 
                borderRadius: 3, 
                boxShadow: '0 4px 12px rgba(113, 75, 103, 0.1)',
                borderLeft: `4px solid #FF6B6B`,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(255, 107, 107, 0.15)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SickIcon sx={{ fontSize: 40, color: '#FF6B6B', mr: 2 }} />
                    <Box>
                      <Typography variant="h6" color="text.primary" fontWeight="medium">
                        Sick Leave
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Medical leave balance
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2, borderColor: alpha('#FF6B6B', 0.2) }} />
                  <Typography variant="h2" fontWeight="bold" color="#FF6B6B" textAlign="center" sx={{ py: 2 }}>
                    {balance.sickLeave}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    days remaining
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                bgcolor: 'white', 
                borderRadius: 3, 
                boxShadow: '0 4px 12px rgba(113, 75, 103, 0.1)',
                borderLeft: `4px solid #757575`,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(117, 117, 117, 0.15)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EventNoteIcon sx={{ fontSize: 40, color: '#757575', mr: 2 }} />
                      <Box>
                        <Typography variant="h6" color="text.primary" fontWeight="medium">
                          Unpaid Leave
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          As per company policy
                        </Typography>
                      </Box>
                    </Box>
                    <Tooltip title="View Policy">
                      <IconButton
                        size="small"
                        onClick={() => window.open('https://www.odoo.com/documentation/18.0/applications/hr/time_off.html', '_blank')}
                        sx={{ 
                          color: '#757575',
                          '&:hover': { 
                            backgroundColor: alpha('#757575', 0.1),
                            color: primaryColor
                          }
                        }}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Divider sx={{ my: 2, borderColor: alpha('#757575', 0.2) }} />
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: alpha('#757575', 0.05),
                    borderRadius: 2,
                    py: 2,
                    mb: 2
                  }}>
                    <PolicyIcon sx={{ fontSize: 48, color: '#757575' }} />
                  </Box>

                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    bgcolor: alpha(infoColor, 0.05),
                    borderRadius: 2,
                    p: 1.5,
                    mb: 2,
                    border: `1px solid ${alpha(infoColor, 0.1)}`
                  }}>
                    <InfoOutlinedIcon sx={{ fontSize: 20, color: infoColor, mr: 1, mt: 0.3 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
                        • No predefined entitlement<br />
                        • Requires prior approval<br />
                        • Results in salary deduction<br />
                        • Granted as per policy
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" textAlign="center" fontWeight="500">
                    Request-based leave
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* My Leave Applications - Only for Employees and HR */}
        {user?.role !== 'Admin' && (
          <Paper sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3, 
            boxShadow: '0 4px 12px rgba(113, 75, 103, 0.08)',
            bgcolor: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CalendarTodayIcon sx={{ mr: 2, color: primaryColor }} />
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                My Leave Applications
              </Typography>
              <Chip 
                label={`${myLeaves.length} total`} 
                size="small" 
                sx={{ ml: 2, bgcolor: alpha(primaryColor, 0.1), color: primaryColor }}
              />
            </Box>
          
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                <CircularProgress sx={{ color: primaryColor }} />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(primaryColor, 0.05) }}>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Leave Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Start Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>End Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Days</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Reason</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Comments</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myLeaves.map((leave) => (
                      <TableRow 
                        key={leave._id}
                        sx={{ 
                          '&:hover': { bgcolor: alpha(primaryColor, 0.02) },
                          '&:last-child td': { borderBottom: 0 }
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getLeaveTypeIcon(leave.leaveType)}
                            <Typography>
                              {leave.leaveType.replace(/([A-Z])/g, ' $1').trim()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {new Date(leave.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {new Date(leave.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell sx={{ py: 2, fontWeight: 'medium' }}>
                          <Chip
                            label={`${leave.numberOfDays} day${leave.numberOfDays !== 1 ? 's' : ''}`}
                            size="small"
                            sx={{ 
                              bgcolor: alpha(primaryColor, 0.1),
                              color: primaryColor
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2, maxWidth: 200 }}>
                          <Typography variant="body2" noWrap>
                            {leave.reason || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={leave.status}
                            sx={{
                              bgcolor: alpha(getStatusColor(leave.status), 0.1),
                              color: getStatusColor(leave.status),
                              fontWeight: 'medium',
                              borderRadius: 1,
                              border: `1px solid ${alpha(getStatusColor(leave.status), 0.3)}`
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2, maxWidth: 200 }}>
                          <Typography variant="body2" color="text.secondary">
                            {leave.reviewComments || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {!loading && myLeaves.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <EventNoteIcon sx={{ fontSize: 60, color: alpha('#000', 0.1), mb: 2 }} />
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No leave applications found
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    color: primaryColor, 
                    borderColor: primaryColor,
                    '&:hover': { borderColor: primaryColor, bgcolor: alpha(primaryColor, 0.05) }
                  }}
                  onClick={() => setOpenDialog(true)}
                >
                  Apply for your first leave
                </Button>
              </Box>
            )}
          </Paper>
        )}

        {/* Admin/HR: Pending Leave Requests */}
        {isAdminOrHR && (
          <Paper sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3, 
            boxShadow: '0 4px 12px rgba(113, 75, 103, 0.08)',
            bgcolor: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PendingActionsIcon sx={{ mr: 2, color: warningColor }} />
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Pending Leave Requests
              </Typography>
              <Chip 
                label={`${pendingLeaves.length} pending`} 
                size="small" 
                sx={{ 
                  ml: 2, 
                  bgcolor: alpha(warningColor, 0.1), 
                  color: warningColor,
                  fontWeight: 'medium'
                }}
              />
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(warningColor, 0.1) }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, fontSize: 18 }} />
                        Employee
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Leave Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ mr: 1, fontSize: 18 }} />
                        Days
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DescriptionIcon sx={{ mr: 1, fontSize: 18 }} />
                        Reason
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Attachment</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingLeaves.map((leave) => (
                    <TableRow 
                      key={leave._id}
                      sx={{ 
                        '&:hover': { bgcolor: alpha(warningColor, 0.03) },
                        '&:last-child td': { borderBottom: 0 }
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {leave.employee?.firstName} {leave.employee?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {leave.employee?.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getLeaveTypeIcon(leave.leaveType)}
                          <Typography variant="body2">
                            {leave.leaveType.replace(/([A-Z])/g, ' $1').trim()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {new Date(leave.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {new Date(leave.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={`${leave.numberOfDays} day${leave.numberOfDays !== 1 ? 's' : ''}`}
                          size="small"
                          sx={{ 
                            bgcolor: alpha(getLeaveTypeColor(leave.leaveType), 0.1),
                            color: getLeaveTypeColor(leave.leaveType)
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2, maxWidth: 200 }}>
                        <Typography variant="body2" noWrap>
                          {leave.reason || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {leave.attachment ? (
                          <Tooltip title="Download attachment">
                            <Button 
                              size="small" 
                              startIcon={<FileDownloadIcon />}
                              href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${leave.attachment}`}
                              target="_blank"
                              sx={{
                                color: primaryColor,
                                '&:hover': { bgcolor: alpha(primaryColor, 0.1) }
                              }}
                            >
                              View
                            </Button>
                          </Tooltip>
                        ) : '-'}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              sx={{ 
                                bgcolor: alpha(successColor, 0.1),
                                color: successColor,
                                '&:hover': { bgcolor: alpha(successColor, 0.2) }
                              }}
                              onClick={() => setReviewDialog({ leave, status: 'Approved' })}
                            >
                              <ThumbUpIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              sx={{ 
                                bgcolor: alpha(errorColor, 0.1),
                                color: errorColor,
                                '&:hover': { bgcolor: alpha(errorColor, 0.2) }
                              }}
                              onClick={() => setReviewDialog({ leave, status: 'Rejected' })}
                            >
                              <ThumbDownIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {pendingLeaves.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CheckIcon sx={{ fontSize: 60, color: alpha('#000', 0.1), mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  All caught up! No pending leave requests
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Admin/HR: All Leave Requests */}
        {isAdminOrHR && (
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3, 
            boxShadow: '0 4px 12px rgba(113, 75, 103, 0.08)',
            bgcolor: 'white'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DescriptionIcon sx={{ mr: 2, color: primaryColor }} />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  All Leave Requests
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ minWidth: 180 }} size="small">
                  <InputLabel>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FilterListIcon sx={{ mr: 1, fontSize: 18 }} />
                      Filter by Status
                    </Box>
                  </InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Filter by Status"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="All">All Requests</MenuItem>
                    <MenuItem value="Pending">Pending Only</MenuItem>
                    <MenuItem value="Approved">Approved Only</MenuItem>
                    <MenuItem value="Rejected">Rejected Only</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{
                    color: primaryColor,
                    borderColor: primaryColor,
                    '&:hover': { 
                      borderColor: primaryColor,
                      bgcolor: alpha(primaryColor, 0.05)
                    },
                    borderRadius: 2
                  }}
                >
                  Export
                </Button>
              </Box>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(primaryColor, 0.05) }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Leave Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Start Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>End Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Reviewed By</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Comments</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allLeaves
                    .filter(leave => filterStatus === 'All' || leave.status === filterStatus)
                    .map((leave) => (
                    <TableRow 
                      key={leave._id}
                      sx={{ 
                        '&:hover': { bgcolor: alpha(primaryColor, 0.02) },
                        '&:last-child td': { borderBottom: 0 }
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {leave.employee?.firstName} {leave.employee?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {leave.employee?.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getLeaveTypeIcon(leave.leaveType)}
                          <Typography variant="body2">
                            {leave.leaveType.replace(/([A-Z])/g, ' $1').trim()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {new Date(leave.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {new Date(leave.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={`${leave.numberOfDays} day${leave.numberOfDays !== 1 ? 's' : ''}`}
                          size="small"
                          sx={{ 
                            bgcolor: alpha(getLeaveTypeColor(leave.leaveType), 0.1),
                            color: getLeaveTypeColor(leave.leaveType)
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2, maxWidth: 200 }}>
                        <Typography variant="body2" noWrap>
                          {leave.reason || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={leave.status}
                          sx={{
                            bgcolor: alpha(getStatusColor(leave.status), 0.1),
                            color: getStatusColor(leave.status),
                            fontWeight: 'medium',
                            borderRadius: 1,
                            border: `1px solid ${alpha(getStatusColor(leave.status), 0.3)}`
                          }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {leave.reviewedBy?.loginId ? (
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {leave.reviewedBy?.loginId}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(leave.reviewedAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </Typography>
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell sx={{ py: 2, maxWidth: 200 }}>
                        <Typography variant="body2" color="text.secondary">
                          {leave.reviewComments || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {allLeaves.filter(leave => filterStatus === 'All' || leave.status === filterStatus).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <EventNoteIcon sx={{ fontSize: 60, color: alpha('#000', 0.1), mb: 2 }} />
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No leave requests found
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Try changing the filter or check back later
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Apply Leave Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: primaryColor, 
            color: 'white',
            fontWeight: 'bold',
            py: 3
          }}>
            Apply for Leave
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                label="Leave Type"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="PaidLeave">Paid Leave</MenuItem>
                <MenuItem value="SickLeave">Sick Leave</MenuItem>
                <MenuItem value="UnpaidLeave">Unpaid Leave</MenuItem>
              </Select>
            </FormControl>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  size="small"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  size="small"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: alpha(primaryColor, 0.05),
              borderRadius: 2,
              textAlign: 'center'
            }}>
              <Typography variant="body2" color="text.secondary">
                Total Days Requested
              </Typography>
              <Typography variant="h5" fontWeight="bold" color={primaryColor}>
                {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
              </Typography>
            </Box>
            
            <TextField
              label="Reason for Leave"
              multiline
              rows={3}
              fullWidth
              margin="normal"
              size="small"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              sx={{ borderRadius: 2 }}
              placeholder="Please provide details about your leave request..."
            />
            
            <Button
              component="label"
              variant="outlined"
              startIcon={<AttachFileIcon />}
              sx={{ 
                mt: 2,
                color: primaryColor,
                borderColor: primaryColor,
                '&:hover': {
                  borderColor: primaryColor,
                  bgcolor: alpha(primaryColor, 0.05)
                },
                borderRadius: 2
              }}
            >
              Upload Supporting Document
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {formData.attachment && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <CheckIcon fontSize="small" sx={{ mr: 0.5 }} />
                File uploaded successfully
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { bgcolor: alpha('#000', 0.05) },
                borderRadius: 2
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              sx={{
                bgcolor: primaryColor,
                '&:hover': {
                  bgcolor: alpha(primaryColor, 0.9),
                },
                px: 4,
                borderRadius: 2
              }}
            >
              Submit Application
            </Button>
          </DialogActions>
        </Dialog>

        {/* Review Dialog */}
        {reviewDialog && (
          <Dialog 
            open={true} 
            onClose={() => setReviewDialog(null)} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
              sx: { borderRadius: 3 }
            }}
          >
            <DialogTitle sx={{ 
              bgcolor: reviewDialog.status === 'Approved' ? successColor : errorColor,
              color: 'white',
              fontWeight: 'bold',
              py: 3
            }}>
              {reviewDialog.status} Leave Request
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Employee
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {reviewDialog.leave.employee?.firstName} {reviewDialog.leave.employee?.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Leave Type
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {reviewDialog.leave.leaveType.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Total Days
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {reviewDialog.leave.numberOfDays} day{reviewDialog.leave.numberOfDays !== 1 ? 's' : ''}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(reviewDialog.leave.startDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(reviewDialog.leave.endDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Reason
                  </Typography>
                  <Typography variant="body1" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                    "{reviewDialog.leave.reason}"
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <TextField
                label="Review Comments (Optional)"
                placeholder="Add any additional comments for the employee..."
                multiline
                rows={3}
                fullWidth
                value={reviewDialog.comments || ''}
                onChange={(e) => setReviewDialog({ ...reviewDialog, comments: e.target.value })}
                sx={{ borderRadius: 2 }}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={() => setReviewDialog(null)}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { bgcolor: alpha('#000', 0.05) },
                  borderRadius: 2
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleReview(reviewDialog.leave._id, reviewDialog.status, reviewDialog.comments)}
                variant="contained"
                sx={{
                  bgcolor: reviewDialog.status === 'Approved' ? successColor : errorColor,
                  '&:hover': {
                    bgcolor: reviewDialog.status === 'Approved' ? alpha(successColor, 0.9) : alpha(errorColor, 0.9),
                  },
                  px: 4,
                  borderRadius: 2
                }}
              >
                {reviewDialog.status}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </Box>
  );
}

export default Leave;