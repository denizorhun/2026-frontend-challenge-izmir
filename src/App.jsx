import { useState, useEffect } from "react"

const FORMS = [
  { id: "261134527667966", key: "b119f8e8fd7fe6fbdb3aa032cef23299", label: "Checkins" },
  { id: "261133651963962", key: "d129baeb6efa832415911485ef5d6dc1", label: "Messages" },
  { id: "261133720555956", key: "5bea83dbf561ba3190f27373831ac2a7", label: "Sightings" },
  { id: "261134449238963", key: "c3beedaed8344260d609b35b6437c604", label: "Personal Notes" },
  { id: "261134430330946", key: "6de24ff899b00a30e23431f89aee9e9d", label: "Anonymous Tips" },
]

function parseAnswers(answers) {
  const result = {}
  Object.values(answers).forEach(field => {
    if (field.type === "control_head" || field.type === "control_button") return
    if (field.answer) result[field.name] = field.answer
  })
  return result
}

export default function App() {

  const [allSubmissions, setAllSubmissions] = useState([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [activeForm, setActiveForm] = useState("all")
  const [notes, setNotes] = useState({})

  useEffect(() => {
    const fetches = FORMS.map(form =>
      fetch(`https://api.jotform.com/form/${form.id}/submissions?apiKey=${form.key}&limit=100`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch")
          return res.json()
        })
        .then(data => data.content.map(submission => ({
          ...submission,
          formLabel: form.label,
          parsed: parseAnswers(submission.answers)
        })))
    )

    Promise.all(fetches)
      .then(results => {
        setAllSubmissions(results.flat())
        setIsLoading(false)
      })
      .catch(() => {
        setError("Failed to load data. Please try again.")
        setIsLoading(false)
      })
  }, [])

  const filtered = allSubmissions.filter(item => {
    const allText = Object.values(item.parsed).join(" ").toLowerCase()
    const matchesSearch = allText.includes(search.toLowerCase())
    const matchesForm = activeForm === "all" || item.formLabel === activeForm
    return matchesSearch && matchesForm
  })

  return (
    // full screen height, no page scroll
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      height: "100vh",
      fontFamily: "sans-serif",
      overflow: "hidden"  // stops the whole page from scrolling
    }}>

      {/* LEFT - fixed, only the list scrolls */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        borderRight: "1px solid #ddd"
      }}>

        {/* This part stays fixed at top */}
        <div style={{ padding: "24px 24px 12px", flexShrink: 0 }}>
          <h1 style={{ margin: "0 0 16px" }}>Find Podo</h1>

          <input
            type="text"
            placeholder="Search by name, location, note..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: "8px",
              border: "1px solid #ddd", fontSize: "14px",
              marginBottom: "12px", boxSizing: "border-box"
            }}
          />

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
            {["all", ...FORMS.map(f => f.label)].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveForm(tab)}
                style={{
                  padding: "5px 12px", borderRadius: "99px", fontSize: "12px",
                  border: "1px solid #ddd", cursor: "pointer",
                  background: activeForm === tab ? "#4f6ef7" : "white",
                  color: activeForm === tab ? "white" : "#666",
                  fontWeight: activeForm === tab ? 600 : 400,
                }}
              >
                {tab === "all" ? "All" : tab}
              </button>
            ))}
          </div>

          <p style={{ color: "#999", fontSize: "13px" }}>
            {filtered.length} results
          </p>
        </div>

        {/* This part scrolls */}
        <div style={{
          flex: 1,           // takes up remaining height
          overflowY: "auto", // only this scrolls
          padding: "0 24px 24px"
        }}>
          {isLoading && <p style={{ color: "#aaa" }}>Loading all reports...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!isLoading && !error && filtered.length === 0 && (
            <p style={{ color: "#aaa" }}>No results found.</p>
          )}
          {!isLoading && !error && filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              style={{
                border: selectedItem?.id === item.id ? "2px solid #4f6ef7" : "1px solid #ddd",
                background: selectedItem?.id === item.id ? "#eef4ff" : "white",
                borderRadius: "8px", padding: "12px",
                marginBottom: "8px", cursor: "pointer",
              }}
            >
              <p style={{ fontWeight: "bold", margin: "0 0 4px" }}>
                {item.parsed.fullname || item.parsed.name || "Unknown"}
              </p>
              <p style={{ color: "#666", fontSize: "13px", margin: "0 0 2px" }}>
                📍 {item.parsed.location || "No location"}
              </p>
              <p style={{ color: "#999", fontSize: "12px", margin: 0 }}>
                {item.formLabel} · {item.parsed.timestamp || item.created_at}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT - also independently scrollable */}
      <div style={{
        overflowY: "auto",
        height: "100vh",
        padding: "24px",
        background: "#f4f3f0"
      }}>

        {/* Detail panel */}
        {!selectedItem && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
            <p style={{ fontSize: "32px" }}>🔍</p>
            <p>Select a record to investigate</p>
          </div>
        )}
        {selectedItem && (
          <div style={{ background: "white", border: "1px solid #ddd", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ background: "#1a1a2e", padding: "20px", color: "white" }}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 8px" }}>
                {selectedItem.formLabel}
              </p>
              <h2 style={{ margin: 0, fontSize: "20px" }}>
                {selectedItem.parsed.fullname || selectedItem.parsed.name || "Unknown"}
              </h2>
            </div>
            <div style={{ padding: "20px" }}>
              {Object.entries(selectedItem.parsed).map(([key, value]) => (
                <div key={key} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 0", borderBottom: "1px solid #f3f4f6", fontSize: "14px"
                }}>
                  <span style={{ color: "#6b7280", textTransform: "capitalize" }}>{key}</span>
                  <span style={{ fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes panel */}
        <div style={{
          marginTop: "16px", background: "white",
          border: "1px solid #ddd", borderRadius: "12px", overflow: "hidden"
        }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6" }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "14px" }}>🗒️ Investigation Notes</p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#9ca3af" }}>
              Write down your findings about Podo
            </p>
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Podo was last seen at Alsancak Kordon at 18:05..."
            style={{
              width: "100%", minHeight: "150px", padding: "16px",
              border: "none", outline: "none", fontSize: "13px",
              lineHeight: "1.6", color: "#1a1a2e", resize: "vertical",
              fontFamily: "sans-serif", boxSizing: "border-box",
            }}
          />
          <div style={{ padding: "8px 16px", borderTop: "1px solid #f3f4f6", textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af" }}>{notes.length} characters</p>
          </div>
        </div>

      </div>
    </div>
  )
}