import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authAPI } from '../services/api';
import { PersonAddOutlined, Visibility, VisibilityOff } from '@mui/icons-material';

function CreateEmployee() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    department: '',
    position: '',
    dateOfJoining: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    bankDetails: {
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      pan: '',
      uan: ''
    }
  });

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopyMessage(`${label} copied to clipboard!`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear credentials when user starts entering new data
    if (credentials) {
      setCredentials(null);
      setSuccess('');
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.createEmployee(formData);
      setCredentials(response.data.credentials);
      setSuccess('Employee created successfully!');
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          gender: '',
          nationality: '',
          department: '',
          position: '',
          dateOfJoining: '',
          address: { street: '', city: '', state: '', zipCode: '', country: '' },
          bankDetails: { accountNumber: '', bankName: '', ifscCode: '', pan: '', uan: '' }
        });
        setCredentials(null);
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create employee. Please check the information and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      department: '',
      position: '',
      dateOfJoining: '',
      address: { street: '', city: '', state: '', zipCode: '', country: '' },
      bankDetails: { accountNumber: '', bankName: '', ifscCode: '', pan: '', uan: '' }
    });
    setError('');
    setSuccess('');
    setCredentials(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <PersonAddOutlined sx={{ fontSize: 32, color: '#714B67' }} />
            <Typography variant="h4" fontWeight="600" color="#2c3e50">
              Create New Employee
            </Typography>
          </Box>
          <Typography variant="body1" color="#666">
            Add a new employee to the system and generate their login credentials
          </Typography>
        </Box>

        {/* Alerts Section */}
        <Box sx={{ mb: 3 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                borderRadius: '8px',
                '& .MuiAlert-icon': { color: '#dc3545' }
              }}
            >
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2, 
                borderRadius: '8px',
                '& .MuiAlert-icon': { color: '#28a745' }
              }}
            >
              {success}
            </Alert>
          )}
          
          {credentials && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 2, 
                borderRadius: '8px',
                backgroundColor: '#e8f4fd'
              }}
            >
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="600" color="#2c3e50" gutterBottom>
                  📋 Employee Credentials Generated
                </Typography>
                <Box sx={{ 
                  backgroundColor: '#ffffff', 
                  p: 2, 
                  borderRadius: '6px', 
                  border: '1px solid #dee2e6',
                  mt: 1
                }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="#666" sx={{ mb: 0.5 }}>
                        Login ID
                      </Typography>
                      <Typography variant="body1" fontWeight="500" color="#2c3e50">
                        {credentials.loginId}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="#666" sx={{ mb: 0.5 }}>
                        Temporary Password
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight="500" color="#2c3e50" sx={{ mr: 1 }}>
                          {showPassword ? credentials.tempPassword : '••••••••'}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ color: '#714B67' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
              <Typography variant="body2" color="#856404" sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 500
              }}>
                ⚠️ Please save these credentials securely and share with the employee
              </Typography>
            </Alert>
          )}
        </Box>

        {/* Main Form */}
        <Paper sx={{ 
          p: { xs: 3, md: 4 }, 
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: '4px', 
                  height: '20px', 
                  backgroundColor: '#714B67',
                  borderRadius: '2px' 
                }} />
                <Typography variant="h6" fontWeight="600" color="#2c3e50">
                  Personal Information
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    fullWidth
                    required
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    fullWidth
                    required
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="medium" sx={{ 
                    '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                  }}>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      label="Gender"
                      sx={{
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                      <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Company Information Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: '4px', 
                  height: '20px', 
                  backgroundColor: '#714B67',
                  borderRadius: '2px' 
                }} />
                <Typography variant="h6" fontWeight="600" color="#2c3e50">
                  Company Information
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    fullWidth
                    required
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Position / Job Title"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    fullWidth
                    required
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Date of Joining"
                    name="dateOfJoining"
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Address Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: '4px', 
                  height: '20px', 
                  backgroundColor: '#714B67',
                  borderRadius: '2px' 
                }} />
                <Typography variant="h6" fontWeight="600" color="#2c3e50">
                  Address Information
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Street Address"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="City"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="State / Province"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="ZIP / Postal Code"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Bank Details Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: '4px', 
                  height: '20px', 
                  backgroundColor: '#714B67',
                  borderRadius: '2px' 
                }} />
                <Typography variant="h6" fontWeight="600" color="#2c3e50">
                  Bank Details
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Account Number"
                    name="bankDetails.accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={handleChange}
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Bank Name"
                    name="bankDetails.bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleChange}
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="IFSC Code"
                    name="bankDetails.ifscCode"
                    value={formData.bankDetails.ifscCode}
                    onChange={handleChange}
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="PAN Number"
                    name="bankDetails.pan"
                    value={formData.bankDetails.pan}
                    onChange={handleChange}
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="UAN Number"
                    name="bankDetails.uan"
                    value={formData.bankDetails.uan}
                    onChange={handleChange}
                    fullWidth
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '&.Mui-focused fieldset': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ 
              mt: 6, 
              pt: 3, 
              borderTop: '1px solid #e9ecef',
              display: 'flex', 
              gap: 2,
              justifyContent: 'flex-end'
            }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{
                  px: 4,
                  borderRadius: '8px',
                  borderColor: '#dee2e6',
                  color: '#6c757d',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#714B67',
                    backgroundColor: 'rgba(113, 75, 103, 0.04)'
                  }
                }}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  px: 5,
                  borderRadius: '8px',
                  backgroundColor: '#714B67',
                  color: '#ffffff',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#5d3d54',
                    boxShadow: '0 4px 12px rgba(113, 75, 103, 0.3)'
                  },
                  '&:disabled': {
                    backgroundColor: '#e9ecef',
                    color: '#adb5bd'
                  }
                }}
              >
                {loading ? 'Creating Employee...' : 'Create Employee'}
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Form Note */}
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          backgroundColor: 'rgba(113, 75, 103, 0.04)', 
          borderRadius: '8px',
          border: '1px solid rgba(113, 75, 103, 0.1)'
        }}>
          <Typography variant="body2" color="#714B67" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ fontSize: '18px' }}>💡</span>
            <span><strong>Note:</strong> All fields marked with * are required. Login credentials will be generated automatically upon successful submission.</span>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default CreateEmployee;
