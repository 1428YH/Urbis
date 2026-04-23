import { startTransition, useEffect, useRef, useState } from 'react'
import CreateIncidentButton from './CreateIncidentButton'
import IncidentFormModal from './IncidentFormModal'
import MapContainer from './MapContainer'
import Sidebar from './Sidebar'
import { createIncident, fetchIncidents, reverseGeocode } from './lib/api'
import './App.css'

const DEFAULT_CENTER = [30.31413, 59.93863]
const POLLING_INTERVAL_MS = 20000

const SEVERITY_TO_LEVEL = {
  critical: 3,
  high: 2,
  low: 1,
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sidebarMode, setSidebarMode] = useState('partial')
  const [incidents, setIncidents] = useState([])
  const [incidentsLoading, setIncidentsLoading] = useState(true)
  const [incidentsRefreshing, setIncidentsRefreshing] = useState(false)
  const [incidentsError, setIncidentsError] = useState('')
  const [creatingIncident, setCreatingIncident] = useState(false)
  const [selectedIncidentId, setSelectedIncidentId] = useState(null)
  const [activeCoordinates, setActiveCoordinates] = useState(DEFAULT_CENTER)
  const [activeAddress, setActiveAddress] = useState('')
  const [addressLoading, setAddressLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const pollingRef = useRef(null)

  useEffect(() => {
    loadIncidents({ showInitialLoader: true, showToastOnError: true })
  }, [])

  useEffect(() => {
    function runPolling() {
      if (document.visibilityState !== 'visible') {
        return
      }

      loadIncidents({ silent: true })
    }

    pollingRef.current = window.setInterval(runPolling, POLLING_INTERVAL_MS)
    document.addEventListener('visibilitychange', runPolling)

    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current)
      }
      document.removeEventListener('visibilitychange', runPolling)
    }
  }, [])

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null)
    }, 4200)

    return () => window.clearTimeout(timeoutId)
  }, [toast])

  useEffect(() => {
    let ignore = false

    async function loadAddress() {
      try {
        setAddressLoading(true)
        const nextAddress = await reverseGeocode(activeCoordinates)

        if (!ignore) {
          setActiveAddress(nextAddress)
        }
      } catch {
        if (!ignore) {
          setActiveAddress('')
        }
      } finally {
        if (!ignore) {
          setAddressLoading(false)
        }
      }
    }

    loadAddress()

    return () => {
      ignore = true
    }
  }, [activeCoordinates])

  function showToast(type, message) {
    setToast({ type, message })
  }

  async function loadIncidents(options = {}) {
    const {
      silent = false,
      showInitialLoader = false,
      showToastOnError = false,
    } = options

    try {
      if (showInitialLoader) {
        setIncidentsLoading(true)
      } else if (silent) {
        setIncidentsRefreshing(true)
      } else {
        setIncidentsLoading(true)
      }

      setIncidentsError('')

      const nextIncidents = await fetchIncidents()

      startTransition(() => {
        setIncidents(nextIncidents)
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить события.'
      setIncidentsError(message)

      if (showToastOnError || !silent) {
        showToast('error', message)
      }
    } finally {
      setIncidentsLoading(false)
      setIncidentsRefreshing(false)
    }
  }

  async function handleCreateIncident(formValues) {
    const payload = {
      title: formValues.title,
      description: formValues.description,
      lvl: SEVERITY_TO_LEVEL[formValues.severity],
      lat: activeCoordinates[1],
      lng: activeCoordinates[0],
    }

    setCreatingIncident(true)

    try {
      await createIncident(payload)
      await loadIncidents({ silent: true, showToastOnError: true })
      setSelectedIncidentId(null)
      setIsModalOpen(false)
      showToast('success', 'Событие отправлено и обработано backend.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось создать событие.'
      showToast('error', message)
      throw error
    } finally {
      setCreatingIncident(false)
    }
  }

  function handleSelectIncident(incident) {
    setSelectedIncidentId(incident.id)
    setActiveCoordinates([incident.lng, incident.lat])
  }

  return (
    <div className="app">
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          <p className="toast__text">{toast.message}</p>
          <button type="button" className="toast__close" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}

      <div className={`layout ${sidebarMode === 'full' ? 'layout--sheet-open' : ''}`}>
        <MapContainer
          incidents={incidents}
          incidentsRefreshing={incidentsRefreshing}
          selectedIncidentId={selectedIncidentId}
          isGeoHidden={sidebarMode === 'full'}
          onIncidentSelect={handleSelectIncident}
          onLocationChange={setActiveCoordinates}
        />
        <Sidebar
          incidents={incidents}
          loading={incidentsLoading}
          refreshing={incidentsRefreshing}
          error={incidentsError}
          selectedIncidentId={selectedIncidentId}
          onIncidentSelect={handleSelectIncident}
          onModeChange={setSidebarMode}
        />
        <div className={`layout__scrim ${sidebarMode === 'full' ? 'layout__scrim--visible' : ''}`} />
      </div>

      <CreateIncidentButton onClick={() => setIsModalOpen(true)} />

      {isModalOpen && (
        <IncidentFormModal
          address={activeAddress}
          addressLoading={addressLoading}
          isSubmitting={creatingIncident}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateIncident}
        />
      )}
    </div>
  )
}

export default App
