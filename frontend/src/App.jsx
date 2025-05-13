import './App.css'
import Chatbot from './components/Chatbot'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Real Estate Chatbot</h1>
        <p>Your 24/7 property assistant</p>
      </header>
      <main>
        <Chatbot />
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Real Estate Assistant. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
