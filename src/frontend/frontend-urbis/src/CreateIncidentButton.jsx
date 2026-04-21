function CreateIncidentButton({ onClick }) {
  return (
    <button className="create-btn" onClick={onClick}>
      + Добавить инцидент
    </button>
  )
}

export default CreateIncidentButton
