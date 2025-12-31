export interface CSVColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean;
}

export const downloadCSV = <T>(data: T[], columns: CSVColumn<T>[], filename: string) => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = columns.map(c => c.header).join(',');
  const rows = data.map(item => {
    return columns.map(c => {
      const val = c.accessor(item);
      const strVal = String(val !== undefined && val !== null ? val : '');
      // Escape quotes and wrap in quotes if contains comma, quote or newline
      if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
        return `"${strVal.replace(/"/g, '""')}"`;
      }
      return strVal;
    }).join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};