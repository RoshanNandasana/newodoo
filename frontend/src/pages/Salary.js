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
  Checkbox,
  FormControlLabel
} from '@mui/material';
import Navbar from '../components/Navbar';
import { salaryAPI, employeeAPI } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

function Salary() {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');

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
    } catch (err) {
      setError('Failed to load salaries');
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

    try {
      await salaryAPI.createOrUpdate({
        employeeId: selectedEmployee,
        ...formData
      });
      setSuccess('Salary structure saved successfully!');
      setOpenDialog(false);
      resetForm();
      fetchSalaries();
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
    setFormData({
      ...formData,
      [category]: {
        ...formData[category],
        [key]: {
          ...formData[category][key],
          [field]: value
        }
      }
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navbar />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Salary Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
          >
            Add Salary Structure
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Salary List */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Employee Salaries
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
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Base Wage</TableCell>
                    <TableCell>Annual Salary</TableCell>
                    <TableCell>Monthly Salary</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salaries.map((salary) => (
                    <TableRow key={salary._id}>
                      <TableCell>
                        {salary.employee?.firstName} {salary.employee?.lastName}
                      </TableCell>
                      <TableCell>{salary.employee?.department}</TableCell>
                      <TableCell>₹{salary.baseWage?.toLocaleString()}</TableCell>
                      <TableCell>₹{salary.totalSalary?.toLocaleString()}</TableCell>
                      <TableCell>₹{salary.monthlySalary?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(salary)}
                          size="small"
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loading && salaries.length === 0 && (
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', p: 4 }}>
              No salary structures configured yet
            </Typography>
          )}
        </Paper>

        {/* Salary Configuration Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Configure Salary Structure</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Employee</InputLabel>
              <Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                label="Select Employee"
              >
                {employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} - {emp.department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Base Wage (Annual)"
              type="number"
              fullWidth
              margin="normal"
              value={formData.baseWage}
              onChange={(e) => setFormData({ ...formData, baseWage: Number(e.target.value) })}
            />

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Salary Components
            </Typography>

            {Object.entries(formData.components).map(([key, component]) => (
              <Grid container spacing={2} key={key} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label={key.replace(/([A-Z])/g, ' $1').trim()}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={component.isPercentage}
                        onChange={(e) => updateComponent('components', key, 'isPercentage', e.target.checked)}
                      />
                    }
                    label="Percentage"
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    label={component.isPercentage ? 'Percentage (%)' : 'Fixed Amount'}
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
                  />
                </Grid>
              </Grid>
            ))}

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Deductions
            </Typography>

            {Object.entries(formData.deductions).map(([key, deduction]) => (
              <Grid container spacing={2} key={key} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label={key.replace(/([A-Z])/g, ' $1').trim()}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={deduction.isPercentage}
                        onChange={(e) => updateComponent('deductions', key, 'isPercentage', e.target.checked)}
                      />
                    }
                    label="Percentage"
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    label={deduction.isPercentage ? 'Percentage (%)' : 'Fixed Amount'}
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
                  />
                </Grid>
              </Grid>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default Salary;
