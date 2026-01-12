import React, { useState } from "react"
import "./AuthModal.css"

import { api } from "../api/axiosInstance"
import { toast } from 'sonner'
import {Lock, User, Eye, EyeOff, X, CheckCircle, AlertCircle} from "lucide-react"


const AuthModal = ({ onModalClose, onSignUpOrIn, onMigrateGuest }) => {

    const [isSignIn, setIsSignIn] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState({})
    const [successMessage, setSuccessMessage] = useState("")
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    })

    const [loading, setLoading] = useState(false)

    const validationPatterns = {
        username: /^[a-zA-Z0-9_-]{3,20}$/,
        password: /^.{6,}$/,
    }

    const validateField = (name, value) => {
        const newErrors = { ...errors }

        if (name === "username") {
            if (!value) newErrors.username = "Username is required"
            else if (!validationPatterns.username.test(value))
                newErrors.username =
                    "Username must be 3-20 characters (letters, numbers, underscore, hyphen only)"
            else delete newErrors.username
        }

        if (name === "password") {
            if (!value) newErrors.password = "Password is required"
            else if (!validationPatterns.password.test(value))
                newErrors.password = "Password must be at least 6 characters"
            else delete newErrors.password
        }

        if (name === "confirmPassword" && !isSignIn) {
            if (!value)
                newErrors.confirmPassword = "Please confirm your password"
            else if (value !== formData.password)
                newErrors.confirmPassword = "Passwords do not match"
            else delete newErrors.confirmPassword
        }

        setErrors(newErrors);
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((p) => ({ ...p, [name]: value }))
        validateField(name, value)
        setSuccessMessage("")
    }

    const submitDetails = async (userDetails) => {
        console.log("Inside submitDetails()...")
        setLoading(true)
        try {
            const response = await api.post(`/${isSignIn ? "signin" : "signup"}`, { userDetails });

            if (response && response?.data?.success) {
                
                onMigrateGuest()

                console.log("response.data.user", response.data.user)
                onSignUpOrIn(response.data.user)
                setLoading(false)

                if(!isSignIn){
                    toast.success("Registered successfully!")
                }

                return true
            }
        } catch (error) {
            console.error("Signup error:", error)

            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error(
                    "Something went wrong! Please check your network and retry again later."
                )
            }

            setLoading(false)
            return false
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (Object.keys(errors).length !== 0) {
            toast.error("Please check the errors and try again!")
            return
        }

        setErrors({});

        const userDetails = {
            username: formData.username,
            password: formData.password,
        }
        const isSuccess = await submitDetails(userDetails)

        if (isSuccess) {
            setSuccessMessage(
                isSignIn
                    ? `Welcome back, ${formData.username}!`
                    : `Account created successfully for ${formData.username}!`
            )
            onModalClose()
        }
    }

    const toggleMode = () => {
        setIsSignIn(!isSignIn)
        setErrors({})
        setFormData({ username: "", password: "", confirmPassword: "" })
        setSuccessMessage("")
    }

    return (
        <div className="auth-backdrop">
            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>{isSignIn ? "Welcome" : "Create Account"}</h1>
                        <p>
                            {isSignIn
                                ? "Sign in to manage and back up your tasks."
                                : "Join us to start organizing"}
                        </p>
                    </div>

                    <div className="auth-body">
                        {successMessage && (
                            <div className="success-box">
                                <CheckCircle size={20} />
                                <p>{successMessage}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Username</label>
                                <div className="input-wrapper">
                                    <User size={20} />
                                    <input
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={
                                            errors.username ? "error" : ""
                                        }
                                        placeholder="Enter your username"
                                    />
                                </div>
                                {errors.username && (
                                    <span className="error-text">
                                        <AlertCircle size={14} />{" "}
                                        {errors.username}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <Lock size={20} />
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={
                                            errors.password ? "error" : ""
                                        }
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        className="eye-btn"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className="error-text">
                                        <AlertCircle size={14} />{" "}
                                        {errors.password}
                                    </span>
                                )}
                            </div>

                            {!isSignIn && (
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <div className="input-wrapper">
                                        <Lock size={20} />
                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={
                                                errors.confirmPassword
                                                    ? "error"
                                                    : ""
                                            }
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            className="eye-btn"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={20} />
                                            ) : (
                                                <Eye size={20} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button className="submit-btn">
                                {isSignIn ? "Sign In" : "Create Account"}
                            </button>
                            <button
                                className="cancel-btn"
                                onClick={onModalClose}
                            >
                                Cancel
                            </button>
                        </form>

                        <p className="toggle-text">
                            {isSignIn
                                ? "Don't have an account?"
                                : "Already have an account?"}
                            <button onClick={toggleMode}>
                                {loading
                                    ? "Submiting..."
                                    : isSignIn
                                    ? " Sign Up"
                                    : " Sign In"}
                            </button>
                        </p>
                    </div>
                </div>

                <p className="auth-footer">
                    ZenTask keeps your tasks safe and private.
                </p>
            </div>
        </div>
    )
}

export default AuthModal;
