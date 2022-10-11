import { AttributeType } from '@theniledev/react';

const fields = [
  {
    name: 'name',
    label: 'Workload name',
    required: true,
  },
  {
    name: 'type',
    label: 'Workload type',
    required: true,
  },
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
];

const columns = ['name', 'type', 'datasetDB', 'cloud', 'status'];

const instanceName = 'workloadName';
export { instanceName, fields, columns };
