export const normalizeExtractedDate = (value) => {
  if (!value || typeof value !== 'string') return '';

  // Remove non-date characters except separators
  const sanitized = value.trim().replace(/[^0-9/\-. ]/g, '');
  if (!sanitized) return '';

  const parts = sanitized.split(/[\/\-. ]+/).filter(Boolean);
  if (parts.length < 2) return '';

  let day;
  let month;
  let year;

  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // Format: YYYY-MM-DD
      [year, month, day] = parts;
    } else if (parts[2].length === 4) {
      // Format: DD-MM-YYYY
      [day, month, year] = parts;
    } else {
      // Assume DD-MM-YY
      [day, month] = parts;
      const twoDigitYear = Number(parts[2]);
      if (Number.isNaN(twoDigitYear)) return '';
      year = 2000 + twoDigitYear; // assume products are recent/future
    }
  } else if (parts.length === 2) {
    // Format: MM-YYYY or YYYY-MM
    if (parts[0].length === 4) {
      [year, month] = parts;
      day = '01';
    } else {
      [month, year] = parts;
      day = '01';
    }
  } else {
    return '';
  }

  day = day ?? '01';

  const dayNum = Number(day);
  const monthNum = Number(month);
  const yearNum = Number(year);

  if (
    Number.isNaN(dayNum) ||
    Number.isNaN(monthNum) ||
    Number.isNaN(yearNum) ||
    monthNum < 1 ||
    monthNum > 12 ||
    dayNum < 1 ||
    dayNum > 31
  ) {
    return '';
  }

  const date = new Date(yearNum, monthNum - 1, dayNum);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().split('T')[0];
};

