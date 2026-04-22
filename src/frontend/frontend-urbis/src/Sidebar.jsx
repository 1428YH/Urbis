import { useState } from 'react'
import searchIcon from '../src/assets/icons/Search.png'
<img src={searchIcon} className="sidebar__search-icon" alt="поиск" />

const INCIDENTS = [
  { id: 1, title: 'Ограбление',        address: 'ул. Ленина, 12',   time: '2 мин назад'  },
  { id: 2, title: 'ДТП',               address: 'пр. Мира, 45',     time: '8 мин назад'  },
  { id: 3, title: 'Драка',             address: 'ул. Садовая, 3',   time: '15 мин назад' },
  { id: 4, title: 'Кража',             address: 'ТЦ Галерея',       time: '34 мин назад' },
  { id: 5, title: 'Вооружённый налёт', address: 'ул. Пушкина, 7',   time: '1 ч назад'    },
]

function Sidebar() {
  const [search, setSearch] = useState('')

  const filtered = INCIDENTS.filter(inc =>
    inc.title.toLowerCase().includes(search.toLowerCase()) ||
    inc.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <aside className="sidebar">
      <div className="sidebar__search">
        <img src={searchIcon} alt="" className="sidebar__search-icon" />
        <input
          className="sidebar__search-input"
          type="text"
          placeholder="Поиск инцидентов..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="sidebar__list">
        {filtered.length === 0 && (
          <p className="sidebar__empty">Ничего не найдено</p>
        )}
        {filtered.map(inc => (
          <div key={inc.id} className="incident-card">
            <div className="incident-card__title">{inc.title}</div>
            <div className="incident-card__address">{inc.address}</div>
            <div className="incident-card__time">{inc.time}</div>
          </div>
        ))}
      </div>

    </aside>
  )
}

export default Sidebar
