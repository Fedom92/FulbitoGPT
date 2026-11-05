import './DeleteZone.css';

function DeleteZone({ visible, height, active }) {
  return (
    <div
      className={`delete-zone${visible ? ' delete-zone--visible' : ''}${active ? ' delete-zone--active' : ''}`}
      style={height ? { height } : undefined}
      aria-hidden={!visible}
    >
      🗑️ {active ? 'SOLTÁ PARA ELIMINAR' : 'ELIMINAR'}
    </div>
  );
}

export default DeleteZone;
