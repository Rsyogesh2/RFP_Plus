import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For redirection
import "./ResetPassword.css";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // Extract token from URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = decodeURIComponent(urlParams.get("token"));
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setMessage("Invalid or missing token.");
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setMessage("Please fill in both password fields.");
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        setLoading(true); // Start loading

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();
            setLoading(false); // Stop loading

            if (response.ok) {
                setMessage("Password reset successful. Redirecting to login...");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setMessage(data.message || "Error resetting password.");
            }
        } catch (error) {
            setLoading(false);
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="parent-container">
            <div className="reset-password-container">
                <h2>Reset Your Password</h2>
                {message && <p className="error-message">{message}</p>}
                <form onSubmit={handleSubmit}>
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
                    <button type="submit" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
                <a href="/login" className="back-to-login">← Back to Login</a>
            </div>
        </div>
    );
};

export default ResetPassword;
