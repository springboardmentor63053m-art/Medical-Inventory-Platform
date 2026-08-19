import apiClient from '../../../../services/api/apiClient';

const triggerDownload = (response, fallbackFilename) => {
  const contentDisposition =
    response.headers['content-disposition'];

  const filenameMatch = contentDisposition?.match(
    /filename="?([^"]+)"?/
  );

  const filename =
    filenameMatch?.[1] || fallbackFilename;

  const blob = new Blob([response.data], {
    type: 'text/csv;charset=utf-8',
  });

  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = downloadUrl;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(downloadUrl);
};

export const reportsApi = {
  downloadInventoryReport: async () => {
    const response = await apiClient.get(
      '/reports/inventory.csv',
      {
        responseType: 'blob',
      }
    );

    const today = new Date().toISOString().slice(0, 10);

    triggerDownload(
      response,
      `medistock-inventory-${today}.csv`
    );
  },

  downloadExpiryReport: async (days = 30) => {
    const safeDays = Math.min(
      365,
      Math.max(1, Number(days) || 30)
    );

    const response = await apiClient.get(
      '/reports/expiry.csv',
      {
        params: { days: safeDays },
        responseType: 'blob',
      }
    );

    const today = new Date().toISOString().slice(0, 10);

    triggerDownload(
      response,
      `medistock-expiry-${safeDays}-days-${today}.csv`
    );
  },
};