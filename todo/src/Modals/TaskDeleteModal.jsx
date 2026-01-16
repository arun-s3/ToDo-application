import React, {useEffect, useRef} from "react"
import "./TaskDeleteModal.css"

import { AlertCircle, Trash2, X } from "lucide-react"

import ModalPortal from "../ModalPortal"
import useModalClose from "../Hooks/useModalClose"
import { useAuth } from "../Context/AuthContext"


export default function TaskDeleteModal({ isOpen, taskName, isTaskDemo, onConfirm, onCancel, isLoading = false }) {

    const modalRef = useRef(null)
    useModalClose(modalRef, onCancel)

    const { isGuest, guestId } = useAuth() 
    
    if (!isOpen) return null


    return (
        <ModalPortal>
            <div className='delete-backdrop' onClick={onCancel} />

            <div className='delete-modal-wrapper'>
                <div className='delete-modal' ref={modalRef}>
                    <div className='delete-header'>
                        <div className='delete-header-left'>
                            <div className='delete-icon-wrapper'>
                                <AlertCircle />
                            </div>
                            <h2>Delete Task</h2>
                        </div>

                        <button className='delete-close' onClick={onCancel}>
                            <X />
                        </button>
                    </div>

                    <div className='delete-body'> 
                        <p className='delete-text'>
                            {
                                !isTaskDemo 
                                    ? "Are you sure you want to delete this task?"
                                    : "This is a sample task to help you get started."
                            }
                        </p>

                        {taskName && (
                            <div className='delete-task-box'>
                                <p className='delete-task-label'>Task:</p>
                                <p className='delete-task-name'>{taskName}</p>
                            </div>
                        )}

                        <div className='delete-warning'>
                            {
                                !isTaskDemo 
                                    ? "This action cannot be undone. The task will be permanently deleted."
                                    : "Since you’re not signed in, if you revisit later, the demo task may appear again."
                            }
                        </div>
                    </div>

                    <div className='delete-footer'>
                        <button onClick={onCancel} disabled={isLoading} className='btn-cancel'>
                            Cancel
                        </button>

                        <button onClick={onConfirm} disabled={isLoading} className='btn-delete'>
                            <Trash2 />
                            <span>{isLoading ? "Deleting..." : "Delete"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    )
}
