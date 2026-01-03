import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login({ loginId, password });
      
      if (user.isFirstLogin) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#f5f5f5'
      }}
    >
      {/* Left Side - Brand Section */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: '#714B67',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: { xs: '40px 30px', md: '60px 80px', lg: '80px 100px' },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Main Title */}
        <Box sx={{ mb: { xs: 4, md: 5, lg: 6 } }}>
          <Typography
            sx={{
              fontSize: { xs: '36px', md: '42px', lg: '48px' },
              fontWeight: 700,
              color: '#ffffff',
              mb: 1,
              lineHeight: 1.1,
              letterSpacing: '-0.5px'
            }}
          >
            Dayflow
          </Typography>
          
          <Typography
            sx={{
              fontSize: { xs: '20px', md: '22px', lg: '24px' },
              fontWeight: 400,
              color: '#ffffff',
              mb: { xs: 3, md: 4 },
              opacity: 0.95,
              letterSpacing: '0.2px'
            }}
          >
            Human Resource Management
          </Typography>
          
          <Typography
            sx={{
              fontSize: { xs: '18px', md: '20px', lg: '22px' },
              fontWeight: 300,
              color: '#e8d4e0',
              mb: { xs: 4, md: 5 },
              fontStyle: 'italic',
              lineHeight: 1.4
            }}
          >
            Every workday, perfectly aligned.
          </Typography>
        </Box>

        {/* Description Section */}
        <Box sx={{ mb: { xs: 5, md: 6, lg: 7 } }}>
          <Typography
            sx={{
              fontSize: { xs: '16px', md: '17px', lg: '18px' },
              color: '#e8d4e0',
              lineHeight: 1.6,
              maxWidth: { xs: '100%', md: '500px', lg: '550px' },
              letterSpacing: '0.1px',
              mb: 3
            }}
          >
            Streamline your HR operations with our comprehensive management system. 
            Track attendance, manage leaves, and handle payroll all in one place.
          </Typography>
        </Box>

        {/* Stats Section - Grid Layout */}
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: { xs: 3, md: 4 },
            mb: { xs: 4, md: 5 }
          }}
        >
          {/* Stat 1 */}
          <Box 
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: { xs: '20px 16px', md: '24px 20px' },
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: '28px', md: '32px', lg: '36px' },
                fontWeight: 700,
                color: '#ffffff',
                mb: 1,
                lineHeight: 1
              }}
            >
              500+
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '13px', md: '14px' },
                color: '#e8d4e0',
                fontWeight: 500,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}
            >
              Companies Trust Us
            </Typography>
          </Box>

          {/* Stat 2 */}
          <Box 
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: { xs: '20px 16px', md: '24px 20px' },
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: '28px', md: '32px', lg: '36px' },
                fontWeight: 700,
                color: '#ffffff',
                mb: 1,
                lineHeight: 1
              }}
            >
              99.9%
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '13px', md: '14px' },
                color: '#e8d4e0',
                fontWeight: 500,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}
            >
              Uptime Guaranteed
            </Typography>
          </Box>

          {/* Stat 3 */}
          <Box 
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: { xs: '20px 16px', md: '24px 20px' },
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: '28px', md: '32px', lg: '36px' },
                fontWeight: 700,
                color: '#ffffff',
                mb: 1,
                lineHeight: 1
              }}
            >
              24/7
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '13px', md: '14px' },
                color: '#e8d4e0',
                fontWeight: 500,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}
            >
              Support Available
            </Typography>
          </Box>
        </Box>

        {/* Feature Highlights */}
        <Box sx={{ mt: 'auto' }}>
          <Typography
            sx={{
              fontSize: { xs: '14px', md: '15px' },
              color: '#ffffff',
              fontWeight: 500,
              mb: 2,
              opacity: 0.9
            }}
          >
            Key Features:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {['Attendance Tracking', 'Leave Management', 'Payroll Processing', 'Performance Reviews', 'Compliance'].map((feature) => (
              <Box
                key={feature}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '6px 16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: '12px', md: '13px' },
                    color: '#ffffff',
                    fontWeight: 400,
                    opacity: 0.9
                  }}
                >
                  {feature}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Subtle Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)',
            pointerEvents: 'none'
          }}
        />

        {/* Geometric Accent Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '-60px',
            width: '120px',
            height: '120px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            transform: 'rotate(45deg)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '-40px',
            width: '80px',
            height: '80px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transform: 'rotate(15deg)'
          }}
        />
      </Box>

      {/* Right Side - Form Section */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: { xs: '20px', md: '30px', lg: '40px' }
        }}
      >
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: { xs: '16px', md: '20px', lg: '24px' },
            padding: { xs: '30px 25px', md: '40px 35px', lg: '50px 60px' },
            maxWidth: { xs: '400px', md: '450px', lg: '500px' },
            width: '100%',
            boxShadow: '0 6px 24px rgba(0,0,0,0.08)'
          }}
        >
          <Box sx={{ mb: { xs: 6, md: 8 } }}>
            <Typography
              sx={{
                fontSize: { xs: '26px', md: '30px', lg: '32px' },
                fontWeight: 600,
                color: '#714B67',
                mb: 1,
                letterSpacing: '-0.3px'
              }}
            >
              Sign In
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '14px', md: '15px' },
                color: '#666666',
                fontWeight: 400
              }}
            >
              Enter your credentials to access your account
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: { xs: 3, md: 4 }, 
                borderRadius: '8px',
                fontSize: { xs: '13px', md: '14px' }
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#714B67',
                  mb: 1.5
                }}
              >
                Login ID
              </Typography>
              <TextField
                fullWidth
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
                autoFocus
                placeholder="Enter your login ID"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: '#fafafa',
                    fontSize: '15px',
                    '& fieldset': {
                      borderColor: '#e0e0e0'
                    },
                    '&:hover fieldset': {
                      borderColor: '#c0c0c0'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#714B67',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: { xs: '12px 14px', md: '14px 16px' },
                    fontSize: { xs: '14px', md: '15px' }
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#714B67',
                  mb: 1.5
                }}
              >
                Password
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#757575', fontSize: { xs: '18px', md: '20px' } }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: '#fafafa',
                    fontSize: '15px',
                    '& fieldset': {
                      borderColor: '#e0e0e0'
                    },
                    '&:hover fieldset': {
                      borderColor: '#c0c0c0'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#714B67',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: { xs: '12px 14px', md: '14px 16px' },
                    fontSize: { xs: '14px', md: '15px' }
                  }
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                mt: { xs: 4, md: 5 },
                py: { xs: 1.75, md: 2 },
                borderRadius: '8px',
                backgroundColor: '#714B67',
                color: '#ffffff',
                fontSize: { xs: '15px', md: '16px' },
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '0.3px',
                boxShadow: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#5d3d54',
                  boxShadow: '0 4px 12px rgba(113, 75, 103, 0.3)',
                  transform: 'translateY(-1px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0',
                  color: '#9e9e9e',
                  transform: 'none'
                }
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials Section */}
          <Box 
            sx={{ 
              mt: { xs: 4, md: 5 }, 
              pt: { xs: 3, md: 4 }, 
              borderTop: '1px solid #f0f0f0' 
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: '13px', md: '14px' },
                color: '#714B67',
                fontWeight: 600,
                mb: 2,
                textAlign: 'center'
              }}
            >
              Demo Credentials
            </Typography>
            
            {/* Admin Credentials */}
            <Box 
              sx={{ 
                backgroundColor: '#f9f5f8',
                borderRadius: '10px',
                padding: { xs: '12px 16px', md: '14px 18px' },
                mb: 2,
                border: '1px solid #e8d4e0'
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '11px', md: '12px' },
                  color: '#714B67',
                  fontWeight: 600,
                  mb: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                👤 Admin Account
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: { xs: '13px', md: '14px' },
                    color: '#333333',
                    fontFamily: 'monospace'
                  }}
                >
                  ID: <Box component="span" sx={{ fontWeight: 600, color: '#714B67' }}>ADMIN001</Box>
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: '13px', md: '14px' },
                    color: '#333333',
                    fontFamily: 'monospace'
                  }}
                >
                  Password: <Box component="span" sx={{ fontWeight: 600, color: '#714B67' }}>namra123</Box>
                </Typography>
              </Box>
            </Box>

            {/* Employee Credentials */}
            <Box 
              sx={{ 
                backgroundColor: '#f5f9ff',
                borderRadius: '10px',
                padding: { xs: '12px 16px', md: '14px 18px' },
                mb: 2,
                border: '1px solid #d4e4f7'
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '11px', md: '12px' },
                  color: '#2962ff',
                  fontWeight: 600,
                  mb: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                👨‍💼 Employee Account
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: { xs: '13px', md: '14px' },
                    color: '#333333',
                    fontFamily: 'monospace'
                  }}
                >
                  ID: <Box component="span" sx={{ fontWeight: 600, color: '#2962ff' }}>OIJDODRS20260007</Box>
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: '13px', md: '14px' },
                    color: '#333333',
                    fontFamily: 'monospace'
                  }}
                >
                  Password: <Box component="span" sx={{ fontWeight: 600, color: '#2962ff' }}>123456</Box>
                </Typography>
              </Box>
            </Box>

            <Typography
              sx={{
                fontSize: { xs: '11px', md: '12px' },
                color: '#999999',
                textAlign: 'center',
                lineHeight: 1.4,
                mt: 2
              }}
            >
              Use these credentials to explore the application features
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;
