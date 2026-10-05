import React from 'react';

export function BuildingMap({
  nodes = [],
  edges = [],
  selectedStartId,
  blockedNodes,
  blockedEdges,
  closedExits,
  routeResult,
  onNodeClick,
  onEdgeClick,
}) {
  // Compute dynamic viewBox for any dataset coordinates
  const { minX, minY, width, height } = React.useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return { minX: 0, minY: 0, width: 500, height: 300 };
    }
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);

    const padding = 55;
    const computedWidth = Math.max(xMax - xMin + padding * 2, 200);
    const computedHeight = Math.max(yMax - yMin + padding * 2, 160);

    return {
      minX: xMin - padding,
      minY: yMin - padding,
      width: computedWidth,
      height: computedHeight,
    };
  }, [nodes]);

  const nodeMap = React.useMemo(() => {
    const map = new Map();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const routeNodeSet = React.useMemo(() => {
    return new Set(routeResult?.route || []);
  }, [routeResult]);

  const routeEdgeSet = React.useMemo(() => {
    return new Set(routeResult?.edgeIds || []);
  }, [routeResult]);

  return (
    <div className="map-container">
      <svg
        viewBox={`${minX} ${minY} ${width} ${height}`}
        className="building-svg"
        aria-label="Building Evacuation Map"
      >
        <defs>
          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* 1. Corridors / Edges */}
        <g className="edges-layer">
          {edges.map((edge) => {
            const fromNode = nodeMap.get(edge.from);
            const toNode = nodeMap.get(edge.to);
            if (!fromNode || !toNode) return null;

            const isBlocked = blockedEdges.has(edge.id);
            const isRoute = routeEdgeSet.has(edge.id);
            const mx = (fromNode.x + toNode.x) / 2;
            const my = (fromNode.y + toNode.y) / 2;

            let edgeClass = 'edge-line';
            if (isBlocked) edgeClass += ' edge-blocked';
            else if (isRoute) edgeClass += ' edge-route';

            return (
              <g
                key={edge.id}
                className="edge-group"
                onClick={() => onEdgeClick(edge.id)}
                role="button"
                tabIndex={0}
                aria-label={`Corridor ${edge.id} between ${fromNode.id} and ${toNode.id} with cost ${edge.cost}`}
              >
                {/* Invisible wide hit area for easy clicking */}
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  className="edge-hit-area"
                />

                {/* Visible corridor line */}
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  className={edgeClass}
                  filter={isRoute ? 'url(#routeGlow)' : undefined}
                />

                {/* Midpoint cost badge */}
                <g className="edge-cost-badge">
                  <rect
                    x={mx - 13}
                    y={my - 10}
                    width={26}
                    height={20}
                    rx={4}
                    className={
                      isBlocked
                        ? 'cost-bg-blocked'
                        : isRoute
                        ? 'cost-bg-route'
                        : 'cost-bg-normal'
                    }
                  />
                  <text
                    x={mx}
                    y={my + 4}
                    textAnchor="middle"
                    className={isBlocked ? 'cost-text-blocked' : 'cost-text'}
                  >
                    {isBlocked ? '✕' : edge.cost}
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        {/* 2. Nodes */}
        <g className="nodes-layer">
          {nodes.map((node) => {
            const isStart = node.id === selectedStartId;
            const isBlocked = blockedNodes.has(node.id);
            const isClosed = closedExits.has(node.id);
            const isRoute = routeNodeSet.has(node.id);

            let nodeClass = `node node-${node.type}`;
            if (isStart) nodeClass += ' node-start';
            if (isBlocked) nodeClass += ' node-blocked';
            if (isClosed) nodeClass += ' node-closed';
            if (isRoute && !isStart) nodeClass += ' node-on-route';

            return (
              <g
                key={node.id}
                className={`node-group ${nodeClass}`}
                onClick={() => onNodeClick(node)}
                role="button"
                tabIndex={0}
                aria-label={`${node.label} (${node.id}), type: ${node.type}${
                  isBlocked ? ', blocked' : ''
                }${isClosed ? ', closed' : ''}${isStart ? ', selected start' : ''}`}
              >
                {/* Start pulse indicator */}
                {isStart && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.type === 'junction' ? 24 : 32}
                    className="start-pulse-ring"
                  />
                )}

                {/* Node Shape */}
                {node.type === 'room' && (
                  <rect
                    x={node.x - 26}
                    y={node.y - 18}
                    width={52}
                    height={36}
                    rx={6}
                    className="node-shape"
                  />
                )}

                {node.type === 'junction' && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={18}
                    className="node-shape"
                  />
                )}

                {node.type === 'exit' && (
                  <rect
                    x={node.x - 28}
                    y={node.y - 18}
                    width={56}
                    height={36}
                    rx={6}
                    className="node-shape"
                  />
                )}

                {/* Node ID label inside */}
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  className="node-id-text"
                >
                  {node.id}
                </text>

                {/* Status badge symbol if blocked or closed */}
                {isBlocked && (
                  <g transform={`translate(${node.x + 14}, ${node.y - 16})`}>
                    <circle r="7" className="hazard-badge-circle" />
                    <text textAnchor="middle" y="3" className="hazard-badge-icon">
                      ✕
                    </text>
                  </g>
                )}

                {node.type === 'exit' && isClosed && !isBlocked && (
                  <g transform={`translate(${node.x + 14}, ${node.y - 16})`}>
                    <circle r="7" className="closed-badge-circle" />
                    <text textAnchor="middle" y="3" className="closed-badge-icon">
                      ⊘
                    </text>
                  </g>
                )}

                {/* Dataset-provided Node Label below (kept unchanged) */}
                <text
                  x={node.x}
                  y={node.y + 32}
                  textAnchor="middle"
                  className="node-label-text"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
