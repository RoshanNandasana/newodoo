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
  InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authAPI } from '../services/api';

function CreateEmployee() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
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
      
      // Reset form after 3 seconds
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
      setError(err.response?.data?.error || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Create New Employee
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        {credentials && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="bold">Generated Credentials:</Typography>
            <Typography variant="body2">Login ID: {credentials.loginId}</Typography>
            <Typography variant="body2">Temporary Password: {credentials.tempPassword}</Typography>
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              ⚠️ Please save these credentials and share with the employee securely!
            </Typography>
          </Alert>
        )}

        <Paper sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  fullWidth
                  required
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
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
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
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label="Gender"
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
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
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Company Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  fullWidth
                  required
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
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Address
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="City"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="State"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Zip Code"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Bank Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Account Number"
                  name="bankDetails.accountNumber"
                  value={formData.bankDetails.accountNumber}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Bank Name"
                  name="bankDetails.bankName"
                  value={formData.bankDetails.bankName}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="IFSC Code"
                  name="bankDetails.ifscCode"
                  value={formData.bankDetails.ifscCode}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="PAN"
                  name="bankDetails.pan"
                  value={formData.bankDetails.pan}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="UAN"
                  name="bankDetails.uan"
                  value={formData.bankDetails.uan}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Employee'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default CreateEmployee;
