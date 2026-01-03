import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  alpha,
  LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Visibility,
  VisibilityOff,
  Security,
  ArrowBack
} from '@mui/icons-material';

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handlePasswordChange = (password) => {
    setNewPassword(password);
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const getStrengthColor = () => {
    if (passwordStrength >= 75) return '#4caf50';
    if (passwordStrength >= 50) return '#ff9800';
    return '#f44336';
  };

  const getStrengthLabel = () => {
    if (passwordStrength >= 75) return 'Strong';
    if (passwordStrength >= 50) return 'Moderate';
    return 'Weak';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      
      // Update user to mark first login as false
      updateUser({ ...user, isFirstLogin: false });
      
      setSuccess('Password changed successfully! Redirecting to dashboard...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2
          }}
        >
          {!user?.isFirstLogin && (
            <IconButton
              onClick={handleBack}
              sx={{ mb: 2 }}
            >
              <ArrowBack />
            </IconButton>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Security sx={{ fontSize: 40, color: '#714B67', mr: 2 }} />
            <Typography variant="h4" fontWeight="600">
              Change Password
            </Typography>
          </Box>

          {user?.isFirstLogin && (
            <Alert severity="info" sx={{ mb: 3 }}>
              For security reasons, you must change your password before accessing the system.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#714B67' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha('#714B67', 0.3)
                  }
                }
              }}
            />

            <TextField
              fullWidth
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#714B67' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha('#714B67', 0.3)
                  }
                }
              }}
            />

            {newPassword && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Password Strength
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: getStrengthColor(), fontWeight: 600 }}
                  >
                    {getStrengthLabel()}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha('#714B67', 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getStrengthColor(),
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            )}

            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              error={confirmPassword && newPassword !== confirmPassword}
              helperText={
                confirmPassword && newPassword !== confirmPassword
                  ? 'Passwords do not match'
                  : ''
              }
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#714B67' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha('#714B67', 0.3)
                  }
                }
              }}
            />

            <Box
              sx={{
                p: 2,
                backgroundColor: alpha('#714B67', 0.05),
                borderRadius: 2,
                mb: 3
              }}
            >
              <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                Password Requirements:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  At least 6 characters long
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Different from current password
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  Include uppercase, lowercase, numbers & special characters for stronger security
                </Typography>
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                backgroundColor: '#714B67',
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#5a3a52'
                }
              }}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default ChangePassword;
