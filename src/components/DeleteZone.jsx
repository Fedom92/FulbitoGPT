import './DeleteZone.css';

export const DELETE_ZONE_HEIGHT_PX = 96;

function DeleteZone({ visible }) {
  return (
    <div
      className={`delete-zone${visible ? ' delete-zone--visible' : ''}`}
      style={{ height: DELETE_ZONE_HEIGHT_PX }}
      aria-hidden={!visible}
    >
      ELIMINAR
    </div>
  );
}

export default DeleteZone;
