import { useState, useEffect } from "react"

const FORMS = [
  { id: "261134527667966", key: "b119f8e8fd7fe6fbdb3aa032cef23299", label: "Checkins" },
  { id: "261133651963962", key: "d129baeb6efa832415911485ef5d6dc1", label: "Messages" },
  { id: "261133720555956", key: "5bea83dbf561ba3190f27373831ac2a7", label: "Sightings" },
  { id: "261134449238963", key: "c3beedaed8344260d609b35b6437c604", label: "Personal Notes" },
  { id: "261134430330946", key: "6de24ff899b00a30e23431f89aee9e9d", label: "Anonymous Tips" },
]

export default function App() {

  const [allSubmissions, setAllSubmissions] = useState([])
  const [search, setSearch] = useState("")
  const [activeForm, setActiveForm] = useState("all")
  const [selectedItem, setSelectedItem] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  //fetch all 5 forms at once on component mount
  useEffect(() => {
    const fetches = FORMS.map(form =>
      fetch(`https://api.jotform.com/form/${form.id}/submissions?apiKey=${form.key}&limit=100`)
        .then(res => res.json())
        .then(data => data.content.map(submissions => ({ ...submissions, formLabel: form.label })))
    )

    Promise.all(fetches)
      .then(results => {
        const merged = results.flat()
        setAllSubmissions(merged)
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Error fetching data:", err)
        setError("Failed to load submissions. Please try again later.")
        setIsLoading(false)
      })
  }, [])

  return (
    <div>
      <h1>Find Podo</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {isLoading ? (
        <p>Loading submissions...</p>
      ) : (
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <h2>Submissions</h2>
            <p>Total: {allSubmissions.length}</p>
          </div>
        </div>
      )}

    </div>
  )
}