/**
 * Formats a number as currency, rounding up to the nearest whole number
 * @param {number|string} value - The value to format
 * @returns {string} Formatted currency string (e.g., "$353")
 */
export const formatPrice = (value) => {
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if the value is a valid number
  if (isNaN(numValue)) {
    console.warn('Invalid price value:', value);
    return '$0';
  }
  
  // Round up to the nearest whole number
  const roundedValue = Math.ceil(numValue);
  
  // Format as currency without decimal places
  return `$${roundedValue.toLocaleString('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  })}`;
};

/**
 * Rounds a number up to the nearest whole number
 * @param {number|string} value - The value to round up
 * @returns {number} Rounded up whole number
 */
export const roundUp = (value) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(numValue) ? 0 : Math.ceil(numValue);
};
