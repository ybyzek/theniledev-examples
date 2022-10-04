import { AttributeType } from '@theniledev/react';

/**
 * manually created from entity_definition.json
 */
const fields = [{ name: 'greeting', label: 'Greeting', required: true }];
export default fields;

const columns = ['greeting', 'status'];
export { columns };

const instanceName = 'greeting';
export { instanceName }; 
