import { useState } from 'react'
import MapContainer        from './MapContainer'
import Sidebar             from './Sidebar'
import CreateIncidentButton from './CreateIncidentButton'
import IncidentFormModal   from './IncidentFormModal'
import './App.css'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="app">
      <div className="layout">
        <MapContainer />
        <Sidebar />
      </div>
      <CreateIncidentButton onClick={() => setIsModalOpen(true)} />
      {isModalOpen && (
        <IncidentFormModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}

export default App
