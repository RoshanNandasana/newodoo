// This file will contain helper functions for generating login IDs and temporary passwords

function generateLoginId(companyCode, initials, yearOfJoining, serialNumber) {
  return `${companyCode}${initials}${yearOfJoining}${serialNumber.toString().padStart(4, '0')}`;
}

function generateTempPassword(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

module.exports = { generateLoginId, generateTempPassword };
