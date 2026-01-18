import React, { useRef } from "react"
import "./GuestModeModal.css"

import { LogIn, User } from "lucide-react"

import ModalPortal from "../ModalPortal"
import useModalClose from "../Hooks/useModalClose"
import { useTheme } from "../Context/ThemeContext"


export default function GuestModeModal({ isOpen, onCancel, onSignup }) {

    const modalRef = useRef(null)
    useModalClose(modalRef, onCancel)

    const { isDarkMode } = useTheme()

    if (!isOpen) return null


    return (
        <ModalPortal>
            <div className={`guest-auth-overlay ${isDarkMode ? "dark-mode" : ""}`}>
                <div className='guest-auth-wrapper'>
                    <div className='guest-auth-card' ref={modalRef}>
                        <div className='guest-auth-header' style={{ backgroundImage: 'url("./ZenTaskLogo.png")' }}>
                            <div className='guest-auth-icon-wrapper'>
                                <User className='guest-auth-icon' />
                            </div>
                            <h1 className='guest-auth-title'>Welcome to ZenTask</h1>
                            <p className='guest-auth-subtitle'>Organize your tasks with ease</p>
                        </div>

                        <div className='guest-auth-content'>
                            <button className='primary-btn' onClick={() => onSignup()}>
                                <LogIn className='btn-icon' />
                                Sign In or Register
                            </button>

                            <p className='guest-auth-divider'>or</p>

                            <button className='secondary-btn' onClick={() => onCancel()}>
                                <User className='btn-icon' />
                                Continue as Guest
                            </button>

                            <div className='guest-auth-warning'>
                                <svg className='warning-icon' fill='currentColor' viewBox='0 0 20 20'>
                                    <path
                                        fillRule='evenodd'
                                        d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                                <p>
                                    <strong>Note:</strong> Continue as guest, but your tasks won’t be backed up. Create
                                    an account to keep them safe.
                                </p>
                            </div>

                            <p className='guest-auth-footer'>
                                By continuing, you agree to our <a href='#'>Terms</a> and <a href='#'>Privacy Policy</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ModalPortal>
    )
}
