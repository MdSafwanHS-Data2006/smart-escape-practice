import React from 'react';
import { t } from '../utils/translations.js';

export function Legend({ lang = 'en' }) {
  return (
    <div className="legend-panel">
      <h5 className="legend-title">{t('legendTitle', lang)}</h5>
      <div className="legend-items">
        <div className="legend-item">
          <span className="legend-swatch swatch-room"></span>
          <span>{t('legendRoom', lang)}</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch swatch-junction"></span>
          <span>{t('legendJunction', lang)}</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch swatch-exit"></span>
          <span>{t('legendExit', lang)}</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch swatch-closed-exit"></span>
          <span>{t('legendClosedExit', lang)}</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch swatch-start"></span>
          <span>{t('legendStart', lang)}</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch swatch-blocked-node"></span>
          <span>{t('legendBlockedNode', lang)}</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch swatch-route"></span>
          <span>{t('legendRoute', lang)}</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch swatch-blocked-edge"></span>
          <span>{t('legendBlockedEdge', lang)}</span>
        </div>
      </div>
    </div>
  );
}
