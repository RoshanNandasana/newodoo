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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  Divider
} from '@mui/material';
import Navbar from '../components/Navbar';
import { salaryAPI, employeeAPI } from '../services/api';
import {
  Add,
  Edit,
  Paid,
  TrendingUp,
  TrendingDown,
  Person,
  CorporateFare,
  AccountBalance,
  Percent,
  AttachMoney,
  Close,
  Save,
  Visibility
} from '@mui/icons-material';

function Salary() {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'

  const [formData, setFormData] = useState({
    baseWage: 0,
    components: {
      basic: { isPercentage: true, percentage: 40, value: 0 },
      hra: { isPercentage: true, percentage: 20, value: 0 },
      standardAllowance: { isPercentage: true, percentage: 10, value: 0 },
      performanceBonus: { isPercentage: false, percentage: 0, value: 0 },
      leaveTravelAllowance: { isPercentage: true, percentage: 5, value: 0 },
      fixedAllowance: { isPercentage: false, percentage: 0, value: 0 }
    },
    deductions: {
      providentFund: { isPercentage: true, percentage: 12, value: 0 },
      professionalTax: { isPercentage: false, percentage: 0, value: 200 }
    }
  });

  useEffect(() => {
    fetchSalaries();
    fetchEmployees();
  }, []);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const response = await salaryAPI.getAll();
      setSalaries(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load salary data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
    } catch (err) {
      console.log('Failed to load employees');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!selectedEmployee) {
      setError('Please select an employee');
      return;
    }

    if (formData.baseWage <= 0) {
      setError('Base wage must be greater than 0');
      return;
    }

    try {
      await salaryAPI.createOrUpdate({
        employeeId: selectedEmployee,
        ...formData
      });
      setSuccess('Salary structure saved successfully!');
      setOpenDialog(false);
      resetForm();
      fetchSalaries();
      
      // Auto-clear success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save salary structure');
    }
  };

  const handleEdit = (salary) => {
    setSelectedEmployee(salary.employee._id);
    setFormData({
      baseWage: salary.baseWage,
      components: salary.components,
      deductions: salary.deductions
    });
    setOpenDialog(true);
  };

  const handleViewDetails = (salary) => {
    setSelectedSalary(salary);
    setViewMode('details');
  };

  const resetForm = () => {
    setSelectedEmployee('');
    setFormData({
      baseWage: 0,
      components: {
        basic: { isPercentage: true, percentage: 40, value: 0 },
        hra: { isPercentage: true, percentage: 20, value: 0 },
        standardAllowance: { isPercentage: true, percentage: 10, value: 0 },
        performanceBonus: { isPercentage: false, percentage: 0, value: 0 },
        leaveTravelAllowance: { isPercentage: true, percentage: 5, value: 0 },
        fixedAllowance: { isPercentage: false, percentage: 0, value: 0 }
      },
      deductions: {
        providentFund: { isPercentage: true, percentage: 12, value: 0 },
        professionalTax: { isPercentage: false, percentage: 0, value: 200 }
      }
    });
  };

  const updateComponent = (category, key, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: {
          ...prev[category][key],
          [field]: value
        }
      }
    }));
  };

  const calculateSalarySummary = (salary) => {
    const componentsTotal = Object.values(salary.components || {}).reduce((sum, comp) => 
      sum + (comp.value || 0), 0
    );
    
    const deductionsTotal = Object.values(salary.deductions || {}).reduce((sum, ded) => 
      sum + (ded.value || 0), 0
    );
    
    const netAnnual = salary.baseWage + componentsTotal - deductionsTotal;
    const netMonthly = netAnnual / 12;
    
    return {
      componentsTotal,
      deductionsTotal,
      netAnnual,
      netMonthly
    };
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Navbar />
      
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" fontWeight="600" color="#2c3e50">
              Salary Management
            </Typography>
            {viewMode === 'details' ? (
              <Button
                startIcon={<Close />}
                onClick={() => setViewMode('list')}
                sx={{
                  color: '#666666',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: alpha('#714B67', 0.04)
                  }
                }}
              >
                Back to List
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  resetForm();
                  setOpenDialog(true);
                }}
                sx={{
                  backgroundColor: '#714B67',
                  color: '#ffffff',
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 3,
                  py: 1.5,
                  fontSize: '15px',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#5d3d54'
                  }
                }}
              >
                Add Salary Structure
              </Button>
            )}
          </Box>
          <Typography variant="body1" color="#666666">
            {viewMode === 'details' 
              ? 'View and manage salary details' 
              : 'Configure and manage employee salary structures'
            }
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: '8px',
              border: '1px solid #f5c6cb'
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
              borderRadius: '8px',
              border: '1px solid #c3e6cb'
            }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Salary Details View */}
        {viewMode === 'details' && selectedSalary && (
          <Box>
            <Paper sx={{ 
              p: 4, 
              mb: 3, 
              borderRadius: '12px',
              border: '1px solid #e0e0e0'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      width: 48, 
                      height: 48, 
                      backgroundColor: alpha('#714B67', 0.1), 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      <Person sx={{ color: '#714B67', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight="600" color="#2c3e50">
                        {selectedSalary.employee?.firstName} {selectedSalary.employee?.lastName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <CorporateFare sx={{ fontSize: 16, color: '#666666', mr: 1 }} />
                        <Typography variant="body2" color="#666666">
                          {selectedSalary.employee?.department} • {selectedSalary.employee?.position}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Button
                  startIcon={<Edit />}
                  onClick={() => handleEdit(selectedSalary)}
                  sx={{
                    color: '#714B67',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: alpha('#714B67', 0.04)
                    }
                  }}
                >
                  Edit Structure
                </Button>
              </Box>

              {/* Salary Summary */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                  { 
                    label: 'Annual Base Wage', 
                    value: `₹${selectedSalary.baseWage?.toLocaleString('en-IN')}`, 
                    color: '#714B67',
                    icon: <AttachMoney />
                  },
                  { 
                    label: 'Annual Salary', 
                    value: `₹${selectedSalary.totalSalary?.toLocaleString('en-IN')}`, 
                    color: '#4caf50',
                    icon: <TrendingUp />
                  },
                  { 
                    label: 'Monthly Salary', 
                    value: `₹${selectedSalary.monthlySalary?.toLocaleString('en-IN')}`, 
                    color: '#2196f3',
                    icon: <Paid />
                  },
                  { 
                    label: 'Total Deductions', 
                    value: `₹${Object.values(selectedSalary.deductions || {}).reduce((sum, ded) => sum + (ded.value || 0), 0).toLocaleString('en-IN')}`, 
                    color: '#f44336',
                    icon: <TrendingDown />
                  }
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card 
                      sx={{ 
                        borderRadius: '8px',
                        backgroundColor: alpha(item.color, 0.05),
                        border: `1px solid ${alpha(item.color, 0.2)}`,
                        height: '100%'
                      }}
                    >
                      <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                        <Box sx={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          backgroundColor: alpha(item.color, 0.1),
                          borderRadius: '8px',
                          mb: 1
                        }}>
                          {React.cloneElement(item.icon, { sx: { color: item.color, fontSize: 24 } })}
                        </Box>
                        <Typography variant="h5" fontWeight="700" color={item.color} gutterBottom>
                          {item.value}
                        </Typography>
                        <Typography variant="body2" color="#666666" fontWeight="500">
                          {item.label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Salary Components */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3, borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" fontWeight="600" color="#2c3e50" gutterBottom sx={{ mb: 3 }}>
                      Salary Components
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(selectedSalary.components || {}).map(([key, component]) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <Card variant="outlined" sx={{ borderRadius: '6px' }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="#666666">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </Typography>
                                <Chip
                                  icon={component.isPercentage ? <Percent sx={{ fontSize: 14 }} /> : <AttachMoney sx={{ fontSize: 14 }} />}
                                  label={component.isPercentage ? `${component.percentage}%` : 'Fixed'}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: alpha('#714B67', 0.1),
                                    color: '#714B67',
                                    fontWeight: 500
                                  }}
                                />
                              </Box>
                              <Typography variant="h6" fontWeight="600" color="#2c3e50" sx={{ mt: 1 }}>
                                ₹{component.value?.toLocaleString('en-IN')}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" fontWeight="600" color="#2c3e50" gutterBottom sx={{ mb: 3 }}>
                      Deductions
                    </Typography>
                    <Box>
                      {Object.entries(selectedSalary.deductions || {}).map(([key, deduction]) => (
                        <Box key={key} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #f0f0f0' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" color="#666666">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Typography>
                            <Chip
                              icon={deduction.isPercentage ? <Percent sx={{ fontSize: 14 }} /> : <AttachMoney sx={{ fontSize: 14 }} />}
                              label={deduction.isPercentage ? `${deduction.percentage}%` : 'Fixed'}
                              size="small"
                              sx={{ 
                                backgroundColor: alpha('#f44336', 0.1),
                                color: '#f44336',
                                fontWeight: 500
                              }}
                            />
                          </Box>
                          <Typography variant="h6" fontWeight="600" color="#f44336">
                            ₹{deduction.value?.toLocaleString('en-IN')}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        {/* Salary List View */}
        {viewMode === 'list' && (
          <Paper sx={{ 
            p: 3, 
            borderRadius: '12px',
            border: '1px solid #e0e0e0'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="600" color="#2c3e50">
                Employee Salary Structures
              </Typography>
              <Chip 
                label={`${salaries.length} Employees`}
                sx={{ backgroundColor: alpha('#714B67', 0.1), color: '#714B67', fontWeight: 500 }}
              />
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                <CircularProgress size={50} sx={{ color: '#714B67' }} />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Employee</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Base Wage</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Annual Salary</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Monthly Salary</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salaries.map((salary) => {
                      const summary = calculateSalarySummary(salary);
                      return (
                        <TableRow 
                          key={salary._id} 
                          hover
                          sx={{ 
                            '&:hover': {
                              backgroundColor: alpha('#714B67', 0.02)
                            }
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ 
                                width: 32, 
                                height: 32, 
                                borderRadius: '50%', 
                                backgroundColor: alpha('#714B67', 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                                fontWeight: 600,
                                color: '#714B67',
                                fontSize: '14px'
                              }}>
                                {salary.employee?.firstName?.charAt(0)}
                              </Box>
                              <Box>
                                <Typography variant="body2" fontWeight="500" color="#2c3e50">
                                  {salary.employee?.firstName} {salary.employee?.lastName}
                                </Typography>
                                <Typography variant="caption" color="#666666">
                                  {salary.employee?.position}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={salary.employee?.department}
                              size="small"
                              sx={{ backgroundColor: alpha('#2196f3', 0.1), color: '#2196f3', fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600" color="#2c3e50">
                              ₹{salary.baseWage?.toLocaleString('en-IN')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600" color="#4caf50">
                              ₹{summary.netAnnual?.toLocaleString('en-IN')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="600" color="#2196f3">
                              ₹{summary.netMonthly?.toFixed(0)?.toLocaleString('en-IN')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(salary)}
                                  sx={{
                                    color: '#714B67',
                                    backgroundColor: alpha('#714B67', 0.1),
                                    '&:hover': {
                                      backgroundColor: alpha('#714B67', 0.2)
                                    }
                                  }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(salary)}
                                  sx={{
                                    color: '#714B67',
                                    backgroundColor: alpha('#714B67', 0.1),
                                    '&:hover': {
                                      backgroundColor: alpha('#714B67', 0.2)
                                    }
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {!loading && salaries.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Paid sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
                <Typography variant="body1" color="#999999" sx={{ mb: 1 }}>
                  No salary structures configured
                </Typography>
                <Typography variant="body2" color="#999999">
                  Click "Add Salary Structure" to get started
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Salary Configuration Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              border: '1px solid #e0e0e0'
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: '#f8f9fa', 
            borderBottom: '1px solid #e0e0e0',
            fontWeight: 600,
            color: '#2c3e50'
          }}>
            Configure Salary Structure
          </DialogTitle>
          
          <DialogContent sx={{ py: 3 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Employee</InputLabel>
              <Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                label="Select Employee"
                sx={{
                  borderRadius: '8px',
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#714B67',
                    borderWidth: '2px'
                  }
                }}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 28, 
                        height: 28, 
                        borderRadius: '50%', 
                        backgroundColor: alpha('#714B67', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        fontWeight: 600,
                        color: '#714B67',
                        fontSize: '12px'
                      }}>
                        {emp.firstName?.charAt(0)}
                      </Box>
                      <Box>
                        <Typography variant="body2">
                          {emp.firstName} {emp.lastName}
                        </Typography>
                        <Typography variant="caption" color="#666666">
                          {emp.department} • {emp.position}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Base Wage (Annual)"
              type="number"
              fullWidth
              sx={{ mb: 3 }}
              value={formData.baseWage}
              onChange={(e) => setFormData({ ...formData, baseWage: Number(e.target.value) })}
              InputProps={{
                startAdornment: (
                  <AttachMoney sx={{ color: '#666666', mr: 1, fontSize: 20 }} />
                )
              }}
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

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight="600" color="#2c3e50" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 1, color: '#714B67' }} />
                Salary Components
              </Typography>
              
              <Grid container spacing={2}>
                {Object.entries(formData.components).map(([key, component]) => (
                  <Grid item xs={12} key={key}>
                    <Card variant="outlined" sx={{ borderRadius: '8px' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={4}>
                            <Typography variant="body2" fontWeight="500" color="#2c3e50">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={component.isPercentage}
                                  onChange={(e) => updateComponent('components', key, 'isPercentage', e.target.checked)}
                                  size="small"
                                  color="primary"
                                />
                              }
                              label={
                                <Typography variant="body2" color="#666666">
                                  {component.isPercentage ? 'Percentage' : 'Fixed Amount'}
                                </Typography>
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={5}>
                            <TextField
                              label={component.isPercentage ? 'Percentage (%)' : 'Amount (₹)'}
                              type="number"
                              fullWidth
                              value={component.isPercentage ? component.percentage : component.value}
                              onChange={(e) =>
                                updateComponent(
                                  'components',
                                  key,
                                  component.isPercentage ? 'percentage' : 'value',
                                  Number(e.target.value)
                                )
                              }
                              size="small"
                              InputProps={{
                                startAdornment: component.isPercentage ? (
                                  <Percent sx={{ color: '#666666', mr: 1, fontSize: 16 }} />
                                ) : (
                                  <AttachMoney sx={{ color: '#666666', mr: 1, fontSize: 16 }} />
                                )
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="600" color="#2c3e50" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <TrendingDown sx={{ mr: 1, color: '#f44336' }} />
                Deductions
              </Typography>
              
              <Grid container spacing={2}>
                {Object.entries(formData.deductions).map(([key, deduction]) => (
                  <Grid item xs={12} key={key}>
                    <Card variant="outlined" sx={{ borderRadius: '8px' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={4}>
                            <Typography variant="body2" fontWeight="500" color="#2c3e50">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={deduction.isPercentage}
                                  onChange={(e) => updateComponent('deductions', key, 'isPercentage', e.target.checked)}
                                  size="small"
                                  color="error"
                                />
                              }
                              label={
                                <Typography variant="body2" color="#666666">
                                  {deduction.isPercentage ? 'Percentage' : 'Fixed Amount'}
                                </Typography>
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={5}>
                            <TextField
                              label={deduction.isPercentage ? 'Percentage (%)' : 'Amount (₹)'}
                              type="number"
                              fullWidth
                              value={deduction.isPercentage ? deduction.percentage : deduction.value}
                              onChange={(e) =>
                                updateComponent(
                                  'deductions',
                                  key,
                                  deduction.isPercentage ? 'percentage' : 'value',
                                  Number(e.target.value)
                                )
                              }
                              size="small"
                              InputProps={{
                                startAdornment: deduction.isPercentage ? (
                                  <Percent sx={{ color: '#666666', mr: 1, fontSize: 16 }} />
                                ) : (
                                  <AttachMoney sx={{ color: '#666666', mr: 1, fontSize: 16 }} />
                                )
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button 
              onClick={() => setOpenDialog(false)}
              sx={{
                color: '#666666',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: alpha('#666666', 0.04)
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              startIcon={<Save />}
              sx={{
                backgroundColor: '#714B67',
                color: '#ffffff',
                textTransform: 'none',
                borderRadius: '8px',
                px: 3,
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#5d3d54'
                }
              }}
            >
              Save Structure
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default Salary;
