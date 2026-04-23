let ymaps3Promise = null

export function loadYandexMapsApi(apiKey, lang = 'ru_RU') {
  if (!apiKey) {
    return Promise.reject(
      new Error('Не найден VITE_YANDEX_MAPS_API_KEY для подключения Yandex Maps API.'),
    )
  }

  if (window.ymaps3) {
    return Promise.resolve(window.ymaps3)
  }

  if (ymaps3Promise) {
    return ymaps3Promise
  }

  ymaps3Promise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-yandex-maps="true"]')

    const handleLoad = async () => {
      try {
        await window.ymaps3.ready
        resolve(window.ymaps3)
      } catch (error) {
        reject(error)
      }
    }

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad, { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Не удалось загрузить скрипт Yandex Maps API.')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=${lang}`
    script.async = true
    script.dataset.yandexMaps = 'true'
    script.onload = handleLoad
    script.onerror = () => reject(new Error('Не удалось загрузить скрипт Yandex Maps API.'))

    document.head.append(script)
  })

  return ymaps3Promise
}
