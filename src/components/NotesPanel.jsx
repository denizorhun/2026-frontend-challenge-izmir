import "./NotesPanel.css"

export default function NotesPanel({ notes, onChange }) {
    return (
        <div className="notes">
            <div className="notes__header">
                <p className="notes__title">Investigation Notes</p>
                <p className="notes__subtitle">Write down your findings about Podo</p>
            </div>
            <textarea
                className="notes__textarea"
                value={notes}
                onChange={e => onChange(e.target.value)}
                placeholder="e.g. Podo was last seen at Alsancak Kordon at 18:05..."
            />
            <div className="notes__footer">
                <p className="notes__count">{notes.length} characters</p>
            </div>
        </div>
    )
}