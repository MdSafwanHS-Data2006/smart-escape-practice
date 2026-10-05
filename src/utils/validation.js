/**
 * Strict schema and integrity validator for Smart Escape building JSON datasets.
 * Does not silently default missing or malformed required fields.
 */

/**
 * Validates a building JSON dataset against the required schema.
 * @param {unknown} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateBuildingJson(data) {
  const errors = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      isValid: false,
      errors: ['Dataset must be a non-null JSON object.'],
    };
  }

  // 1. building name
  if (typeof data.building !== 'string' || data.building.trim().length === 0) {
    errors.push('Top-level field "building" is required and must be a non-empty string.');
  }

  // 2. nodes array
  if (!Array.isArray(data.nodes)) {
    errors.push('Top-level field "nodes" is required and must be an array.');
  }

  // 3. edges array
  if (!Array.isArray(data.edges)) {
    errors.push('Top-level field "edges" is required and must be an array.');
  }

  // 4. initial_state object
  if (!data.initial_state || typeof data.initial_state !== 'object' || Array.isArray(data.initial_state)) {
    errors.push('Top-level field "initial_state" is required and must be an object.');
  } else {
    if (!Array.isArray(data.initial_state.blocked_nodes)) {
      errors.push('Field "initial_state.blocked_nodes" is required and must be an array.');
    }
    if (!Array.isArray(data.initial_state.blocked_edges)) {
      errors.push('Field "initial_state.blocked_edges" is required and must be an array.');
    }
    if (!Array.isArray(data.initial_state.closed_exits)) {
      errors.push('Field "initial_state.closed_exits" is required and must be an array.');
    }
  }

  // If top-level structure is already invalid, return early
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Validate nodes
  const nodeMap = new Map();
  let exitCount = 0;

  data.nodes.forEach((node, idx) => {
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      errors.push(`Node at index ${idx} must be an object.`);
      return;
    }

    if (typeof node.id !== 'string' || node.id.trim().length === 0) {
      errors.push(`Node at index ${idx} has missing or invalid "id" (must be a non-empty string).`);
      return;
    }

    if (nodeMap.has(node.id)) {
      errors.push(`Duplicate node id "${node.id}" detected at index ${idx}.`);
    } else {
      nodeMap.set(node.id, node);
    }

    if (typeof node.label !== 'string') {
      errors.push(`Node "${node.id}" has missing or invalid "label" (must be a string).`);
    }

    if (!['room', 'junction', 'exit'].includes(node.type)) {
      errors.push(`Node "${node.id}" has invalid type "${node.type}". Allowed types: "room", "junction", "exit".`);
    } else if (node.type === 'exit') {
      exitCount++;
    }

    if (typeof node.x !== 'number' || !Number.isFinite(node.x)) {
      errors.push(`Node "${node.id}" has invalid coordinate "x" (must be a finite number).`);
    }

    if (typeof node.y !== 'number' || !Number.isFinite(node.y)) {
      errors.push(`Node "${node.id}" has invalid coordinate "y" (must be a finite number).`);
    }
  });

  if (data.nodes.length === 0) {
    errors.push('The "nodes" array must contain at least one node.');
  }

  if (exitCount === 0) {
    errors.push('The dataset must contain at least one node of type "exit".');
  }

  // Validate edges
  const edgeMap = new Map();

  data.edges.forEach((edge, idx) => {
    if (!edge || typeof edge !== 'object' || Array.isArray(edge)) {
      errors.push(`Edge at index ${idx} must be an object.`);
      return;
    }

    if (typeof edge.id !== 'string' || edge.id.trim().length === 0) {
      errors.push(`Edge at index ${idx} has missing or invalid "id" (must be a non-empty string).`);
      return;
    }

    if (edgeMap.has(edge.id)) {
      errors.push(`Duplicate edge id "${edge.id}" detected at index ${idx}.`);
    } else {
      edgeMap.set(edge.id, edge);
    }

    if (typeof edge.from !== 'string' || !nodeMap.has(edge.from)) {
      errors.push(`Edge "${edge.id}" has invalid "from" reference "${edge.from}" (node does not exist).`);
    }

    if (typeof edge.to !== 'string' || !nodeMap.has(edge.to)) {
      errors.push(`Edge "${edge.id}" has invalid "to" reference "${edge.to}" (node does not exist).`);
    }

    if (edge.from && edge.to && edge.from === edge.to) {
      errors.push(`Edge "${edge.id}" connects node "${edge.from}" to itself (self-loops not allowed).`);
    }

    if (typeof edge.cost !== 'number' || !Number.isInteger(edge.cost) || edge.cost <= 0) {
      errors.push(`Edge "${edge.id}" has invalid cost "${edge.cost}" (must be a positive integer > 0).`);
    }
  });

  // Validate initial_state contents against nodes and edges
  if (data.initial_state) {
    data.initial_state.blocked_nodes.forEach((nodeId, idx) => {
      if (typeof nodeId !== 'string' || !nodeMap.has(nodeId)) {
        errors.push(`initial_state.blocked_nodes[${idx}] references non-existent node "${nodeId}".`);
      }
    });

    data.initial_state.blocked_edges.forEach((edgeId, idx) => {
      if (typeof edgeId !== 'string' || !edgeMap.has(edgeId)) {
        errors.push(`initial_state.blocked_edges[${idx}] references non-existent edge "${edgeId}".`);
      }
    });

    data.initial_state.closed_exits.forEach((exitId, idx) => {
      const node = nodeMap.get(exitId);
      if (!node) {
        errors.push(`initial_state.closed_exits[${idx}] references non-existent node "${exitId}".`);
      } else if (node.type !== 'exit') {
        errors.push(`initial_state.closed_exits[${idx}] node "${exitId}" is not of type "exit".`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
