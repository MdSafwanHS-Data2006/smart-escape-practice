import React from 'react';
import { t } from '../utils/translations.js';

export function HazardManager({
  nodeMap,
  edgeMap,
  blockedNodes,
  blockedEdges,
  closedExits,
  onToggleNodeHazard,
  onToggleEdgeHazard,
  onToggleExitClosure,
  lang = 'en',
}) {
  const blockedNodeList = Array.from(blockedNodes);
  const blockedEdgeList = Array.from(blockedEdges);
  const closedExitList = Array.from(closedExits);

  const totalHazards = blockedNodeList.length + blockedEdgeList.length + closedExitList.length;

  return (
    <div className="hazard-manager-panel">
      <div className="hazard-manager-header">
        <h4 className="hazard-manager-title">
          ⚠️ {t('hazardsTitle', lang)}
          <span className="hazard-count-pill">{totalHazards}</span>
        </h4>
        <span className="hazard-hint">{t('clickToToggle', lang)}</span>
      </div>

      <div className="hazard-columns">
        {/* 1. Blocked Nodes */}
        <div className="hazard-section">
          <h5>{t('blockedNodesLabel', lang)} ({blockedNodeList.length})</h5>
          <div className="hazard-chips-list">
            {blockedNodeList.length === 0 ? (
              <span className="hazard-empty-text">{t('noBlockedNodes', lang)}</span>
            ) : (
              blockedNodeList.map((id) => {
                const node = nodeMap.get(id);
                return (
                  <button
                    key={id}
                    type="button"
                    className="hazard-chip chip-node"
                    onClick={() => onToggleNodeHazard(id)}
                    title={t('clickToToggle', lang)}
                  >
                    <span className="chip-name">{node ? node.label : id}</span>
                    <span className="chip-id">({id})</span>
                    <span className="chip-remove">✕</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 2. Blocked Edges */}
        <div className="hazard-section">
          <h5>{t('blockedEdgesLabel', lang)} ({blockedEdgeList.length})</h5>
          <div className="hazard-chips-list">
            {blockedEdgeList.length === 0 ? (
              <span className="hazard-empty-text">{t('noBlockedEdges', lang)}</span>
            ) : (
              blockedEdgeList.map((id) => {
                const edge = edgeMap.get(id);
                return (
                  <button
                    key={id}
                    type="button"
                    className="hazard-chip chip-edge"
                    onClick={() => onToggleEdgeHazard(id)}
                    title={t('clickToToggle', lang)}
                  >
                    <span className="chip-name">
                      {edge ? `${edge.from} ↔ ${edge.to}` : id}
                    </span>
                    <span className="chip-id">({id})</span>
                    <span className="chip-remove">✕</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 3. Closed Exits */}
        <div className="hazard-section">
          <h5>{t('closedExitsLabel', lang)} ({closedExitList.length})</h5>
          <div className="hazard-chips-list">
            {closedExitList.length === 0 ? (
              <span className="hazard-empty-text">{t('noClosedExits', lang)}</span>
            ) : (
              closedExitList.map((id) => {
                const node = nodeMap.get(id);
                return (
                  <button
                    key={id}
                    type="button"
                    className="hazard-chip chip-exit"
                    onClick={() => onToggleExitClosure(id)}
                    title={t('clickToToggle', lang)}
                  >
                    <span className="chip-name">{node ? node.label : id}</span>
                    <span className="chip-id">({id})</span>
                    <span className="chip-remove">✕</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
