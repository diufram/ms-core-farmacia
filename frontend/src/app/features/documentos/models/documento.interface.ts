export type DocumentoStatus = 'ACTIVE' | 'DELETED';

export interface DocumentoUpdateRecord {
  updatedBy: string;
  updatedAt: string;
}

export interface Documento {
  id: string;
  filename: string;
  s3Key: string;
  contentType: string;
  size: number;
  createdBy: string;
  createdAt: string;
  status: DocumentoStatus;
  updateHistory: DocumentoUpdateRecord[];
  deletedBy?: string;
  deletedAt?: string;
}

export interface DocumentoUploadResponse {
  id: string;
  filename: string;
  s3Key: string;
  contentType: string;
  size: number;
  createdBy: string;
  createdAt: string;
  status: DocumentoStatus;
}
