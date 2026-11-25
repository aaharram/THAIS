export const getUniqueOptions = <T, K extends keyof T>(
    data: T[],
    key: K,
    labelTransform?: (value: T[K]) => string
) => {
  return Array.from(new Set(data.map(item => item[key])).values())
      .filter(value => value !== null && value !== undefined)
      .map(value => {
        if (Array.isArray(value) && value.length > 0 && value[0].equipeId !== undefined) {
          return {
            label: labelTransform ? labelTransform(value) : String(value),
            value: value[0].equipeId, 
          };
        } else {
          return {
            label: labelTransform ? labelTransform(value) : String(value),
            value,
          };
        }
      });
};
