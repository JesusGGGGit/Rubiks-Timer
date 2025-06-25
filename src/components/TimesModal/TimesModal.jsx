import CubeVisualization from '../CubeVisualization/CubeVisualization';
import { parseScramble } from '..//utils/cubeUtils'; 
import {formatTimeFull } from '../utils/formatUtils';


const Modals = ({
  showDeleteModal,
  onCancelDelete,
  onConfirmDelete,
  dontAskAgain,
  setDontAskAgain,
  showTimeDetailModal,
  timeDetail,
  onCloseDetail,
  applyPlusTwo,
  applyDnf,
  plusTwoTimes,
  dnfTimes,
}) => (
  <>
    {showDeleteModal && (
      <div className="modal-overlay" onClick={onCancelDelete}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <p>¿Estás seguro de que quieres borrar este tiempo?</p>
          <div className="modal-checkbox">
            <label className="centered-label">
              <input
                type="checkbox"
                checked={dontAskAgain}
                onChange={(e) => setDontAskAgain(e.target.checked)}
              />
              No preguntar de nuevo
            </label>
          </div>
          <div className="modal-actions">
            <button className="btn cancel-btn" onClick={onCancelDelete}>Cancelar</button>
            <button className="delete-button" onClick={onConfirmDelete}>Borrar</button>
          </div>
        </div>
      </div>
    )}

    {showTimeDetailModal && timeDetail && (
      <div className="modal-overlay" onClick={onCloseDetail}>
        <div className="time-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="time-detail-content">
            <div className="time-detail-header">
              <h3>Detalle del Tiempo #{timeDetail.index + 1}</h3>
            </div>

            <div className="time-detail-info">
              <div className="time-detail-item">
                <div className="time-detail-label">Tiempo</div>
                <div className="time-detail-value">
                  {formatTimeFull(timeDetail.time, timeDetail.index, plusTwoTimes, dnfTimes)}
                </div>
              </div>

              <div className="time-detail-item">
                <div className="time-detail-label">Scramble</div>
                <div className="time-detail-value">{timeDetail.scramble}</div>
                <CubeVisualization cubeState={parseScramble(timeDetail.scramble)} />
              </div>
            </div>

            <div className="time-detail-actions">
              <button className="time-detail-btn secondary" onClick={onCloseDetail}>Cerrar</button>
              <button
                className={`time-detail-btn ${plusTwoTimes.includes(timeDetail.index) ? 'active' : 'primary'}`}
                onClick={applyPlusTwo}
                disabled={dnfTimes.includes(timeDetail.index)}
              >
                {plusTwoTimes.includes(timeDetail.index) ? 'Quitar +2' : 'Aplicar +2'}
              </button>
              <button
                className={`time-detail-btn ${dnfTimes.includes(timeDetail.index) ? 'danger-active' : 'danger'}`}
                onClick={applyDnf}
              >
                {dnfTimes.includes(timeDetail.index) ? 'Quitar DNF' : 'Marcar DNF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);
export default Modals;
