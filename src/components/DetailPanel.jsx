import "./DetailPanel.css"

export default function DetailPanel({ item }) {

    if (!item) {
        return (
            <div className="detail-empty">
                <p className="detail-empty__icon"></p>
                <p className="detail-empty__text">Select a record to investigate</p>
            </div>
        )
    }

    return (
        <div className="detail">

            {/* Header */}
            <div className="detail__header">
                <p className="detail__label">{item.formLabel}</p>
                <h2 className="detail__name">
                    {item.parsed.fullname || item.parsed.name || "Unknown"}
                </h2>
            </div>

            {/* Fields */}
            <div className="detail__body">
                {Object.entries(item.parsed).map(([key, value]) => (
                    <div key={key} className="detail__field">
                        <span className="detail__key">{key}</span>
                        <span className="detail__value">{value}</span>
                    </div>
                ))}
            </div>

        </div>
    )
}