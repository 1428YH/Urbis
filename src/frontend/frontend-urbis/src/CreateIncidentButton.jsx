import addIcon from '../src/assets/icons/Add.png'

function CreateIncidentButton({ onClick }) {
  return (
    <button className="create-btn" onClick={onClick}>
      <img src={addIcon} alt="Добавить инцидент" />
    </button>
  )
}

export default CreateIncidentButton