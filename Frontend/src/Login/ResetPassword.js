import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/rfp-logo.jpeg";

const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = useRef([]);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = decodeURIComponent(urlParams.get("token"));
        const emailFromUrl = decodeURIComponent(urlParams.get("email"));

        if (tokenFromUrl) setToken(tokenFromUrl);
        else setMessage("Invalid or missing token.");

        if (emailFromUrl) setEmail(emailFromUrl);
    }, []);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [cooldown]);
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) return setMessage("Please fill in both password fields.");
        if (password !== confirmPassword) return setMessage("Passwords do not match.");
        if (password.length < 8) return setMessage("Password must be at least 8 characters long.");
        if (!token) return setMessage("Invalid or missing token.");
        setLoading(true);
        //send Otp to email
        try {
            const res = await fetch(`${API_URL}/get-otp?email=${email}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            console.log("Response:", data);
            setLoading(false);
            if (res.ok) {
                setMessage("OTP sent to your email. Please check your inbox.");
            } else {
                setMessage(data.message || "Error sending OTP.");
            }
        } catch (error) {
            setLoading(false);
            setMessage("An error occurred. Please try again.");
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();

        // if (!password || !confirmPassword) return setMessage("Please fill in both password fields.");
        // if (password !== confirmPassword) return setMessage("Passwords do not match.");
        // if(password.length < 8) return setMessage("Password must be at least 8 characters long.");
        if (otp.length < 6) return setMessage("Please enter a valid OTP.");
        if (!token) return setMessage("Invalid or missing token.");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, email, password, otp }),
            });
            const data = await res.json();
            console.log("Response:", data);
            setLoading(false);
            if (res.ok) {
                setMessage("Password reset successful. Redirecting to login page...");
                setTimeout(() => navigate("/"), 3000);
            } else {
                setMessage(data.message || "Error resetting password.");
            }
        } catch {
            setLoading(false);
            setMessage("An error occurred. Please try again.");
        }
    };

    // const handleActivateLogin = async () => {
    //     if (!otp) return setMessage("Please enter the OTP.");

    //     setLoading(true);

    //     try {
    //         const res = await fetch(`${API_URL}/activate-login`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ email, otp }),
    //         });
    //         const data = await res.json();
    //         setLoading(false);

    //         if (res.ok) {
    //             setMessage("Login activated. Redirecting...");
    //             setTimeout(() => navigate("/"), 3000);
    //         } else {
    //             setMessage(data.message || "Invalid OTP.");
    //         }
    //     } catch {
    //         setLoading(false);
    //         setMessage("An error occurred during activation.");
    //     }
    // };


    const handleChange = (e, index) => {
        const val = e.target.value.replace(/\D/, ''); // Allow only digit
        if (!val) return;

        const newOtp = otp.split('');
        newOtp[index] = val;
        setOtp(newOtp.join('').slice(0, 6));

        // Move focus to next input
        if (val && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        const newOtp = otp.split('');

        if (e.key === 'Backspace') {
            e.preventDefault(); // prevent default backspace behavior

            if (newOtp[index]) {
                // Clear current value
                newOtp[index] = '';
                setOtp(newOtp.join(''));
            } else if (index > 0) {
                // Move to previous box and clear it
                inputRefs.current[index - 1]?.focus();
                newOtp[index - 1] = '';
                setOtp(newOtp.join(''));
            }
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (paste.length === 6) {
            setOtp(paste);
            paste.split('').forEach((digit, idx) => {
                if (inputRefs.current[idx]) {
                    inputRefs.current[idx].value = digit;
                }
            });
            inputRefs.current[5]?.focus();
        }
        e.preventDefault();
    };
    const handleResend = (e) => {
        e.preventDefault();
        alert("Resend OTP");
        handlePasswordSubmit(e); // Call the function to resend OTP
        setOtp(""); // Clear the OTP input
        setCooldown(60); // Start 60-second cooldown
    };


    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="flex w-[70%] h-[90%] shadow-lg rounded-lg overflow-hidden bg-white">
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

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                            {Array(6)
                                .fill(0)
                                .map((_, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => (inputRefs.current[i] = el)}
                                        type="text"
                                        maxLength={1}
                                        inputMode="numeric"
                                        value={otp[i] || ''}
                                        onChange={(e) => handleChange(e, i)}
                                        onKeyDown={(e) => handleKeyDown(e, i)}
                                        className="w-12 h-12 text-center border border-gray-300 rounded-md text-xl focus:outline-none focus:border-blue-500"
                                    />
                                ))}
                        </div>
                        <div className="space-y-2">
                            {/* Top Right Resend OTP */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={cooldown > 0}
                                    className={`py-2 px-3 rounded-md text-xs font-medium text-center transition duration-300 !bg-inherit
                                      ${cooldown > 0
                                            ? '!text-blue-300 cursor-not-allowed'
                                            : '!text-blue-600 hover:underline'}`}
                                >
                                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                                </button>

                            </div>

                            {/* Full-width Activate Button */}
                            <button
                                onClick={handleSubmit}
                                className={`w-full uppercase font-bold py-2 rounded-md transition text-white 
      ${otp.length === 6
                                        ? 'bg-orange-500 hover:bg-orange-600'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? "Activating..." : "Activate Login"}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );

};

export default ResetPassword;
