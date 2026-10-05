/**
 * Pure graph data structure and routing algorithm for Smart Escape.
 * Independent of React and UI code.
 *
 * Exclusively uses edge cost (never x/y coordinates).
 * Adheres strictly to undirected graph traversal and required tie-breaking rules.
 */

/**
 * Compares two sequences of node IDs lexicographically.
 * Returns negative if pathA < pathB, positive if pathA > pathB, 0 if equal.
 * @param {string[]} pathA
 * @param {string[]} pathB
 * @returns {number}
 */
export function compareNodeSequences(pathA, pathB) {
  const len = Math.min(pathA.length, pathB.length);
  for (let i = 0; i < len; i++) {
    if (pathA[i] < pathB[i]) return -1;
    if (pathA[i] > pathB[i]) return 1;
  }
  return pathA.length - pathB.length;
}

/**
 * Builds an undirected adjacency list from node and edge definitions.
 * @param {Array<{ id: string, type: string, [key: string]: any }>} nodes
 * @param {Array<{ id: string, from: string, to: string, cost: number }>} edges
 * @returns {{
 *   nodeMap: Map<string, any>,
 *   edgeMap: Map<string, any>,
 *   adj: Map<string, Array<{ toId: string, edgeId: string, cost: number }>>
 * }}
 */
export function buildGraph(nodes = [], edges = []) {
  const nodeMap = new Map();
  const edgeMap = new Map();
  const adj = new Map();

  for (const node of nodes) {
    nodeMap.set(node.id, node);
    adj.set(node.id, []);
  }

  for (const edge of edges) {
    edgeMap.set(edge.id, edge);

    if (adj.has(edge.from) && adj.has(edge.to)) {
      // Undirected edge: traverse in both directions
      adj.get(edge.from).push({ toId: edge.to, edgeId: edge.id, cost: edge.cost });
      adj.get(edge.to).push({ toId: edge.from, edgeId: edge.id, cost: edge.cost });
    }
  }

  return { nodeMap, edgeMap, adj };
}

/**
 * Simple MinPriorityQueue for Dijkstra exploration with tie-breaking.
 */
class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  push(item) {
    this.elements.push(item);
    this.elements.sort((a, b) => {
      if (a.cost !== b.cost) return a.cost - b.cost;
      return compareNodeSequences(a.path, b.path);
    });
  }

  pop() {
    return this.elements.shift();
  }

  isEmpty() {
    return this.elements.length === 0;
  }
}

/**
 * Calculates the lowest-cost escape route from startNodeId to an accessible open exit.
 *
 * Tie-breaking hierarchy:
 * 1. lowest total cost
 * 2. lexicographically smallest exit ID
 * 3. if paths to that exit tie, lexicographically smallest sequence of node IDs
 *
 * @param {Object} params
 * @param {Array} params.nodes
 * @param {Array} params.edges
 * @param {string|null} params.startNodeId
 * @param {Set<string>|Array<string>} [params.blockedNodes]
 * @param {Set<string>|Array<string>} [params.blockedEdges]
 * @param {Set<string>|Array<string>} [params.closedExits]
 * @returns {{
 *   status: 'ROUTE_FOUND' | 'NO_ROUTE' | 'START_BLOCKED' | 'NO_START' | 'INVALID_START',
 *   route: string[] | null,
 *   cost: number,
 *   edgeIds: string[],
 *   exitId: string | null
 * }}
 */
export function findEscapeRoute({
  nodes = [],
  edges = [],
  startNodeId,
  blockedNodes = new Set(),
  blockedEdges = new Set(),
  closedExits = new Set(),
}) {
  if (!startNodeId) {
    return {
      status: 'NO_START',
      route: null,
      cost: 0,
      edgeIds: [],
      exitId: null,
    };
  }

  const { nodeMap, adj } = buildGraph(nodes, edges);
  const startNode = nodeMap.get(startNodeId);

  if (!startNode) {
    return {
      status: 'NO_START',
      route: null,
      cost: 0,
      edgeIds: [],
      exitId: null,
    };
  }

  // Only rooms and junctions can be starting locations
  if (startNode.type === 'exit') {
    return {
      status: 'INVALID_START',
      route: null,
      cost: 0,
      edgeIds: [],
      exitId: null,
    };
  }

  const blockedNodesSet = blockedNodes instanceof Set ? blockedNodes : new Set(blockedNodes);
  const blockedEdgesSet = blockedEdges instanceof Set ? blockedEdges : new Set(blockedEdges);
  const closedExitsSet = closedExits instanceof Set ? closedExits : new Set(closedExits);

  // 1. Detect if the selected starting location is blocked
  if (blockedNodesSet.has(startNodeId)) {
    return {
      status: 'START_BLOCKED',
      route: null,
      cost: 0,
      edgeIds: [],
      exitId: null,
    };
  }

  // Identify all potential open exits
  const openExitIds = new Set();
  for (const node of nodes) {
    if (node.type === 'exit' && !closedExitsSet.has(node.id) && !blockedNodesSet.has(node.id)) {
      openExitIds.add(node.id);
    }
  }

  if (openExitIds.size === 0) {
    return {
      status: 'NO_ROUTE',
      route: null,
      cost: 0,
      edgeIds: [],
      exitId: null,
    };
  }

  // Dijkstra data structures
  const dist = new Map();
  const bestPath = new Map();
  const bestEdges = new Map();

  dist.set(startNodeId, 0);
  bestPath.set(startNodeId, [startNodeId]);
  bestEdges.set(startNodeId, []);

  const pq = new PriorityQueue();
  pq.push({
    id: startNodeId,
    cost: 0,
    path: [startNodeId],
    edges: [],
  });

  while (!pq.isEmpty()) {
    const current = pq.pop();
    const u = current.id;
    const uCost = current.cost;
    const uPath = current.path;

    // Stale entry check: if we already found a strictly better cost or lexicographical path to u
    const currentBestCost = dist.get(u);
    if (uCost > currentBestCost) continue;
    if (uCost === currentBestCost && compareNodeSequences(uPath, bestPath.get(u)) > 0) continue;

    const neighbors = adj.get(u) || [];

    for (const edge of neighbors) {
      const v = edge.toId;
      const edgeId = edge.edgeId;
      const weight = edge.cost;

      // Ignore blocked edges
      if (blockedEdgesSet.has(edgeId)) continue;

      // Blocked nodes cannot be entered or crossed
      if (blockedNodesSet.has(v)) continue;

      // Closed exits cannot be destinations or intermediate nodes
      if (closedExitsSet.has(v)) continue;

      const candCost = uCost + weight;
      const candPath = [...uPath, v];
      const candEdges = [...current.edges, edgeId];

      const existingDist = dist.has(v) ? dist.get(v) : Infinity;

      let isBetter = false;

      if (candCost < existingDist) {
        isBetter = true;
      } else if (candCost === existingDist) {
        // Equal cost to the same node: tie-break by lexicographically smallest node sequence
        const existingPath = bestPath.get(v);
        if (!existingPath || compareNodeSequences(candPath, existingPath) < 0) {
          isBetter = true;
        }
      }

      if (isBetter) {
        dist.set(v, candCost);
        bestPath.set(v, candPath);
        bestEdges.set(v, candEdges);

        pq.push({
          id: v,
          cost: candCost,
          path: candPath,
          edges: candEdges,
        });
      }
    }
  }

  // Evaluate reached open exits
  const reachedExits = [];
  for (const exitId of openExitIds) {
    if (dist.has(exitId)) {
      reachedExits.push({
        exitId,
        cost: dist.get(exitId),
        path: bestPath.get(exitId),
        edgeIds: bestEdges.get(exitId),
      });
    }
  }

  if (reachedExits.length === 0) {
    return {
      status: 'NO_ROUTE',
      route: null,
      cost: 0,
      edgeIds: [],
      exitId: null,
    };
  }

  // Tie-breaking among exits:
  // 1. lowest total cost
  // 2. lexicographically smallest exit ID
  // 3. if paths to that exit tie, lexicographically smallest sequence of node IDs (already satisfied by bestPath)
  reachedExits.sort((a, b) => {
    if (a.cost !== b.cost) return a.cost - b.cost;
    if (a.exitId !== b.exitId) return a.exitId.localeCompare(b.exitId);
    return compareNodeSequences(a.path, b.path);
  });

  const best = reachedExits[0];

  return {
    status: 'ROUTE_FOUND',
    route: best.path,
    cost: best.cost,
    edgeIds: best.edgeIds,
    exitId: best.exitId,
  };
}
