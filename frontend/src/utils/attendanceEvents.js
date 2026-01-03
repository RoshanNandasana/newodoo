// Global attendance event system for real-time updates across modules

export const ATTENDANCE_UPDATED_EVENT = 'attendanceUpdated';

// Dispatch attendance update event
export const emitAttendanceUpdate = () => {
  const event = new CustomEvent(ATTENDANCE_UPDATED_EVENT);
  window.dispatchEvent(event);
};

// Listen for attendance updates
export const onAttendanceUpdate = (callback) => {
  window.addEventListener(ATTENDANCE_UPDATED_EVENT, callback);
  return () => window.removeEventListener(ATTENDANCE_UPDATED_EVENT, callback);
};
