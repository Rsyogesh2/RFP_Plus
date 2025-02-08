import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
 
  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Send POST request using fetch
            const res = await fetch(`${API_URL}/request-reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            // Handle response
            const data = await res.json();

            if (res.ok) {
                setMessage(data.message); // Success message from the backend
            } else {
                setMessage('Error sending reset email');
            }
        } catch (err) {
            setMessage('Error sending reset email');
        }
    };

  return (
    <div className="forgot-password-container">
      <h2 className="forgot-title">Forgot Password</h2>
      <p className="forgot-subtitle">Enter your email to receive a reset link</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address <span className="required">*</span></label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>
        <button type="submit" className="forgot-btn">Send Reset Link</button>
      </form>
      <a href="/" className="back-to-login">← Back to Login</a>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPassword;
