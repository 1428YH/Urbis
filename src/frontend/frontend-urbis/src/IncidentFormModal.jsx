import { useState } from 'react'

function IncidentFormModal({ onClose }) {
  const [title, setTitle]       = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: отправить данные на бэкенд
    console.log({ title, description })
    onClose()
  }

  // Клик по тёмному фону — закрыть модалку
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">

        <div className="modal__header">
          <h2 className="modal__title">Новый инцидент</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>

          <label className="modal__label">
            Название
            <input
              className="modal__input"
              type="text"
              placeholder="Введите название..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="modal__label">
            Описание
            <textarea
              className="modal__textarea"
              placeholder="Опишите инцидент..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />
          </label>

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="modal__btn modal__btn--submit">
              Создать
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default IncidentFormModal
