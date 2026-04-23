const API_PREFIX = '/api'

async function parseError(response) {
  const text = await response.text()
  return text || `Request failed with status ${response.status}`
}

export async function fetchIncidents() {
  const response = await fetch(`${API_PREFIX}/incidents`)

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  const data = await response.json()
  return Array.isArray(data) ? data : []
}

export async function createIncident(payload) {
  const response = await fetch(`${API_PREFIX}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }
}

export async function reverseGeocode(coordinates) {
  const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY

  if (!apiKey || !Array.isArray(coordinates) || coordinates.length !== 2) {
    return ''
  }

  const [lng, lat] = coordinates
  const params = new URLSearchParams({
    apikey: apiKey,
    geocode: `${lng},${lat}`,
    lang: 'ru_RU',
    format: 'json',
  })

  const response = await fetch(`https://geocode-maps.yandex.ru/v1/?${params.toString()}`)

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  const data = await response.json()
  const featureMember = data?.response?.GeoObjectCollection?.featureMember

  if (!Array.isArray(featureMember) || featureMember.length === 0) {
    return ''
  }

  return featureMember[0]?.GeoObject?.metaDataProperty?.GeocoderMetaData?.text || ''
}
