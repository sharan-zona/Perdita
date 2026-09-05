// This is a deliberately minimal placeholder for Phase 1.
// Real routing (React Router routes for /, /login, /items, etc.)
// gets built in Phase 10 onward, once auth and the item APIs exist.
// We keep it this simple now just to confirm the toolchain works end to end.

function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Perdita</h1>
      <p>Find what was lost. Return what was found.</p>
      <p style={{ color: '#666' }}>
        Project scaffold is running. Full UI arrives in later build phases.
      </p>
    </div>
  )
}

export default App