import { useState, useEffect, use } from "react"

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
    if (field.answer) {
      result[field.name] = field.answer
    }
  })
  return result
}

export default function App() {
  const [allSubmissions, setAllSubmissions] = useState([])

  useEffect(() => {
    const fetches = FORMS.map(form =>
      fetch(`https://api.jotform.com/form/${form.id}/submissions?apiKey=${form.key}&limit=100`)
        .then(res => res.json())
        .then(data => {
          return data.content.map(submission => ({
            ...submission,
            formLabel: form.label,
            parsed: parseAnswers(submission.answers)
          }))
        })
    )

    Promise.all(fetches)
      .then(results => {
        // Combine all results into a single array
        const combined = results.flat()
        setAllSubmissions(combined)
      })
      .catch(err => {
        console.error("Error fetching submissions:", err)
      })
  }, [])

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
      <h1>Find Podo</h1>
      <p style={{ color: "#666" }}>Total records: {allSubmissions.length}</p>

      {allSubmissions.map(item => (
        <div key={item.id} style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "8px",
        }}>
          <p style={{ fontWeight: "bold", margin: "0 0 4px" }}>
            {item.parsed.fullname || item.parsed.name || "Unknown"}
          </p>
          <p style={{ color: "#666", fontSize: "13px", margin: "0 0 2px" }}>
            {item.parsed.location || "No location"}
          </p>
          <p style={{ color: "#999", fontSize: "12px", margin: 0 }}>
            {item.formLabel} · {item.parsed.timestamp || item.created_at}
          </p>
        </div>
      ))}
    </div>
  )
}