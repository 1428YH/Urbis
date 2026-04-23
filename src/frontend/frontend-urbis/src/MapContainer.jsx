import { useEffect, useRef, useState } from 'react'
import geoIcon from './assets/icons/Geo.png'
import { loadYandexMapsApi } from './lib/yandexMaps'

const DEFAULT_LOCATION = {
  center: [30.31413, 59.93863],
  zoom: 12,
}

const MAP_CUSTOMIZATION = []

function getMarkerClassName(incident, isSelected) {
  const color = incident.color === 'yellow' ? 'orange' : incident.color || 'green'
  return `map-container__incident-marker map-container__incident-marker--${color} ${
    isSelected ? 'map-container__incident-marker--selected' : ''
  }`
}

function MapContainer({
  incidents = [],
  incidentsRefreshing = false,
  selectedIncidentId = null,
  isGeoHidden = false,
  onIncidentSelect,
  onLocationChange,
}) {
  const hostRef = useRef(null)
  const mapRef = useRef(null)
  const ymaps3Ref = useRef(null)
  const userMarkerRef = useRef(null)
  const incidentMarkersRef = useRef([])
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

        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } = ymaps3

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
      userMarkerRef.current = null
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

    incidentMarkersRef.current.forEach((marker) => map.removeChild(marker))
    incidentMarkersRef.current = incidents
      .filter(
        (incident) =>
          Number.isFinite(incident?.lng) &&
          Number.isFinite(incident?.lat),
      )
      .map((incident) => {
      const markerElement = document.createElement('button')
      markerElement.type = 'button'
      markerElement.className = getMarkerClassName(incident, incident.id === selectedIncidentId)
      markerElement.title = incident.title || 'Событие'
      markerElement.addEventListener('click', () => onIncidentSelect?.(incident))

      const marker = new YMapMarker(
        { coordinates: [incident.lng, incident.lat] },
        markerElement,
      )

      map.addChild(marker)
      return marker
      })
  }, [incidents, onIncidentSelect, selectedIncidentId, status])

  useEffect(() => {
    const selectedIncident = incidents.find((incident) => incident.id === selectedIncidentId)

    if (!selectedIncident || !mapRef.current) {
      return
    }

    mapRef.current.setLocation({
      center: [selectedIncident.lng, selectedIncident.lat],
      zoom: 14,
      duration: 400,
    })
    onLocationChange?.([selectedIncident.lng, selectedIncident.lat])
  }, [incidents, onLocationChange, selectedIncidentId])

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
