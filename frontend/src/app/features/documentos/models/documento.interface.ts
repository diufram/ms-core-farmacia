export type DocumentoStatus = 'ACTIVE' | 'DELETED';

export interface Documento {
    id: string;
    filename: string;
    s3Key: string;
    contentType: string;
    size: number;
    uploadedBy: string;
    uploadedAt: string;
    status: DocumentoStatus;
}

export interface DocumentoUploadResponse {
    id: string;
    filename: string;
    s3Key: string;
    contentType: string;
    size: number;
    uploadedBy: string;
    uploadedAt: string;
    status: DocumentoStatus;
}
