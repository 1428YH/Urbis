import { useEffect, useRef, useState } from 'react'
import geoIcon from './assets/icons/Geo.png'
import markerLowIcon from './assets/icons/1.png'
import markerHighIcon from './assets/icons/2.png'
import markerCriticalIcon from './assets/icons/3.png'
import { loadYandexMapsApi } from './lib/yandexMaps'

const DEFAULT_LOCATION = {
  center: [30.31413, 59.93863],
  zoom: 12,
}

const MAP_CUSTOMIZATION = []

function getMarkerMeta(incident) {
  const color = incident.color === 'yellow' ? 'orange' : incident.color || 'green'

  if (color === 'red') {
    return { color: 'red', level: 3, icon: markerCriticalIcon }
  }

  if (color === 'orange') {
    return { color: 'orange', level: 2, icon: markerHighIcon }
  }

  return { color: 'green', level: 1, icon: markerLowIcon }
}

function getMarkerClassName(incident, isSelected, isZooming) {
  const { color } = getMarkerMeta(incident)
  return [
    'map-container__incident-marker',
    `map-container__incident-marker--${color}`,
    isSelected ? 'map-container__incident-marker--selected' : '',
    isZooming ? 'map-container__incident-marker--zooming' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function setIncidentMarkerZoomState(isZooming, markerEntries) {
  markerEntries.forEach(({ element }) => {
    element.classList.toggle('map-container__incident-marker--zooming', isZooming)
  })
}

function createIncidentMarkerElement(incident, isSelected, isZooming, onIncidentSelect) {
  const { level, icon } = getMarkerMeta(incident)
  const markerElement = document.createElement('button')
  markerElement.type = 'button'
  markerElement.className = getMarkerClassName(incident, isSelected, isZooming)
  markerElement.title = incident.title || 'Событие'
  markerElement.setAttribute('aria-label', `${incident.title || 'Событие'}, уровень ${level}`)

  const shadowElement = document.createElement('span')
  shadowElement.className = 'map-container__incident-shadow'

  const iconElement = document.createElement('img')
  iconElement.className = 'map-container__incident-icon'
  iconElement.src = icon
  iconElement.alt = ''
  iconElement.decoding = 'async'

  markerElement.append(shadowElement, iconElement)
  markerElement.addEventListener('click', () => onIncidentSelect?.(incident))

  return markerElement
}

function createIncidentPopupElement(selectedIncident, selectedIncidentSeverity, formatIncidentDate, onIncidentClose) {
  const popupElement = document.createElement('section')
  popupElement.className = 'map-container__incident-popup'

  const closeButton = document.createElement('button')
  closeButton.type = 'button'
  closeButton.className = 'map-container__incident-popup-close'
  closeButton.setAttribute('aria-label', 'Закрыть карточку события')
  closeButton.textContent = '×'
  closeButton.addEventListener('click', (event) => {
    event.stopPropagation()
    onIncidentClose?.()
  })

  const eyebrow = document.createElement('p')
  eyebrow.className = 'map-container__incident-popup-eyebrow'
  eyebrow.textContent = 'Событие'

  const title = document.createElement('h3')
  title.className = 'map-container__incident-popup-title'
  title.textContent = selectedIncident.title || 'Без названия'

  const meta = document.createElement('div')
  meta.className = 'map-container__incident-popup-meta'

  const metaLabel = document.createElement('span')
  metaLabel.className = 'map-container__incident-popup-meta-label'
  metaLabel.textContent = 'Уровень'

  const badge = document.createElement('span')
  badge.className = `severity-pill severity-pill--${selectedIncidentSeverity?.tone || 'low'}`
  badge.textContent = selectedIncidentSeverity?.label || 'Низкий'

  meta.append(metaLabel, badge)

  if (selectedIncident.created_at) {
    const time = document.createElement('span')
    time.className = 'map-container__incident-popup-time'
    time.textContent = formatIncidentDate?.(selectedIncident.created_at) || ''
    meta.append(time)
  }

  const description = document.createElement('p')
  description.className = 'map-container__incident-popup-description'
  description.textContent =
    selectedIncident.description || 'Описание для этого события пока не добавлено.'

  popupElement.append(closeButton, eyebrow, title, meta, description)
  return popupElement
}

function MapContainer({
  incidents = [],
  incidentsRefreshing = false,
  selectedIncident = null,
  selectedIncidentId = null,
  selectedIncidentSeverity = null,
  isGeoHidden = false,
  onIncidentClose,
  onIncidentSelect,
  onLocationChange,
  formatIncidentDate,
}) {
  const hostRef = useRef(null)
  const mapRef = useRef(null)
  const ymaps3Ref = useRef(null)
  const userMarkerRef = useRef(null)
  const popupMarkerRef = useRef(null)
  const incidentMarkersRef = useRef([])
  const zoomRef = useRef(DEFAULT_LOCATION.zoom)
  const zoomTimerRef = useRef(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [geoStatus, setGeoStatus] = useState('idle')
  const [geoError, setGeoError] = useState('')

  useEffect(() => {
    let ignore = false

    async function initMap() {
      try {
        const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY
        const ymaps3 = await loadYandexMapsApi(apiKey)

        if (ignore || !hostRef.current) {
          return
        }

        ymaps3Ref.current = ymaps3

        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapListener } = ymaps3

        mapRef.current?.destroy()

        const map = new YMap(hostRef.current, {
          location: DEFAULT_LOCATION,
          behaviors: ['drag', 'scrollZoom', 'dblClick', 'pinchZoom'],
        })

        map.addChild(
          new YMapDefaultSchemeLayer({
            theme: 'dark',
            customization: MAP_CUSTOMIZATION,
          }),
        )
        map.addChild(new YMapDefaultFeaturesLayer())

        const mapListener = new YMapListener({
          onUpdate: ({ location }) => {
            const nextZoom = location?.zoom

            if (!Number.isFinite(nextZoom)) {
              return
            }

            if (Math.abs(nextZoom - zoomRef.current) > 0.001) {
              zoomRef.current = nextZoom
              setIncidentMarkerZoomState(true, incidentMarkersRef.current)

              if (popupMarkerRef.current?.element) {
                popupMarkerRef.current.element.classList.add('map-container__incident-popup--zooming')
              }

              if (zoomTimerRef.current) {
                window.clearTimeout(zoomTimerRef.current)
              }

              zoomTimerRef.current = window.setTimeout(() => {
                setIncidentMarkerZoomState(false, incidentMarkersRef.current)
                if (popupMarkerRef.current?.element) {
                  popupMarkerRef.current.element.classList.remove('map-container__incident-popup--zooming')
                }
              }, 120)
            }
          },
        })

        map.addChild(mapListener)
        mapRef.current = map
        onLocationChange?.(DEFAULT_LOCATION.center)
        setStatus('ready')
      } catch (error) {
        if (ignore) {
          return
        }

        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Не удалось инициализировать карту.')
      }
    }

    initMap()

    return () => {
      ignore = true

      if (zoomTimerRef.current) {
        window.clearTimeout(zoomTimerRef.current)
      }

      userMarkerRef.current = null
      popupMarkerRef.current = null
      incidentMarkersRef.current = []
      mapRef.current?.destroy()
      mapRef.current = null
    }
  }, [onLocationChange])

  useEffect(() => {
    const ymaps3 = ymaps3Ref.current
    const map = mapRef.current

    if (!ymaps3 || !map || status !== 'ready') {
      return
    }

    const { YMapMarker } = ymaps3

    incidentMarkersRef.current.forEach(({ marker }) => map.removeChild(marker))
    incidentMarkersRef.current = incidents
      .filter((incident) => Number.isFinite(incident?.lng) && Number.isFinite(incident?.lat))
      .map((incident) => {
        const markerElement = createIncidentMarkerElement(
          incident,
          incident.id === selectedIncidentId,
          false,
          onIncidentSelect,
        )

        const marker = new YMapMarker(
          { coordinates: [incident.lng, incident.lat] },
          markerElement,
        )

        map.addChild(marker)
        return { marker, element: markerElement }
      })
  }, [incidents, onIncidentSelect, selectedIncidentId, status])

  useEffect(() => {
    const ymaps3 = ymaps3Ref.current
    const map = mapRef.current

    if (!ymaps3 || !map || status !== 'ready') {
      return
    }

    const { YMapMarker } = ymaps3

    if (popupMarkerRef.current) {
      map.removeChild(popupMarkerRef.current.marker)
      popupMarkerRef.current = null
    }

    if (!selectedIncident || !Number.isFinite(selectedIncident.lng) || !Number.isFinite(selectedIncident.lat)) {
      return
    }

    const popupElement = createIncidentPopupElement(
      selectedIncident,
      selectedIncidentSeverity,
      formatIncidentDate,
      onIncidentClose,
    )

    const popupMarker = new YMapMarker(
      { coordinates: [selectedIncident.lng, selectedIncident.lat] },
      popupElement,
    )

    map.addChild(popupMarker)
    popupMarkerRef.current = { marker: popupMarker, element: popupElement }
  }, [formatIncidentDate, onIncidentClose, selectedIncident, selectedIncidentSeverity, status])

  useEffect(() => {
    if (!selectedIncident || !mapRef.current) {
      return
    }

    mapRef.current.setLocation({
      center: [selectedIncident.lng, selectedIncident.lat],
      zoom: 14,
      duration: 400,
    })
    onLocationChange?.([selectedIncident.lng, selectedIncident.lat])
  }, [onLocationChange, selectedIncident])

  function updateUserMarker(coordinates) {
    const ymaps3 = ymaps3Ref.current
    const map = mapRef.current

    if (!ymaps3 || !map) {
      return
    }

    const { YMapMarker } = ymaps3

    if (userMarkerRef.current) {
      map.removeChild(userMarkerRef.current)
      userMarkerRef.current = null
    }

    const markerElement = document.createElement('div')
    markerElement.className = 'map-container__user-marker'

    const marker = new YMapMarker({ coordinates }, markerElement)
    map.addChild(marker)
    userMarkerRef.current = marker
  }

  function handleLocateUser() {
    if (!navigator.geolocation) {
      setGeoStatus('error')
      setGeoError('Геолокация не поддерживается в этом браузере.')
      return
    }

    if (!mapRef.current) {
      setGeoStatus('error')
      setGeoError('Карта ещё не готова.')
      return
    }

    setGeoStatus('loading')
    setGeoError('')

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordinates = [coords.longitude, coords.latitude]

        mapRef.current?.setLocation({
          center: coordinates,
          zoom: 15,
          duration: 400,
        })

        updateUserMarker(coordinates)
        onLocationChange?.(coordinates)
        setGeoStatus('success')
      },
      (error) => {
        setGeoStatus('error')

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Доступ к геолокации запрещён.')
            break
          case error.POSITION_UNAVAILABLE:
            setGeoError('Не удалось определить местоположение.')
            break
          case error.TIMEOUT:
            setGeoError('Геолокация отвечает слишком долго.')
            break
          default:
            setGeoError('Не удалось получить геолокацию.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  return (
    <div className="map-container">
      <div ref={hostRef} className="map-container__canvas" />

      {status === 'ready' && (
        <div className={`map-container__controls ${isGeoHidden ? 'map-container__controls--hidden' : ''}`}>
          {incidentsRefreshing && <div className="map-container__sync-dot" aria-hidden="true" />}
          <button
            type="button"
            className="map-container__geo-button"
            onClick={handleLocateUser}
            aria-label="Определить моё местоположение"
          >
            <img src={geoIcon} alt="" className="map-container__geo-icon" />
          </button>

          {geoStatus === 'error' && <p className="map-container__geo-error">{geoError}</p>}
        </div>
      )}

      {status !== 'ready' && (
        <div className="map-container__overlay">
          <p className="map-container__title">
            {status === 'loading' ? 'Загрузка карты...' : 'Карта недоступна'}
          </p>
          <p className="map-container__text">
            {status === 'loading' ? 'Подключаем Yandex Maps API.' : errorMessage}
          </p>
        </div>
      )}
    </div>
  )
}

export default MapContainer
