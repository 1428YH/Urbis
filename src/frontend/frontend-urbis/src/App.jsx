import { startTransition, useEffect, useRef, useState } from 'react'
import CreateIncidentButton from './CreateIncidentButton'
import IncidentFormModal from './IncidentFormModal'
import MapContainer from './MapContainer'
import Sidebar from './Sidebar'
import { createIncident, fetchIncidents, reverseGeocode, uploadIncidentImage } from './lib/api'
import './App.css'

const DEFAULT_CENTER = [30.31413, 59.93863]
const POLLING_INTERVAL_MS = 20000
const EMERGENCY_PHONE = '112'

const SEVERITY_TO_LEVEL = {
  critical: 3,
  high: 2,
  low: 1,
}

function getIncidentSeverityMeta(incident) {
  if (incident?.color === 'red' || incident?.lvl === 3) {
    return { label: 'Критический', tone: 'critical' }
  }

  if (incident?.color === 'yellow' || incident?.color === 'orange' || incident?.lvl === 2) {
    return { label: 'Высокий', tone: 'high' }
  }

  return { label: 'Низкий', tone: 'low' }
}

function formatIncidentDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
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

  const selectedIncident = incidents.find((incident) => incident.id === selectedIncidentId) || null
  const selectedIncidentSeverity = selectedIncident ? getIncidentSeverityMeta(selectedIncident) : null

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
    }, 5200)

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

  function showToast(type, message, options = {}) {
    setToast({ type, message, ...options })
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
    setCreatingIncident(true)

    try {
      let imageUrl = ''

      if (formValues.imageFile) {
        imageUrl = await uploadIncidentImage(formValues.imageFile)
      }

      const payload = {
        title: formValues.title,
        description: formValues.description,
        lvl: SEVERITY_TO_LEVEL[formValues.severity],
        lat: activeCoordinates[1],
        lng: activeCoordinates[0],
        image_url: imageUrl,
      }

      await createIncident(payload)
      await loadIncidents({ silent: true, showToastOnError: true })
      setSelectedIncidentId(null)
      setIsModalOpen(false)
      showToast(
        'success',
        'Событие отправлено. При угрозе жизни рекомендуется вызвать службу спасения.',
        {
          actionLabel: 'Позвонить 112',
          actionHref: `tel:${EMERGENCY_PHONE}`,
        },
      )
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
          <div className="toast__content">
            <p className="toast__text">{toast.message}</p>
            {toast.actionHref && toast.actionLabel && (
              <a href={toast.actionHref} className="toast__action">
                {toast.actionLabel}
              </a>
            )}
          </div>
          <button type="button" className="toast__close" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}

      <div className={`layout ${sidebarMode === 'full' ? 'layout--sheet-open' : ''}`}>
        <MapContainer
          incidents={incidents}
          incidentsRefreshing={incidentsRefreshing}
          selectedIncident={selectedIncident}
          selectedIncidentId={selectedIncidentId}
          selectedIncidentSeverity={selectedIncidentSeverity}
          isGeoHidden={sidebarMode === 'full'}
          onIncidentClose={() => setSelectedIncidentId(null)}
          onIncidentSelect={handleSelectIncident}
          onLocationChange={setActiveCoordinates}
          formatIncidentDate={formatIncidentDate}
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
