/* eslint-disable @typescript-eslint/no-explicit-any */

export const getFieldValue = (service: any, fieldName: string): string | string[] => {
  const isArrayField = fieldName === 'Tags2' || 
                      Array.isArray(service?.[fieldName]?.value) || 
                      Array.isArray(service?.[fieldName]);

  if (!service || !service[fieldName]) {
    return isArrayField ? [`[MISSING FIELD ${fieldName}]`] : `[MISSING FIELD ${fieldName}]`;
  }

  const value = service[fieldName].value !== undefined 
    ? service[fieldName].value 
    : service[fieldName];

  if (isArrayField) {
    return Array.isArray(value) ? value : [];
  }

  return value;
};

export const getFieldType = (service: any, fieldName: string): string => {
  if (!service || !service[fieldName] || service[fieldName].type === undefined) {
    return 'unknown';
  }
  return service[fieldName].type;
}; 