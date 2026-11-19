import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';

export async function uploadAttachment(folder: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<{ fileName: string }>(`${API_BASE_URL}/api/attachments/${folder}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.fileName;
}

export async function downloadAttachment(folder: string, fileName: string, displayName?: string) {
  const { data } = await api.get(`${API_BASE_URL}/api/attachments/${folder}/${fileName}`, { responseType: 'blob' });
  const url = URL.createObjectURL(data as Blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = displayName || fileName;
  link.click();
  URL.revokeObjectURL(url);
}
