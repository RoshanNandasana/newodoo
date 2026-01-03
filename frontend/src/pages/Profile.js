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
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { employeeAPI, salaryAPI, uploadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Work,
  CorporateFare,
  AccountBalance,
  AccountCircle,
  Fingerprint,
  Security,
  Edit,
  CameraAlt,
  Paid,
  CreditCard,
  Home,
  Flag,
  Male,
  Female,
  Transgender
} from '@mui/icons-material';

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
      setError('');
    } catch (err) {
      setError('Failed to load employee profile. Please try again.');
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

  const getGenderIcon = () => {
    switch(employee?.gender) {
      case 'Male': return <Male />;
      case 'Female': return <Female />;
      case 'Other': return <Transgender />;
      default: return <AccountCircle />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
        <Navbar />
        <Container sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress size={60} sx={{ color: '#714B67' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: '8px',
              border: '1px solid #f5c6cb'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Header Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 3, 
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            {/* Profile Picture */}
            <Box sx={{ position: 'relative', mr: 4 }}>
              <Avatar
                src={employee?.profilePicture ? `${API_BASE_URL}${employee.profilePicture}` : ''}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  border: '4px solid #ffffff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              >
                {employee?.firstName?.charAt(0)}{employee?.lastName?.charAt(0)}
              </Avatar>
              {isOwnProfile && (
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#714B67',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#5d3d54'
                    }
                  }}
                  disabled={uploading}
                  size="small"
                >
                  {uploading ? <CircularProgress size={20} /> : <CameraAlt />}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                  />
                </IconButton>
              )}
            </Box>

            {/* Employee Info */}
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" fontWeight="600" color="#2c3e50" sx={{ mr: 2 }}>
                  {employee?.firstName} {employee?.lastName}
                </Typography>
                {employee?.gender && (
                  <Chip
                    icon={getGenderIcon()}
                    label={employee.gender}
                    size="small"
                    sx={{
                      backgroundColor: alpha('#714B67', 0.1),
                      color: '#714B67',
                      fontWeight: 500
                    }}
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Work sx={{ fontSize: 18, color: '#666666', mr: 1 }} />
                <Typography variant="body1" color="#666666" sx={{ mr: 3 }}>
                  {employee?.position || 'Employee'}
                </Typography>
                <CorporateFare sx={{ fontSize: 18, color: '#666666', mr: 1 }} />
                <Typography variant="body1" color="#666666">
                  {employee?.department || 'Department'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email sx={{ fontSize: 16, color: '#666666', mr: 1 }} />
                  <Typography variant="body2" color="#666666">
                    {employee?.email}
                  </Typography>
                </Box>
                
                {employee?.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ fontSize: 16, color: '#666666', mr: 1 }} />
                    <Typography variant="body2" color="#666666">
                      {employee.phone}
                    </Typography>
                  </Box>
                )}
                
                {employee?.dateOfJoining && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ fontSize: 16, color: '#666666', mr: 1 }} />
                    <Typography variant="body2" color="#666666">
                      Joined {new Date(employee.dateOfJoining).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Tabs */}
          <Tabs 
            value={tab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '15px',
                fontWeight: 500,
                minHeight: '48px',
                color: '#666666',
                '&.Mui-selected': {
                  color: '#714B67',
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#714B67',
                height: '3px'
              }
            }}
          >
            <Tab icon={<AccountCircle />} iconPosition="start" label="Basic Info" />
            {canViewPrivateInfo && <Tab icon={<Fingerprint />} iconPosition="start" label="Private Details" />}
            {canViewSalary && <Tab icon={<Paid />} iconPosition="start" label="Salary Details" />}
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box sx={{ mt: 2 }}>
          {tab === 0 && <BasicInfoTab employee={employee} />}
          {tab === 1 && canViewPrivateInfo && <PrivateDetailsTab employee={employee} />}
          {tab === 2 && canViewSalary && <SalaryDetailsTab salary={salary} />}
        </Box>
      </Container>
    </Box>
  );
}

function BasicInfoTab({ employee }) {
  const infoItems = [
    { icon: <AccountCircle />, label: 'Employee ID', value: employee?.employeeId || 'N/A' },
    { icon: <Work />, label: 'Position', value: employee?.position || 'Not specified' },
    { icon: <CorporateFare />, label: 'Department', value: employee?.department || 'Not assigned' },
    { icon: <CalendarToday />, label: 'Date of Joining', 
      value: employee?.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'Not specified' },
    { icon: <Email />, label: 'Email', value: employee?.email || 'Not specified' },
    { icon: <Phone />, label: 'Phone', value: employee?.phone || 'Not specified' },
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight="600" color="#2c3e50" gutterBottom sx={{ mb: 3 }}>
            Basic Information
          </Typography>
          
          <Grid container spacing={2}>
            {infoItems.map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card variant="outlined" sx={{ borderRadius: '8px', height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ 
                        backgroundColor: alpha('#714B67', 0.1), 
                        borderRadius: '6px', 
                        p: 1, 
                        mr: 2 
                      }}>
                        {React.cloneElement(item.icon, { sx: { color: '#714B67', fontSize: 20 } })}
                      </Box>
                      <Box>
                        <Typography variant="caption" color="#666666">
                          {item.label}
                        </Typography>
                        <Typography variant="body1" fontWeight="500" color="#2c3e50">
                          {item.value}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}

function PrivateDetailsTab({ employee }) {
  const personalInfo = [
    { label: 'Date of Birth', 
      value: employee?.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'Not specified' },
    { label: 'Gender', value: employee?.gender || 'Not specified' },
    { label: 'Nationality', value: employee?.nationality || 'Not specified' },
  ];

  const addressInfo = [
    { label: 'Street', value: employee?.address?.street || 'Not specified' },
    { label: 'City', value: employee?.address?.city || 'Not specified' },
    { label: 'State', value: employee?.address?.state || 'Not specified' },
    { label: 'Zip Code', value: employee?.address?.zipCode || 'Not specified' },
    { label: 'Country', value: employee?.address?.country || 'Not specified' },
  ];

  const bankInfo = [
    { label: 'Account Number', value: employee?.bankDetails?.accountNumber || 'Not specified' },
    { label: 'Bank Name', value: employee?.bankDetails?.bankName || 'Not specified' },
    { label: 'IFSC Code', value: employee?.bankDetails?.ifscCode || 'Not specified' },
    { label: 'PAN', value: employee?.bankDetails?.pan || 'Not specified' },
    { label: 'UAN', value: employee?.bankDetails?.uan || 'Not specified' },
  ];

  return (
    <Grid container spacing={3}>
      {/* Personal Information */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e0e0e0', height: '100%' }}>
          <Typography variant="h6" fontWeight="600" color="#2c3e50" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Fingerprint sx={{ mr: 1.5, color: '#714B67' }} />
            Personal Information
          </Typography>
          
          <List dense>
            {personalInfo.map((info, index) => (
              <ListItem key={index} sx={{ py: 1.5, borderBottom: index < personalInfo.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="#666666" sx={{ mb: 0.5 }}>
                      {info.label}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body1" color="#2c3e50" fontWeight="500">
                      {info.value}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Address Information */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e0e0e0', height: '100%' }}>
          <Typography variant="h6" fontWeight="600" color="#2c3e50" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Home sx={{ mr: 1.5, color: '#714B67' }} />
            Address Information
          </Typography>
          
          <List dense>
            {addressInfo.map((info, index) => (
              <ListItem key={index} sx={{ py: 1.5, borderBottom: index < addressInfo.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="#666666" sx={{ mb: 0.5 }}>
                      {info.label}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body1" color="#2c3e50" fontWeight="500">
                      {info.value}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Bank Information */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight="600" color="#2c3e50" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <AccountBalance sx={{ mr: 1.5, color: '#714B67' }} />
            Bank Details
          </Typography>
          
          <Grid container spacing={2}>
            {bankInfo.map((info, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined" sx={{ borderRadius: '8px', height: '100%' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" color="#666666" sx={{ mb: 1, display: 'block' }}>
                      {info.label}
                    </Typography>
                    <Typography variant="body1" fontWeight="500" color="#2c3e50">
                      {info.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}

function SalaryDetailsTab({ salary }) {
  if (!salary) {
    return (
      <Alert 
        severity="info" 
        sx={{ 
          borderRadius: '8px',
          backgroundColor: '#e3f2fd'
        }}
      >
        Salary information has not been configured for this employee yet.
      </Alert>
    );
  }

  const components = [
    { label: 'Basic Salary', value: `₹${salary.components?.basic?.value?.toLocaleString('en-IN')}` },
    { label: 'House Rent Allowance (HRA)', value: `₹${salary.components?.hra?.value?.toLocaleString('en-IN')}` },
    { label: 'Standard Allowance', value: `₹${salary.components?.standardAllowance?.value?.toLocaleString('en-IN')}` },
    { label: 'Performance Bonus', value: `₹${salary.components?.performanceBonus?.value?.toLocaleString('en-IN')}` },
    { label: 'Leave Travel Allowance', value: `₹${salary.components?.leaveTravelAllowance?.value?.toLocaleString('en-IN')}` },
    { label: 'Fixed Allowance', value: `₹${salary.components?.fixedAllowance?.value?.toLocaleString('en-IN')}` },
  ];

  const deductions = [
    { label: 'Provident Fund (PF)', value: `₹${salary.deductions?.providentFund?.value?.toLocaleString('en-IN')}` },
    { label: 'Professional Tax', value: `₹${salary.deductions?.professionalTax?.value?.toLocaleString('en-IN')}` },
  ];

  const totals = [
    { label: 'Annual Salary', value: `₹${salary.totalSalary?.toLocaleString('en-IN')}`, color: '#714B67' },
    { label: 'Monthly Salary', value: `₹${salary.monthlySalary?.toLocaleString('en-IN')}`, color: '#714B67' },
    { label: 'Total Allowances', 
      value: `₹${components.reduce((sum, item) => sum + parseFloat(item.value.replace('₹', '').replace(/,/g, '')) || 0, 0).toLocaleString('en-IN')}`,
      color: '#4caf50' },
    { label: 'Total Deductions', 
      value: `₹${deductions.reduce((sum, item) => sum + parseFloat(item.value.replace('₹', '').replace(/,/g, '')) || 0, 0).toLocaleString('en-IN')}`,
      color: '#f44336' },
  ];

  return (
    <Grid container spacing={3}>
      {/* Salary Overview */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight="600" color="#2c3e50" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Paid sx={{ mr: 1.5, color: '#714B67' }} />
            Salary Overview
          </Typography>
          
          <Grid container spacing={3}>
            {totals.map((total, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    borderRadius: '8px',
                    backgroundColor: alpha(total.color, 0.05),
                    border: `1px solid ${alpha(total.color, 0.2)}`,
                    height: '100%'
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="caption" color="#666666" sx={{ mb: 1, display: 'block' }}>
                      {total.label}
                    </Typography>
                    <Typography variant="h5" fontWeight="700" color={total.color}>
                      {total.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>

      {/* Salary Components */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e0e0e0', height: '100%' }}>
          <Typography variant="h6" fontWeight="600" color="#2c3e50" gutterBottom sx={{ mb: 3 }}>
            Salary Components
          </Typography>
          
          <Grid container spacing={2}>
            {components.map((component, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card variant="outlined" sx={{ borderRadius: '8px' }}>
                  <CardContent sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="#666666">
                      {component.label}
                    </Typography>
                    <Typography variant="body1" fontWeight="600" color="#2c3e50">
                      {component.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>

      {/* Deductions */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, borderRadius: '12px', border: '1px solid #e0e0e0', height: '100%' }}>
          <Typography variant="h6" fontWeight="600" color="#2c3e50" gutterBottom sx={{ mb: 3 }}>
            Deductions
          </Typography>
          
          <List dense>
            {deductions.map((deduction, index) => (
              <ListItem key={index} sx={{ py: 1.5, borderBottom: index < deductions.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="#666666">
                      {deduction.label}
                    </Typography>
                  }
                />
                <Typography variant="body1" fontWeight="600" color="#f44336">
                  {deduction.value}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Profile;

