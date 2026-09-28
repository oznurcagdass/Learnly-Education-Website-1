import { customFetch } from '@workspace/api-client-react';

export interface UploadedResource {
  id: number;
  title: string;
  description: string;
  level: string;
  category: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedById: number;
  uploadedByName: string;
  createdAt: string;
}

export function listUploadedResources(): Promise<UploadedResource[]> {
  return customFetch<UploadedResource[]>('/api/resources', { responseType: 'json' });
}

export function uploadResource(input: {
  title: string;
  description: string;
  level: string;
  category: string;
  file: File;
}): Promise<UploadedResource> {
  const formData = new FormData();
  formData.append('title', input.title);
  formData.append('description', input.description);
  formData.append('level', input.level);
  formData.append('category', input.category);
  formData.append('file', input.file);

  // customFetch does not force a JSON content-type onto FormData bodies, so
  // the browser sets the correct multipart/form-data boundary itself.
  return customFetch<UploadedResource>('/api/resources', {
    method: 'POST',
    body: formData,
    responseType: 'json',
  });
}

// Anchor/download links can't go through customFetch (they're plain browser
// navigation), so the base URL is resolved the same way main.tsx resolves it
// for setBaseUrl — from VITE_API_BASE_URL, falling back to same-origin.
export function resourceFileUrl(id: number): string {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
  return `${base.replace(/\/+$/, '')}/api/resources/${id}/file`;
}
