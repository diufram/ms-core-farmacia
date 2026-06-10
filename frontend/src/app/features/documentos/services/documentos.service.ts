import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Documento, DocumentoUploadResponse } from '../models/documento.interface';

@Injectable({
    providedIn: 'root',
})
export class DocumentosService {
    private http = inject(HttpClient);
    private baseUrl = environment.documentsApiUrl;

    list(): Observable<Documento[]> {
        return this.http
            .get<Documento[]>(this.baseUrl)
            .pipe(catchError(this.mapError));
    }

    get(id: string): Observable<Documento> {
        return this.http
            .get<Documento>(`${this.baseUrl}/${id}`)
            .pipe(catchError(this.mapError));
    }

    upload(file: File): Observable<DocumentoUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http
            .post<DocumentoUploadResponse>(
                `${this.baseUrl}/upload`,
                formData,
            )
            .pipe(catchError(this.mapError));
    }

    download(id: string): Observable<Blob> {
        return this.http
            .get(`${this.baseUrl}/${id}/download`, {
                responseType: 'blob',
            })
            .pipe(catchError(this.mapError));
    }

    delete(id: string): Observable<void> {
        return this.http
            .delete<void>(`${this.baseUrl}/${id}`)
            .pipe(catchError(this.mapError));
    }

    private mapError(err: HttpErrorResponse) {
        let message = 'Error en el servicio de documentos';

        if (typeof err.error === 'string' && err.error) {
            message = err.error;
        } else if (err.error?.message) {
            message = err.error.message;
        } else if (err.message) {
            message = err.message;
        }

        return throwError(() => new Error(message));
    }
}
