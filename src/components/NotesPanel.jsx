// src/components/NotesPanel.jsx
import { useRef, useState, useEffect } from "react"
import "./NotesPanel.css"

export default function NotesPanel() {
    const canvasRef = useRef(null)
    const isDrawing = useRef(false)
    const lastPos = useRef(null)
    const maxZoomRef = useRef(3)

    const [notes, setNotes] = useState("")
    const [color, setColor] = useState("#2d1b4e")
    const [brushSize, setBrushSize] = useState(3)
    const [tool, setTool] = useState("pen")
    const [zoom, setZoom] = useState(1)

    useEffect(() => {
        const canvas = canvasRef.current
        const container = canvas.parentElement
        canvas.width = 800
        canvas.height = 500

        // calculate max zoom so canvas never exceeds container
        const maxZoomX = container.offsetWidth / canvas.width
        const maxZoomY = container.offsetHeight / canvas.height
        maxZoomRef.current = Math.max(maxZoomX, maxZoomY, 3)

        const ctx = canvas.getContext("2d")
        ctx.fillStyle = "#fffaf4"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }, [])

    function getPos(e, canvas) {
        const rect = canvas.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        }
    }

    function startDrawing(e) {
        e.preventDefault()
        isDrawing.current = true
        lastPos.current = getPos(e, canvasRef.current)
    }

    function draw(e) {
        e.preventDefault()
        if (!isDrawing.current) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        const pos = getPos(e, canvas)
        ctx.beginPath()
        ctx.moveTo(lastPos.current.x, lastPos.current.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.strokeStyle = tool === "eraser" ? "#fffaf4" : color
        ctx.lineWidth = tool === "eraser" ? 30 : brushSize * 2
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.stroke()
        lastPos.current = pos
    }

    function stopDrawing() {
        isDrawing.current = false
        lastPos.current = null
    }

    function handleWheel(e) {
        e.preventDefault()
        if (e.deltaY < 0) setZoom(z => Math.min(z + 0.1, maxZoomRef.current))
        else setZoom(z => Math.max(z - 0.1, 0.5))
    }

    function clearCanvas() {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        ctx.fillStyle = "#fffaf4"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        setZoom(1)
    }

    const COLORS = ["#2d1b4e", "#e8813a", "#c0392b", "#27ae60", "#2980b9", "#ffffff"]

    return (
        <div className="notes">
            <div className="notes__header">
                <p className="notes__title">Investigation Board</p>
            </div>

            <div className="notes__body">

                {/* LEFT - canvas */}
                <div className="notes__canvas-side">
                    <div className="notes__toolbar">

                        {/* Color swatches */}
                        <div className="notes__colors">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => { setColor(c); setTool("pen") }}
                                    className={`color-swatch ${color === c && tool === "pen" ? "color-swatch--active" : ""}`}
                                    style={{ background: c, border: c === "#ffffff" ? "1px solid #eddfc8" : "none" }}
                                />
                            ))}
                        </div>

                        {/* Brush size */}
                        <input
                            type="range" min="1" max="20"
                            value={brushSize}
                            onChange={e => setBrushSize(Number(e.target.value))}
                            className="notes__slider"
                        />

                        {/* Eraser */}
                        <button
                            onClick={() => setTool(tool === "eraser" ? "pen" : "eraser")}
                            className={`tool-btn ${tool === "eraser" ? "tool-btn--active" : ""}`}
                        >
                            🧹
                        </button>

                        {/* Zoom controls */}
                        <div className="notes__zoom">
                            <button
                                className="tool-btn"
                                onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                            >
                                −
                            </button>
                            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                            <button
                                className="tool-btn"
                                onClick={() => setZoom(z => Math.min(z + 0.25, maxZoomRef.current))}
                            >
                                +
                            </button>
                        </div>

                        {/* Clear */}
                        <button onClick={clearCanvas} className="tool-btn tool-btn--clear">
                            🗑️
                        </button>

                    </div>

                    {/* Scrollable canvas container */}
                    <div className="canvas-container" onWheel={handleWheel}>
                        <canvas
                            ref={canvasRef}
                            className="notes__canvas"
                            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                    </div>
                </div>

                {/* RIGHT - text notes */}
                <div className="notes__text-side">
                    <p className="notes__text-label">Written Notes</p>
                    <textarea
                        className="notes__textarea"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Write your findings here..."
                    />
                    <p className="notes__count">{notes.length} characters</p>
                </div>

            </div>
        </div>
    )
}
