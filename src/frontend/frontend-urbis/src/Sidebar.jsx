import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import eyeIcon from './assets/icons/Eye.png'
import searchIcon from './assets/icons/Search.png'

const MOBILE_BREAKPOINT = 768

function formatTimeLabel(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function Sidebar({
  incidents,
  loading,
  refreshing = false,
  error,
  selectedIncidentId,
  onIncidentSelect,
  onModeChange,
}) {
  const [search, setSearch] = useState('')
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT,
  )
  const [sheetMode, setSheetMode] = useState('partial')
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isHandlePressed, setIsHandlePressed] = useState(false)
  const dragStartYRef = useRef(0)
  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT
      setIsMobile(mobile)

      if (!mobile) {
        setSheetMode('partial')
        setDragOffset(0)
        setIsDragging(false)
        onModeChange?.('partial')
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [onModeChange])

  useEffect(() => {
    onModeChange?.(isMobile ? sheetMode : 'partial')
  }, [isMobile, onModeChange, sheetMode])

  const filtered = useMemo(
    () =>
      incidents.filter((incident) =>
        String(incident.title ?? '').toLowerCase().includes(deferredSearch.toLowerCase()) ||
        String(incident.description ?? '').toLowerCase().includes(deferredSearch.toLowerCase()),
      ),
    [deferredSearch, incidents],
  )

  const mobileTranslateY = useMemo(() => {
    if (!isMobile) {
      return 0
    }

    const partialOffset = 42
    const fullOffset = 0
    const baseOffset = sheetMode === 'full' ? fullOffset : partialOffset
    return Math.min(Math.max(baseOffset + dragOffset, 0), partialOffset)
  }, [dragOffset, isMobile, sheetMode])

  function toggleSheetMode() {
    if (!isMobile || isDragging) {
      return
    }

    setSheetMode((currentMode) => (currentMode === 'partial' ? 'full' : 'partial'))
  }

  function handlePointerDown(event) {
    if (!isMobile) {
      return
    }

    event.currentTarget.setPointerCapture?.(event.pointerId)
    dragStartYRef.current = event.clientY
    setIsDragging(true)
    setIsHandlePressed(true)
    setDragOffset(0)
  }

  function handlePointerMove(event) {
    if (!isMobile || !isDragging) {
      return
    }

    const deltaY = event.clientY - dragStartYRef.current
    setDragOffset(deltaY)
  }

  function handlePointerUp(event) {
    if (!isMobile || !isDragging) {
      setIsHandlePressed(false)
      return
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId)
    const deltaY = event.clientY - dragStartYRef.current
    const nextMode = deltaY < -40 ? 'full' : deltaY > 40 ? 'partial' : sheetMode

    setSheetMode(nextMode)
    setDragOffset(0)
    setIsDragging(false)
    setIsHandlePressed(false)
  }

  function handleSearchChange(event) {
    const nextValue = event.target.value

    startTransition(() => {
      setSearch(nextValue)
    })
  }

  return (
    <aside
      className={`sidebar ${isMobile ? `sidebar--mobile sidebar--${sheetMode}` : ''} ${
        isDragging ? 'sidebar--dragging' : ''
      } ${isHandlePressed ? 'sidebar--pressed' : ''}`}
      style={isMobile ? { '--sidebar-mobile-offset': `${mobileTranslateY}%` } : undefined}
    >
      <button
        type="button"
        className="sidebar__handle"
        onClick={toggleSheetMode}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label={sheetMode === 'full' ? 'Свернуть панель' : 'Развернуть панель'}
      >
        <span className="sidebar__handle-bar" />
      </button>

      <div className="sidebar__search">
        <img src={eyeIcon} alt="" className="sidebar__search-icon sidebar__search-icon--left" />
        <input
          className="sidebar__search-input"
          type="text"
          placeholder="Поиск событий..."
          value={search}
          onChange={handleSearchChange}
        />
        <img src={searchIcon} alt="" className="sidebar__search-icon" />
      </div>

      <div className="sidebar__list">
        {refreshing && !loading && <p className="sidebar__status">Обновляем события...</p>}
        {loading && <p className="sidebar__empty">Загружаем события...</p>}
        {!loading && error && <p className="sidebar__empty">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="sidebar__empty">События пока не найдены</p>
        )}

        {!loading &&
          !error &&
          filtered.map((incident) => (
            <button
              key={incident.id}
              type="button"
              className={`incident-card ${selectedIncidentId === incident.id ? 'incident-card--active' : ''}`}
              onClick={() => onIncidentSelect?.(incident)}
            >
              <div className="incident-card__title">{incident.title || 'Без названия'}</div>
              <div className="incident-card__address">{incident.description || 'Без описания'}</div>
              <div className="incident-card__time">{formatTimeLabel(incident.created_at)}</div>
            </button>
          ))}
      </div>
    </aside>
  )
}

export default Sidebar
