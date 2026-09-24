import { BrowserRouter } from 'react-router-dom'
import { SiteShell } from './components/SiteShell'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <SiteShell />
    </BrowserRouter>
  )
}

export default App
