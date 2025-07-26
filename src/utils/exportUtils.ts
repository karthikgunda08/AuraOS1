// src/utils/exportUtils.ts

/**
 * Converts an array of objects into a CSV string and triggers a download.
 * @param data - The array of objects to export.
 * @param filename - The desired name for the downloaded CSV file.
 */
export const exportToCsv = (data: any[], filename: string): void => {
    if (!data || data.length === 0) {
        alert("No data to export.");
        return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add the header row
    csvRows.push(headers.join(','));

    // Helper function to format a cell value, handling commas and quotes
    const formatValue = (value: any): string => {
        if (value === null || value === undefined) {
            return '';
        }
        let stringValue = String(value);
        // If the value contains a comma, double quote, or newline, wrap it in double quotes
        if (stringValue.search(/("|,|\n)/g) >= 0) {
            stringValue = `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    // Add the data rows
    for (const row of data) {
        const values = headers.map(header => formatValue(row[header]));
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) { // Check for browser support
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};