import React from 'react';
import { t } from '../utils/translations.js';

export function RouteInfo({ routeResult, selectedStartNode, nodeMap, lang = 'en' }) {
  if (!selectedStartNode) {
    return (
      <div className="status-card status-info" role="status">
        <p className="status-message">{t('statusNoStart', lang)}</p>
      </div>
    );
  }

  const { status, route, cost, exitId } = routeResult;

  if (status === 'START_BLOCKED') {
    return (
      <div className="status-card status-danger" role="alert">
        <div className="status-badge danger-badge">⚠️</div>
        <div>
          <h3 className="status-title">{t('statusStartBlocked', lang)}</h3>
          <p className="status-desc">
            {selectedStartNode.label} ({selectedStartNode.id})
          </p>
        </div>
      </div>
    );
  }

  if (status === 'NO_ROUTE') {
    return (
      <div className="status-card status-warning" role="alert">
        <div className="status-badge warning-badge">🚫</div>
        <div>
          <h3 className="status-title">{t('statusNoRoute', lang)}</h3>
          <p className="status-desc">
            {t('startLocationLabel', lang)}: {selectedStartNode.label} ({selectedStartNode.id})
          </p>
        </div>
      </div>
    );
  }

  if (status === 'INVALID_START') {
    return (
      <div className="status-card status-warning" role="alert">
        <p className="status-message">{t('statusInvalidStart', lang)}</p>
      </div>
    );
  }

  if (status === 'ROUTE_FOUND' && route) {
    const exitNode = nodeMap.get(exitId);

    return (
      <div className="status-card status-success" role="status">
        <div className="route-header">
          <div>
            <h3 className="status-title success-text">{t('statusRouteFound', lang)}</h3>
            <p className="status-exit-info">
              {t('destinationExit', lang)}: <strong>{exitNode ? exitNode.label : exitId} ({exitId})</strong>
            </p>
          </div>
          <div className="cost-pill">
            <span className="cost-label">{t('totalCost', lang)}</span>
            <span className="cost-value">{cost}</span>
          </div>
        </div>

        <div className="route-sequence-box">
          <span className="sequence-label">{t('pathSteps', lang)}:</span>
          <div className="route-breadcrumb">
            {route.map((nodeId, index) => {
              const node = nodeMap.get(nodeId);
              const isLast = index === route.length - 1;
              return (
                <React.Fragment key={nodeId}>
                  <span className={`breadcrumb-step ${isLast ? 'step-exit' : index === 0 ? 'step-start' : 'step-junction'}`}>
                    {node ? node.label : nodeId}
                    <span className="step-id">({nodeId})</span>
                  </span>
                  {!isLast && <span className="breadcrumb-arrow">→</span>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
