import { useEffect, useRef, useState } from 'react'
import { loadYandexMapsApi } from './lib/yandexMaps'

const DEFAULT_LOCATION = {
  center: [37.617644, 55.755819],
  zoom: 11,
}

function MapContainer() {
  const hostRef = useRef(null)
  const mapRef = useRef(null)
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function initMap() {
      try {
        const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY
        const ymaps3 = await loadYandexMapsApi(apiKey)

        if (ignore || !hostRef.current) {
          return
        }

        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } = ymaps3

        mapRef.current?.destroy()

        const map = new YMap(hostRef.current, {
          location: DEFAULT_LOCATION,
          behaviors: ['drag', 'scrollZoom', 'dblClick', 'pinchZoom'],
        })

        map.addChild(new YMapDefaultSchemeLayer())
        map.addChild(new YMapDefaultFeaturesLayer())

        mapRef.current = map
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
      mapRef.current?.destroy()
      mapRef.current = null
    }
  }, [])

  return (
    <div className="map-container">
      <div ref={hostRef} className="map-container__canvas" />

      {status !== 'ready' && (
        <div className="map-container__overlay">
          <p className="map-container__title">
            {status === 'loading' ? 'Загрузка карты...' : 'Карта недоступна'}
          </p>
          <p className="map-container__text">
            {status === 'loading'
              ? 'Подключаем Yandex Maps API.'
              : errorMessage}
          </p>
        </div>
      )}
    </div>
  )
}

export default MapContainer
