import { useEffect, useRef, useState } from 'react'
import newIcon from './assets/icons/New.png'

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Критический' },
  { value: 'high', label: 'Высокий' },
  { value: 'low', label: 'Низкий' },
]

function IncidentFormModal({
  address = '',
  addressLoading = false,
  isSubmitting = false,
  onClose,
  onSubmit,
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('high')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [submitError, setSubmitError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(imageFile)
    setImagePreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    try {
      await onSubmit?.({ title, description, address, severity, imageFile })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось создать событие.')
    }
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && !isSubmitting) {
      onClose()
    }
  }

  function handleChooseImage() {
    if (!isSubmitting) {
      fileInputRef.current?.click()
    }
  }

  function handleImageChange(event) {
    const nextFile = event.target.files?.[0] || null
    setImageFile(nextFile)
  }

  function handleClearImage() {
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal modal--incident">
        <button
          type="button"
          className="modal__close"
          onClick={onClose}
          aria-label="Закрыть"
          disabled={isSubmitting}
        >
          ×
        </button>

        <form className="modal__form modal__form--incident" onSubmit={handleSubmit}>
          <label className="modal__field">
            <span className="modal__field-label">Название</span>
            <input
              className="modal__line-input"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>

          <label className="modal__field">
            <span className="modal__field-label">Описание</span>
            <textarea
              className="modal__line-input modal__line-input--description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              required
            />
          </label>

          <div className="modal__field">
            <span className="modal__field-label modal__field-label--small">Уровень</span>
            <div
              className={`severity-switch severity-switch--${severity}`}
              role="radiogroup"
              aria-label="Уровень преступления"
            >
              <span className="severity-switch__highlight" aria-hidden="true" />

              {SEVERITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={severity === option.value}
                  className={`severity-switch__option ${
                    severity === option.value ? 'severity-switch__option--active' : ''
                  }`}
                  onClick={() => setSeverity(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="modal__field">
            <span className="modal__field-label modal__field-label--small">Изображение</span>
            <input
              ref={fileInputRef}
              className="modal__file-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            <div className="modal__image-row">
              <button
                type="button"
                className={`modal__image-picker ${imagePreview ? 'modal__image-picker--filled' : ''}`}
                onClick={handleChooseImage}
                disabled={isSubmitting}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="modal__image-preview" />
                ) : (
                  <div className="modal__image-placeholder">
                    <span className="modal__image-placeholder-mark">+</span>
                    <span className="modal__image-placeholder-title">Добавить фото</span>
                    <span className="modal__image-placeholder-text">
                      JPG, PNG или HEIC
                    </span>
                  </div>
                )}
              </button>

              <div className="modal__image-meta">
                <span className="modal__image-name">
                  {imageFile ? imageFile.name : 'Файл ещё не выбран'}
                </span>
                <span className="modal__image-hint">
                  {imageFile ? 'Изображение прикрепится к событию' : 'Нажмите, чтобы выбрать снимок'}
                </span>

                {imageFile && (
                  <button
                    type="button"
                    className="modal__image-clear"
                    onClick={handleClearImage}
                    disabled={isSubmitting}
                  >
                    Убрать
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="modal__footer">
            <label className="modal__field modal__field--address">
              <span className="modal__field-label modal__field-label--small">Адрес</span>
              <input
                className="modal__line-input modal__line-input--address"
                type="text"
                readOnly
                value={address}
                placeholder={addressLoading ? 'Определяем адрес...' : 'Адрес будет определён по геолокации'}
              />
            </label>

            <button
              type="submit"
              className="modal__submit-fab"
              aria-label="Создать событие"
              disabled={isSubmitting}
            >
              <img src={newIcon} alt="" className="modal__submit-fab-icon" />
            </button>
          </div>

          {submitError && <p className="modal__error">{submitError}</p>}
        </form>
      </div>
    </div>
  )
}

export default IncidentFormModal
