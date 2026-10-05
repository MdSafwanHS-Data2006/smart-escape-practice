import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { validateBuildingJson } from './utils/validation.js';
import { findEscapeRoute } from './utils/graph.js';
import { t } from './utils/translations.js';
import { BuildingMap } from './components/BuildingMap.jsx';
import { RouteInfo } from './components/RouteInfo.jsx';
import { ControlPanel } from './components/ControlPanel.jsx';
import { HazardManager } from './components/HazardManager.jsx';
import { Legend } from './components/Legend.jsx';
import './App.css';

export default function App() {
  const [lang, setLang] = useState('en');
  const [buildingData, setBuildingData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  // Hazard states (Set of IDs)
  const [blockedNodes, setBlockedNodes] = useState(new Set());
  const [blockedEdges, setBlockedEdges] = useState(new Set());
  const [closedExits, setClosedExits] = useState(new Set());

  // Start selection & interaction mode
  const [selectedStartId, setSelectedStartId] = useState(null);
  const [interactionMode, setInteractionMode] = useState('select-start'); // 'select-start' | 'toggle-hazard'

  // Apply a validated building dataset
  const applyDataset = useCallback((data) => {
    const valResult = validateBuildingJson(data);
    if (!valResult.isValid) {
      setValidationErrors(valResult.errors);
      return false;
    }

    setBuildingData(data);
    setValidationErrors([]);
    setLoadError(null);

    // Initialize hazards from initial_state
    const initNodes = new Set(data.initial_state?.blocked_nodes || []);
    const initEdges = new Set(data.initial_state?.blocked_edges || []);
    const initExits = new Set(data.initial_state?.closed_exits || []);

    setBlockedNodes(initNodes);
    setBlockedEdges(initEdges);
    setClosedExits(initExits);

    // Set initial start location to first available unblocked room
    const firstUnblockedRoom = data.nodes.find(
      (n) => n.type === 'room' && !initNodes.has(n.id)
    );
    setSelectedStartId(firstUnblockedRoom ? firstUnblockedRoom.id : null);
    return true;
  }, []);

  // Load sample dataset on mount
  const loadSampleDataset = useCallback(() => {
    fetch('/building.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load /building.json (HTTP ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        applyDataset(data);
      })
      .catch((err) => {
        setLoadError(err.message || 'Error loading building dataset');
      });
  }, [applyDataset]);

  useEffect(() => {
    let ignore = false;
    fetch('/building.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load /building.json (HTTP ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (!ignore) {
          applyDataset(data);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setLoadError(err.message || 'Error loading building dataset');
        }
      });

    return () => {
      ignore = true;
    };
  }, [applyDataset]);

  // Lookup maps for nodes and edges
  const { nodeMap, edgeMap } = useMemo(() => {
    const nMap = new Map();
    const eMap = new Map();
    if (buildingData) {
      buildingData.nodes.forEach((n) => nMap.set(n.id, n));
      buildingData.edges.forEach((e) => eMap.set(e.id, e));
    }
    return { nodeMap: nMap, edgeMap: eMap };
  }, [buildingData]);

  // Immediate recalculation via pure Dijkstra routing
  const routeResult = useMemo(() => {
    if (!buildingData) {
      return { status: 'NO_START', route: null, cost: 0, edgeIds: [], exitId: null };
    }
    return findEscapeRoute({
      nodes: buildingData.nodes,
      edges: buildingData.edges,
      startNodeId: selectedStartId,
      blockedNodes,
      blockedEdges,
      closedExits,
    });
  }, [buildingData, selectedStartId, blockedNodes, blockedEdges, closedExits]);

  // Reset to original initial_state
  const handleReset = useCallback(() => {
    if (!buildingData) return;
    const initNodes = new Set(buildingData.initial_state?.blocked_nodes || []);
    const initEdges = new Set(buildingData.initial_state?.blocked_edges || []);
    const initExits = new Set(buildingData.initial_state?.closed_exits || []);

    setBlockedNodes(initNodes);
    setBlockedEdges(initEdges);
    setClosedExits(initExits);
  }, [buildingData]);

  // Interactive node click handler
  const handleNodeClick = useCallback(
    (node) => {
      if (interactionMode === 'select-start') {
        if (node.type === 'exit') {
          // Exits cannot be start locations
          return;
        }
        setSelectedStartId(node.id);
      } else {
        // Toggle hazard mode
        if (node.type === 'exit') {
          setClosedExits((prev) => {
            const next = new Set(prev);
            if (next.has(node.id)) next.delete(node.id);
            else next.add(node.id);
            return next;
          });
        } else {
          setBlockedNodes((prev) => {
            const next = new Set(prev);
            if (next.has(node.id)) next.delete(node.id);
            else next.add(node.id);
            return next;
          });
        }
      }
    },
    [interactionMode]
  );

  // Interactive edge click handler
  const handleEdgeClick = useCallback((edgeId) => {
    setBlockedEdges((prev) => {
      const next = new Set(prev);
      if (next.has(edgeId)) next.delete(edgeId);
      else next.add(edgeId);
      return next;
    });
  }, []);

  // Individual toggle handlers for hazard manager panel
  const handleToggleNodeHazard = useCallback((nodeId) => {
    setBlockedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const handleToggleEdgeHazard = useCallback((edgeId) => {
    setBlockedEdges((prev) => {
      const next = new Set(prev);
      if (next.has(edgeId)) next.delete(edgeId);
      else next.add(edgeId);
      return next;
    });
  }, []);

  const handleToggleExitClosure = useCallback((exitId) => {
    setClosedExits((prev) => {
      const next = new Set(prev);
      if (next.has(exitId)) next.delete(exitId);
      else next.add(exitId);
      return next;
    });
  }, []);

  // File upload handler
  const handleFileUpload = useCallback(
    (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result);
          applyDataset(parsed);
        } catch (err) {
          setValidationErrors([`JSON Syntax Error: ${err.message}`]);
        }
      };
      reader.onerror = () => {
        setValidationErrors(['Error reading uploaded file.']);
      };
      reader.readAsText(file);
    },
    [applyDataset]
  );

  const selectedStartNode = selectedStartId ? nodeMap.get(selectedStartId) : null;

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-titles">
          <h1 className="app-heading">{t('appTitle', lang)}</h1>
          <p className="app-subheading">
            {buildingData?.building || t('appSubtitle', lang)}
          </p>
        </div>
      </header>

      {/* Validation Error Banner */}
      {validationErrors.length > 0 && (
        <div className="error-banner" role="alert">
          <div className="error-banner-content">
            <h4>⚠️ {t('fileErrorTitle', lang)}</h4>
            <ul>
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => setValidationErrors([])}
          >
            {t('closeError', lang)}
          </button>
        </div>
      )}

      {/* Load error */}
      {loadError && (
        <div className="error-banner" role="alert">
          <p>{loadError}</p>
        </div>
      )}

      {/* Control Panel */}
      {buildingData && (
        <ControlPanel
          nodes={buildingData.nodes}
          selectedStartId={selectedStartId}
          onSelectStart={setSelectedStartId}
          interactionMode={interactionMode}
          onChangeMode={setInteractionMode}
          onReset={handleReset}
          lang={lang}
          onToggleLang={() => setLang((l) => (l === 'en' ? 'bn' : 'en'))}
          onFileUpload={handleFileUpload}
          onLoadSample={loadSampleDataset}
        />
      )}

      {/* Route & Status Display */}
      {buildingData && (
        <RouteInfo
          routeResult={routeResult}
          selectedStartNode={selectedStartNode}
          nodeMap={nodeMap}
          lang={lang}
        />
      )}

      {/* Main Map View */}
      {buildingData && (
        <main className="map-section">
          <p className="map-tip">{t('mapInstructions', lang)}</p>
          <BuildingMap
            nodes={buildingData.nodes}
            edges={buildingData.edges}
            selectedStartId={selectedStartId}
            blockedNodes={blockedNodes}
            blockedEdges={blockedEdges}
            closedExits={closedExits}
            routeResult={routeResult}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
          />
        </main>
      )}

      {/* Bottom Side-by-Side: Hazard Manager & Legend */}
      {buildingData && (
        <div className="bottom-panels-grid">
          <HazardManager
            nodeMap={nodeMap}
            edgeMap={edgeMap}
            blockedNodes={blockedNodes}
            blockedEdges={blockedEdges}
            closedExits={closedExits}
            onToggleNodeHazard={handleToggleNodeHazard}
            onToggleEdgeHazard={handleToggleEdgeHazard}
            onToggleExitClosure={handleToggleExitClosure}
            lang={lang}
          />
          <Legend lang={lang} />
        </div>
      )}
    </div>
  );
}
