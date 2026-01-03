import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Container,
  Grid,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { employeeAPI, salaryAPI, uploadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Profile() {
  const [tab, setTab] = useState(0);
  const [employee, setEmployee] = useState(null);
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const { id } = useParams();
  const { user, isAdminOrHR } = useAuth();

  const isOwnProfile = user?.employee?._id === id;
  const canViewSalary = isAdminOrHR || isOwnProfile;
  const canViewPrivateInfo = isAdminOrHR || isOwnProfile;

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  useEffect(() => {
    if (tab === 2 && canViewSalary) {
      fetchSalary();
    }
  }, [tab]);

  const fetchEmployee = async () => {
    try {
      const response = await employeeAPI.getById(id);
      setEmployee(response.data);
    } catch (err) {
      setError('Failed to load employee profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalary = async () => {
    try {
      const response = await salaryAPI.get(id);
      setSalary(response.data);
    } catch (err) {
      console.log('Salary not configured');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAPI.profilePicture(file);
      setEmployee({ ...employee, profilePicture: response.data.url });
      setError('');
    } catch (err) {
      setError('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={employee?.profilePicture ? `${API_BASE_URL}${employee.profilePicture}` : ''}
                sx={{ width: 100, height: 100, mr: 3 }}
              >
                {employee?.firstName?.charAt(0)}{employee?.lastName?.charAt(0)}
              </Avatar>
              {isOwnProfile && (
                <Button
                  component="label"
                  size="small"
                  sx={{ position: 'absolute', bottom: 0, right: 20 }}
                  disabled={uploading}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                  />
                  {uploading ? '...' : '📷'}
                </Button>
              )}
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {employee?.firstName} {employee?.lastName}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {employee?.position} • {employee?.department}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {employee?.email}
              </Typography>
            </Box>
          </Box>

          <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Resume" />
            {canViewPrivateInfo && <Tab label="Private Info" />}
            {canViewSalary && <Tab label="Salary Info" />}
            {isOwnProfile && <Tab label="Security" />}
          </Tabs>

          <Box sx={{ mt: 3 }}>
            {tab === 0 && <ResumeTab employee={employee} isOwnProfile={isOwnProfile} />}
            {tab === 1 && canViewPrivateInfo && <PrivateInfoTab employee={employee} />}
            {tab === 2 && canViewSalary && <SalaryInfoTab salary={salary} />}
            {tab === 3 && isOwnProfile && <SecurityTab />}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

function ResumeTab({ employee, isOwnProfile }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField label="First Name" value={employee?.firstName || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Last Name" value={employee?.lastName || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Email" value={employee?.email || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Phone" value={employee?.phone || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Position" value={employee?.position || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Department" value={employee?.department || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Company" value={employee?.company || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="Date of Joining"
          value={employee?.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : ''}
          fullWidth
          disabled
        />
      </Grid>
    </Grid>
  );
}

function PrivateInfoTab({ employee }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          label="Date of Birth"
          value={employee?.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : ''}
          fullWidth
          disabled
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Gender" value={employee?.gender || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Nationality" value={employee?.nationality || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Address</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField label="Street" value={employee?.address?.street || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="City" value={employee?.address?.city || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="State" value={employee?.address?.state || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Zip Code" value={employee?.address?.zipCode || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Country" value={employee?.address?.country || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Bank Details</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Account Number" value={employee?.bankDetails?.accountNumber || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Bank Name" value={employee?.bankDetails?.bankName || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField label="IFSC Code" value={employee?.bankDetails?.ifscCode || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField label="PAN" value={employee?.bankDetails?.pan || ''} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField label="UAN" value={employee?.bankDetails?.uan || ''} fullWidth disabled />
      </Grid>
    </Grid>
  );
}

function SalaryInfoTab({ salary }) {
  if (!salary) {
    return (
      <Alert severity="info">
        Salary information has not been configured for this employee yet.
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Base Wage</Typography>
        <TextField
          value={`₹${salary.baseWage?.toLocaleString()}`}
          fullWidth
          disabled
        />
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Salary Components</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Basic" value={`₹${salary.components?.basic?.value?.toFixed(2)}`} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="HRA" value={`₹${salary.components?.hra?.value?.toFixed(2)}`} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Standard Allowance" value={`₹${salary.components?.standardAllowance?.value?.toFixed(2)}`} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Performance Bonus" value={`₹${salary.components?.performanceBonus?.value?.toFixed(2)}`} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Leave Travel Allowance" value={`₹${salary.components?.leaveTravelAllowance?.value?.toFixed(2)}`} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Fixed Allowance" value={`₹${salary.components?.fixedAllowance?.value?.toFixed(2)}`} fullWidth disabled />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Deductions</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Provident Fund" value={`₹${salary.deductions?.providentFund?.value?.toFixed(2)}`} fullWidth disabled />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField label="Professional Tax" value={`₹${salary.deductions?.professionalTax?.value?.toFixed(2)}`} fullWidth disabled />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Total Salary</Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="Annual Salary"
          value={`₹${salary.totalSalary?.toLocaleString()}`}
          fullWidth
          disabled
          InputProps={{ style: { fontWeight: 'bold', fontSize: '1.2rem' } }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="Monthly Salary"
          value={`₹${salary.monthlySalary?.toLocaleString()}`}
          fullWidth
          disabled
          InputProps={{ style: { fontWeight: 'bold', fontSize: '1.2rem' } }}
        />
      </Grid>
    </Grid>
  );
}

function SecurityTab() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Security Settings
      </Typography>
      <Button variant="contained" href="/change-password">
        Change Password
      </Button>
    </Box>
  );
}

export default Profile;
