import "./SubmissionCard.css"

export default function SubmissionCard({ item, isSelected, onClick }) {
    return (
        <div
            className={`card ${isSelected ? "card--selected" : ""}`}
            onClick={onClick}
        >
            <p className="card__name">
                {item.parsed.fullname || item.parsed.name || "Unknown"}
            </p>
            <p className="card__location">
                {item.parsed.location || "No location"}
            </p>
            <p className="card__meta">
                {item.formLabel} · {item.parsed.timestamp || item.created_at}
            </p>
        </div>
    )
}