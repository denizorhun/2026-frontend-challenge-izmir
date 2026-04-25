import { useState, useEffect } from "react"
import SubmissionCard from "./components/SubmissionCard"
import DetailPanel from "./components/DetailPanel"
import NotesPanel from "./components/NotesPanel"
import "./App.css"

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
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const fetches = FORMS.map(form =>
      fetch(`https://api.jotform.com/form/${form.id}/submissions?apiKey=${form.key}&limit=100`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch")
          return res.json()
        })
        .then(data => data.content.map(s => ({
          ...s,
          formLabel: form.label,
          parsed: parseAnswers(s.answers)
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
    <div className="layout">

      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar__header">
          <h1 className="sidebar__title">Find Podo</h1>
          <p className="sidebar__subtitle">Search across all reports</p>
        </div>

        <div className="sidebar__search">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, location, note..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="sidebar__tabs">
          {["all", ...FORMS.map(f => f.label)].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveForm(tab)}
              className={`tab ${activeForm === tab ? "tab--active" : ""}`}
            >
              {tab === "all" ? "All" : tab}
            </button>
          ))}
        </div>

        <p className="sidebar__count">{filtered.length} results</p>

        <div className="sidebar__list">
          {isLoading && <p className="state-text">Loading all reports...</p>}
          {error && <p className="state-text state-text--error">{error}</p>}
          {!isLoading && !error && filtered.length === 0 && (
            <p className="state-text">No results found.</p>
          )}
          {!isLoading && !error && filtered.map(item => (
            <SubmissionCard
              key={item.id}
              item={item}
              isSelected={selectedItem?.id === item.id}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>
      </aside>

      {/* RIGHT CONTENT */}
      <main className="content">
        <DetailPanel item={selectedItem} />
        <NotesPanel notes={notes} onChange={setNotes} />
      </main>

    </div>
  )
}