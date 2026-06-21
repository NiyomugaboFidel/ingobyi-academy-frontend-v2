import { apiRequest } from './client';

export type UploadSignature = {
  uploadUrl: string | null;
  signature: string | null;
  timestamp: number;
  apiKey: string;
  folder: string;
  cloudName: string;
};

export type UploadedFile = {
  url: string;
  mimeType: string;
  filename: string;
  size: number;
};

export function getMessagingUploadSignature(token: string) {
  return apiRequest<UploadSignature>('/uploads/messaging', { token, method: 'POST' });
}

export function getImageUploadSignature(token: string) {
  return apiRequest<UploadSignature>('/uploads/image', { token, method: 'POST' });
}

export function getDocumentUploadSignature(token: string) {
  return apiRequest<UploadSignature>('/uploads/document', { token, method: 'POST' });
}

async function uploadWithSignature(file: File, sig: UploadSignature): Promise<UploadedFile> {
  if (!sig.uploadUrl || !sig.signature) {
    throw new Error('Uploads are not configured.');
  }
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);
  const res = await fetch(sig.uploadUrl, { method: 'POST', body: form });
  const json = (await res.json()) as { secure_url?: string; error?: { message?: string } };
  if (!res.ok || !json.secure_url) throw new Error(json.error?.message ?? 'Upload failed');
  return {
    url: json.secure_url,
    mimeType: file.type || 'application/octet-stream',
    filename: file.name,
    size: file.size,
  };
}

export async function uploadImage(file: File, token: string) {
  const sig = await getImageUploadSignature(token);
  return uploadWithSignature(file, sig);
}

export async function uploadDocument(file: File, token: string) {
  const sig = await getDocumentUploadSignature(token);
  return uploadWithSignature(file, sig);
}

export async function uploadMessagingFile(file: File, token: string): Promise<UploadedFile> {
  const sig = await getMessagingUploadSignature(token);
  if (!sig.uploadUrl || !sig.signature) {
    throw new Error('File uploads are not configured. Contact your administrator.');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);

  const res = await fetch(sig.uploadUrl, { method: 'POST', body: form });
  const json = (await res.json()) as { secure_url?: string; error?: { message?: string } };
  if (!res.ok || !json.secure_url) {
    throw new Error(json.error?.message ?? 'Upload failed');
  }

  return {
    url: json.secure_url,
    mimeType: file.type || 'application/octet-stream',
    filename: file.name,
    size: file.size,
  };
}
