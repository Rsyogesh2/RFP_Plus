import React, { useState, useEffect } from "react";
import "./ResetPassword.css";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
 
    // Extract token and userId from URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get("token");
        const userIdFromUrl = urlParams.get("userId");
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setMessage("Invalid or missing token.");
        }
        if (userIdFromUrl) {
            setUserId(userIdFromUrl);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password, userId }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("Password reset successful. You can now log in.");
            } else {
                setMessage(data.message || "Error resetting password.");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="parent-container">
            <div className="reset-password-container">
                <h2>Reset Your Password</h2>
                {message && <p>{message}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="hidden"
                        value={userId}
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                    <button type="submit">Reset Password</button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;