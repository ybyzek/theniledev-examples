import { AttributeType } from '@theniledev/react';

/**
 * manually created from entity_definition.json
 */
const fields = [
  { name: 'cluster_name', label: 'Cluster name', required: true },
  { name: 'ARN', label: 'ARN' },
];
export default fields;

const columns = [
  'cluster_name',
  'ARN',
  'Endpoint',
  'status',
];
export { columns };

const instanceName = 'cluster_name';
export { instanceName };
