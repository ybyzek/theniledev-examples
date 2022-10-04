import { AttributeType } from '@theniledev/react';

/**
 * manually created from entity_definition.json
 */
const fields = [
  { name: 'dbName', label: 'Database name', required: true },
  {
    name: 'cloud',
    label: 'Cloud provider',
    type: AttributeType.Select,
    required: true,
    defaultValue: 'aws',
    options: [
      { label: 'AWS', value: 'aws' },
      { label: 'GCP', value: 'gcp' },
      { label: 'Azure', value: 'azure' },
    ],
  },
  {
    name: 'environment',
    label: 'Environment',
    type: AttributeType.Select,
    defaultValue: 'test',
    options: [
      { label: 'Test', value: 'test' },
      { label: 'Development', value: 'dev' },
      { label: 'Production', value: 'prod' },
    ],
  },
  {
    name: 'size',
    label: 'Size',
    defaultValue: 100,
    type: AttributeType.Select,
    options: [
      { label: '100', value: 100 },
      { label: '400', value: 400 },
      { label: '800', value: 800 },
    ],
  },
];
export default fields;

const columns = [
  'dbName',
  'cloud',
  'environment',
  'size',
  'connection',
  'status',
];
export { columns };

const instanceName = 'dbName';
export { instanceName };
