/**
 * Utility helper functions for formatting IDR currency, dates, export CSV & PDF receipt generation
 */

export const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export const formatIDR = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(num);
};

export const formatDateID = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
};

export const formatDateWithDayName = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const dayName = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(date).toUpperCase();
  const dayNum = date.getDate();
  const monthName = monthNames[date.getMonth()].toUpperCase();
  return `${dayName}, ${dayNum} ${monthName}`;
};

export const exportToCSV = (filename, dataRows, headers) => {
  if (!dataRows || !dataRows.length) return;
  
  // Use semicolon ';' delimiter which is standard for Microsoft Excel on Windows (Indonesian Locale)
  const delimiter = ";";
  
  // UTF-8 BOM (\uFEFF) ensures Excel properly decodes character set & emojis
  let csvString = "\uFEFF";
  
  if (headers && headers.length) {
    csvString += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(delimiter) + "\r\n";
  }
  
  dataRows.forEach(row => {
    const rowStr = row.map(val => {
      const cell = val === null || val === undefined ? "" : String(val);
      return `"${cell.replace(/"/g, '""')}"`;
    }).join(delimiter);
    csvString += rowStr + "\r\n";
  });

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
