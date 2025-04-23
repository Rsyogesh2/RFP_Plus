import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = decodeURIComponent(urlParams.get("token"));
        const emailFromUrl = decodeURIComponent(urlParams.get("email"));

        if (tokenFromUrl) setToken(tokenFromUrl);
        else setMessage("Invalid or missing token.");

        if (emailFromUrl) setEmail(emailFromUrl);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) return setMessage("Please fill in both password fields.");
        if (password !== confirmPassword) return setMessage("Passwords do not match.");

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            setLoading(false);

            if (res.ok) {
                setMessage("Password reset successful. Enter OTP to activate login.");
            } else {
                setMessage(data.message || "Error resetting password.");
            }
        } catch {
            setLoading(false);
            setMessage("An error occurred. Please try again.");
        }
    };

    const handleActivateLogin = async () => {
        if (!otp) return setMessage("Please enter the OTP.");

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/activate-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            setLoading(false);

            if (res.ok) {
                setMessage("Login activated. Redirecting...");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setMessage(data.message || "Invalid OTP.");
            }
        } catch {
            setLoading(false);
            setMessage("An error occurred during activation.");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="flex w-[70%] h-[80%] shadow-lg rounded-lg overflow-hidden bg-white">
                {/* Left branding panel */}
                <div className="w-1/2 bg-gray-100 flex flex-col justify-center items-center p-10">
                    <h2 className="text-2xl text-gray-700">Welcome to</h2>
                    <h1 className="text-4xl font-bold mt-2">
                        <span className="text-blue-600">RFP</span>
                        <span className="text-orange-500">manage</span>
                    </h1>
                </div>
    
                {/* Right form panel */}
                <div className="w-1/2 flex flex-col justify-center px-10 py-16">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-700">Login</h3>
    
                    {message && <p className="text-red-500 mb-4">{message}</p>}
    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                            placeholder="Email address (not editable)"
                        />
                        <input
                            type="password"
                            placeholder="Enter your new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full bg-orange-500 text-white font-semibold py-2 rounded-md hover:bg-orange-600 transition"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "SUBMIT"}
                        </button>
                    </form>
    
                    <div className="mt-6 space-y-4">
                        <input
                            type="text"
                            placeholder="Enter your OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                        />
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleActivateLogin}
                                className="w-full bg-orange-500 text-white font-semibold py-2 rounded-md hover:bg-orange-600 transition"
                                disabled={loading}
                            >
                                {loading ? "Activating..." : "ACTIVATE LOGIN"}
                            </button>
                            <button
                                type="button"
                                onClick={() => alert("Resend OTP logic here")}
                                className="ml-4 text-blue-600 text-sm hover:underline"
                            >
                                Resend OTP
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    
};

export default ResetPassword;
