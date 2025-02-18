import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";

const ActivateAccount = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = decodeURIComponent(urlParams.get("token"));
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setMessage("Invalid or missing activation token.");
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setMessage("Please enter both password fields.");
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/activate-account`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();
            setLoading(false);

            if (response.ok) {
                setMessage("Account activated! Redirecting to login...");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setMessage(data.message || "Error activating account.");
            }
        } catch (error) {
            setLoading(false);
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="activate-container">
            <h2>Set Your Password</h2>
            {message && <p className="error-message">{message}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Activating..." : "Set Password"}
                </button>
            </form>
        </div>
    );
};

export default ActivateAccount;
