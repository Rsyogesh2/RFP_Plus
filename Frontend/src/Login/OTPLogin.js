import React, { useState } from 'react';

function OTPVerification() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSendingOTP, setIsSendingOTP] = useState(false); // Track OTP sending state

  
  const handleSendOTP = async () => {
    setIsSendingOTP(true);
    try {
      const response = await fetch('/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok)   
 {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data);   

      setError('');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await fetch('/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data);
      // Redirect to the desired page upon successful verification
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        disabled={isSendingOTP} // Disable OTP field while sending
      />
      <button onClick={handleSendOTP} disabled={isSendingOTP}>
        {isSendingOTP ? 'Sending OTP...' : 'Send OTP'}
      </button>
      <button onClick={handleVerifyOTP} disabled={!email || !otp}>
        Verify OTP
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}

export default OTPVerification;