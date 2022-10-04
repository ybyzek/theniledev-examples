import { AttributeType } from '@theniledev/react';

/**
 * manually created from entity_definition.json
 */
const fields = [
  {
    name: 'accountType',
    label: 'Account Type',
    type: AttributeType.Select,
    required: true,
    defaultValue: 'checking',
    options: [
      { label: 'checking', value: 'checking' },
      { label: 'savings', value: 'savings' },
      { label: 'money management', value: 'money management' },
    ],
  },
  {
    name: 'firstName',
    label: 'First Name',
    required: true,
  },
  {
    name: 'lastName',
    label: 'Last Name',
    required: true,
  },
];
export default fields;

const columns = [
  'accountType',
  'accountID',
  'firstName',
  'lastName',
  'status'
];
export { columns };

const instanceName = 'accountID';
export { instanceName };
