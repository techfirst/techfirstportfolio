let isAlertShown = false;

export const getFieldValue = (service: any, fieldName: string): string => {
  if (!service || !service[fieldName] || service[fieldName].value === undefined) {
    if (!isAlertShown) {
      isAlertShown = true;
      setTimeout(() => {
        alert(`Missing field: ${fieldName}`);
      }, 100);
    }
    return `[Missing ${fieldName}]`;
  }
  return service[fieldName].value;
};

export const getFieldType = (service: any, fieldName: string): string => {
  if (!service || !service[fieldName] || service[fieldName].type === undefined) {
    if (!isAlertShown) {
      isAlertShown = true;
      setTimeout(() => {
        alert(`Missing  field type: ${fieldName}`);
      }, 100);
    }
    return 'unknown';
  }
  return service[fieldName].type;
}; 