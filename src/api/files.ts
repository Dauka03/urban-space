import { apiClient, authHeaders } from './client'

export interface UploadedFile {
  bucket: string
  objectName: string
  url: string
}

export const filesApi = {
  /** ADMIN: upload a single file (multipart field `file`) to storage. */
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<UploadedFile>('/api/files/upload', form, authHeaders())
  },
}
