/**
 * Date Formatting Utility for Agri-Wise
 * Supports regional Indian & agricultural date formats (DD/MM/YYYY, DD MMM YYYY)
 */

export function formatDate(dateInput, format = 'readable') {
  if (!dateInput) return 'N/A';

  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      // If it's already a formatted string like 'DD/MM/YYYY' or 'YYYY-MM-DD', attempt to parse parts
      if (typeof dateInput === 'string' && dateInput.includes('-')) {
        const parts = dateInput.split('T')[0].split('-');
        if (parts.length === 3) {
          const year = parts[0];
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          const parsed = new Date(year, month, day);
          if (!isNaN(parsed.getTime())) {
            return formatParsedDate(parsed, format);
          }
        }
      }
      return String(dateInput);
    }
    return formatParsedDate(d, format);
  } catch {
    return String(dateInput);
  }
}

function formatParsedDate(d, format) {
  const day = String(d.getDate()).padStart(2, '0');
  const monthNum = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[d.getMonth()];

  if (format === 'numeric' || format === 'regional') {
    // Standard regional format: DD/MM/YYYY
    return `${day}/${monthNum}/${year}`;
  }

  if (format === 'datetime') {
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${monthName} ${year}, ${hours}:${minutes} ${ampm}`;
  }

  // Default 'readable': e.g. 18 Nov 2026
  return `${day} ${monthName} ${year}`;
}

/**
 * Returns today's date formatted as YYYY-MM-DD for standard HTML input[type="date"]
 */
export function getTodayInputDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safely parses any date string into YYYY-MM-DD for form date inputs
 */
export function toInputDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}
