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

      {/* Основной layout: карта + сайдбар */}
      <div className="layout">
        <MapContainer />
        <Sidebar />
      </div>

      {/* Кнопка — фиксированная, поверх всего */}
      <CreateIncidentButton onClick={() => setIsModalOpen(true)} />

      {/* Модалка — рендерится только когда открыта */}
      {isModalOpen && (
        <IncidentFormModal onClose={() => setIsModalOpen(false)} />
      )}

    </div>
  )
}

export default App
