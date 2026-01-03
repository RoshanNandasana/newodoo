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
  IconButton
} from '@mui/material';
import Navbar from '../components/Navbar';
import { leaveAPI, uploadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';

function Leave() {
  const [myLeaves, setMyLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [reviewDialog, setReviewDialog] = useState(null);
  const { isAdminOrHR } = useAuth();

  const [formData, setFormData] = useState({
    leaveType: 'PaidLeave',
    startDate: '',
    endDate: '',
    reason: '',
    attachment: null
  });

  useEffect(() => {
    fetchMyLeaves();
    fetchBalance();
    if (isAdminOrHR) {
      fetchAllLeaves();
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
      const response = await leaveAPI.getAll({ status: 'Pending' });
      setAllLeaves(response.data);
    } catch (err) {
      console.log('Failed to load all leaves');
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
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to review leave');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navbar />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Leave Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Apply for Leave
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Leave Balance */}
        {balance && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Paid Leave
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {balance.paidLeave}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  days remaining
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="info.main" gutterBottom>
                  Sick Leave
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  {balance.sickLeave}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  days remaining
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="warning.main" gutterBottom>
                  Unpaid Leave
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  ∞
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  no limit
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* My Leave Applications */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            My Leave Applications
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Comments</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myLeaves.map((leave) => (
                    <TableRow key={leave._id}>
                      <TableCell>{leave.leaveType.replace(/([A-Z])/g, ' $1').trim()}</TableCell>
                      <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>{leave.numberOfDays}</TableCell>
                      <TableCell>{leave.reason}</TableCell>
                      <TableCell>
                        <Chip
                          label={leave.status}
                          color={
                            leave.status === 'Approved' ? 'success' :
                            leave.status === 'Rejected' ? 'error' : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{leave.reviewComments || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loading && myLeaves.length === 0 && (
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', p: 4 }}>
              No leave applications found
            </Typography>
          )}
        </Paper>

        {/* Admin/HR: Pending Leave Requests */}
        {isAdminOrHR && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pending Leave Requests
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allLeaves.map((leave) => (
                    <TableRow key={leave._id}>
                      <TableCell>
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </TableCell>
                      <TableCell>{leave.leaveType.replace(/([A-Z])/g, ' $1').trim()}</TableCell>
                      <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>{leave.numberOfDays}</TableCell>
                      <TableCell>{leave.reason}</TableCell>
                      <TableCell>
                        <IconButton
                          color="success"
                          onClick={() => setReviewDialog({ leave, status: 'Approved' })}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => setReviewDialog({ leave, status: 'Rejected' })}
                        >
                          <CloseIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {allLeaves.length === 0 && (
              <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', p: 4 }}>
                No pending leave requests
              </Typography>
            )}
          </Paper>
        )}

        {/* Apply Leave Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Apply for Leave</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                label="Leave Type"
              >
                <MenuItem value="PaidLeave">Paid Leave</MenuItem>
                <MenuItem value="SickLeave">Sick Leave</MenuItem>
                <MenuItem value="UnpaidLeave">Unpaid Leave</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              margin="normal"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="End Date"
              type="date"
              fullWidth
              margin="normal"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Number of days: {calculateDays()}
            </Typography>
            
            <TextField
              label="Reason"
              multiline
              rows={3}
              fullWidth
              margin="normal"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
            
            <Button
              component="label"
              startIcon={<AttachFileIcon />}
              sx={{ mt: 2 }}
            >
              Upload Medical Certificate
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {formData.attachment && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                File uploaded ✓
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        {/* Review Dialog */}
        {reviewDialog && (
          <Dialog open={true} onClose={() => setReviewDialog(null)} maxWidth="sm" fullWidth>
            <DialogTitle>
              {reviewDialog.status} Leave Request
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                Employee: {reviewDialog.leave.employee?.firstName} {reviewDialog.leave.employee?.lastName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Leave Type: {reviewDialog.leave.leaveType.replace(/([A-Z])/g, ' $1').trim()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Duration: {new Date(reviewDialog.leave.startDate).toLocaleDateString()} to {new Date(reviewDialog.leave.endDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Days: {reviewDialog.leave.numberOfDays}
              </Typography>
              <TextField
                label="Comments (Optional)"
                multiline
                rows={3}
                fullWidth
                margin="normal"
                value={reviewDialog.comments || ''}
                onChange={(e) => setReviewDialog({ ...reviewDialog, comments: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setReviewDialog(null)}>Cancel</Button>
              <Button
                onClick={() => handleReview(reviewDialog.leave._id, reviewDialog.status, reviewDialog.comments)}
                variant="contained"
                color={reviewDialog.status === 'Approved' ? 'success' : 'error'}
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
