import { useRef, useEffect, useState } from "react"

import { Edit2 } from "lucide-react"


export default function EditableField({ type = 'input', placeholder = null, value, className, disabled, onStartEdit, onStopEdit, onBlur }) {
    
    const inputRef = useRef(null)
    const mirrorRef = useRef(null)
    const editorRef = useRef(null)

    const [iconLeft, setIconLeft] = useState(0)
    const [iconClicked, setIconClicked] = useState(false)

    useEffect(() => {
        updateWidth()
    }, [value])

    useEffect(() => {
        if (!inputRef.current || !mirrorRef.current) return

        const style = window.getComputedStyle(inputRef.current)
        mirrorRef.current.style.font = style.font
        mirrorRef.current.style.letterSpacing = style.letterSpacing
        mirrorRef.current.style.textTransform = style.textTransform
        mirrorRef.current.style.lineHeight = style.lineHeight

        updateWidth()
    }, [value])

    useEffect(()=> {
        if(iconClicked) {
            onStartEdit()
            inputRef.current.disabled = false
            inputRef.current.focus()

            const sentenceLength = inputRef.current.value.length
            inputRef.current.setSelectionRange(sentenceLength, sentenceLength)  
        }
        else{
            onStopEdit()
        }
    }, [iconClicked])


    const updateWidth = () => {
        if (!mirrorRef.current || !inputRef.current) return

        mirrorRef.current.textContent = inputRef.current.value || " "

        const textWidth = mirrorRef.current.offsetWidth

        const max = inputRef.current.clientWidth - 16 
        const clamped = Math.min(textWidth, max)

        setIconLeft(clamped + 18)

    }

    const handleInput = (e) => {
        updateWidth(e.target.value)
    }

    const autoGrow = (el) => {
        el.style.height = "auto"
        el.style.height = el.scrollHeight + "px"
    }


    return (
        <div className="editable-field">
            <textarea
                ref={inputRef}
                className={className}
                placeholder={placeholder}
                defaultValue={value}
                disabled={disabled}
                onChange={handleInput}
                onInput={(e) => {
                    autoGrow(e.target)
                    updateWidth(e)
                }}
                onFocus={(e) => autoGrow(e.target)}
                onBlur={(e) => {
                    onBlur(e)
                    setIconClicked(false)
                }}
            />

            <span ref={mirrorRef} className="text-mirror">
                {value}
            </span>

            <Edit2
                size={12}
                className={`editor ${iconClicked && "active"}`}
                ref={editorRef}
                style={{ left: iconLeft }}
                onClick={() => setIconClicked((status) => !status)}
            />
        </div>
    )
}
