import React from 'react';
import { t } from '../utils/translations.js';

export function ControlPanel({
  nodes = [],
  selectedStartId,
  onSelectStart,
  interactionMode,
  onChangeMode,
  onReset,
  lang,
  onToggleLang,
  onFileUpload,
  onLoadSample,
}) {
  const fileInputRef = React.useRef(null);

  // Filter selectable nodes: only rooms and junctions
  const selectableNodes = React.useMemo(() => {
    return nodes.filter((n) => n.type === 'room' || n.type === 'junction');
  }, [nodes]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      // reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="control-panel">
      {/* Top bar: Actions & Language */}
      <div className="control-row">
        <div className="action-buttons-group">
          <input
            type="file"
            accept=".json,application/json"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="json-file-input"
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            📁 {t('importJson', lang)}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onLoadSample}
          >
            🔄 {t('useSample', lang)}
          </button>
          <button
            type="button"
            className="btn btn-warning"
            onClick={onReset}
          >
            ↺ {t('resetButton', lang)}
          </button>
        </div>

        <button
          type="button"
          className="btn btn-lang"
          onClick={onToggleLang}
          aria-label="Switch language"
        >
          🌐 {t('langToggle', lang)}
        </button>
      </div>

      {/* Second row: Mode switch & Start location select */}
      <div className="control-row secondary-controls">
        <div className="mode-toggle-group">
          <span className="control-label">{t('modeLabel', lang)}</span>
          <div className="segmented-control">
            <button
              type="button"
              className={`segment-btn ${interactionMode === 'select-start' ? 'active' : ''}`}
              onClick={() => onChangeMode('select-start')}
            >
              🎯 {t('modeSelectStart', lang)}
            </button>
            <button
              type="button"
              className={`segment-btn ${interactionMode === 'toggle-hazard' ? 'active' : ''}`}
              onClick={() => onChangeMode('toggle-hazard')}
            >
              ⚠️ {t('modeToggleHazard', lang)}
            </button>
          </div>
        </div>

        <div className="start-select-group">
          <label htmlFor="start-node-select" className="control-label">
            {t('startLocationLabel', lang)}:
          </label>
          <select
            id="start-node-select"
            className="select-input"
            value={selectedStartId || ''}
            onChange={(e) => onSelectStart(e.target.value || null)}
          >
            <option value="">{t('chooseStartPrompt', lang)}</option>
            {selectableNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label} ({n.id}) - {n.type}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
