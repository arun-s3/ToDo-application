import React, { useState } from "react"
import "./GuestModeModal.css"

import { LogIn, User } from "lucide-react"


export default function GuestModeModal() {

  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) return null

  return (
    <div className="auth-overlay">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon-wrapper">
              <User className="auth-icon" />
            </div>
            <h1 className="auth-title">Welcome to ZenTask</h1>
            <p className="auth-subtitle">Organize your tasks with ease</p>
          </div>

          <div className="auth-content">
            <button className="primary-btn">
              <LogIn className="btn-icon" />
              Sign In or Register
            </button>

            <p className="auth-divider">or</p>

            <button className="secondary-btn">
              <User className="btn-icon" />
              Continue as Guest
            </button>

            <div className="auth-warning">
              <svg className="warning-icon" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p>
                <strong>Note:</strong> Continue as guest, but your tasks won’t be backed up.
                Create an account to keep them safe.
              </p>
            </div>

            <p className="auth-footer">
              By continuing, you agree to our{" "}
              <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
