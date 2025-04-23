import React, { useState } from 'react';

const LoginResetForm = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [email] = useState('user@example.com'); // Replace with actual email from props/context

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // Submit new password logic here
    console.log('Submitting new password:', newPassword);
  };

  const handleActivateLogin = () => {
    // Activate login with OTP logic here
    console.log('Activating with OTP:', otp);
  };

  const handleResendOtp = () => {
    // Logic to resend OTP
    console.log('Resending OTP...');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <label className="block text-sm font-medium mb-1">Email address *</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full p-2 mb-3 border border-gray-300 rounded bg-gray-100"
        />

        <label className="block text-sm font-medium mb-1">New password *</label>
        <input
          type="password"
          placeholder="Enter your new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 mb-3 border border-gray-300 rounded"
        />

        <label className="block text-sm font-medium mb-1">Confirm password *</label>
        <input
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-orange-500 text-white py-2 rounded font-semibold mb-4"
        >
          SUBMIT
        </button>

        <label className="block text-sm font-medium mb-1">
          Enter OTP (sent to your email id)
        </label>
        <input
          type="text"
          placeholder="Enter your OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-2 mb-1 border border-gray-300 rounded"
        />

        <button
          onClick={handleResendOtp}
          className="text-sm text-blue-600 hover:underline mb-4"
        >
          Resend OTP
        </button>

        <button
          onClick={handleActivateLogin}
          className="w-full bg-orange-500 text-white py-2 rounded font-semibold"
        >
          ACTIVATE LOGIN
        </button>
      </div>
    </div>
  );
};

export default LoginResetForm;
