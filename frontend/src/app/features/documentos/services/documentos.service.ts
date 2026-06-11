import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, switchMap, map, of, take } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Documento, DocumentoUploadResponse } from '../models/documento.interface';
import { UsuariosService } from '../../usuarios/services/usuarios.service';

@Injectable({
    providedIn: 'root',
})
export class DocumentosService {
    private http = inject(HttpClient);
    private usuariosService = inject(UsuariosService);
    private baseUrl = environment.documentsApiUrl;

    list(): Observable<Documento[]> {
        return this.http
            .get<Documento[]>(this.baseUrl)
            .pipe(
                catchError(this.mapError),
                switchMap((docs) => {
                    if (!docs || docs.length === 0) return of([]);
                    return this.usuariosService.list().pipe(
                        take(1),
                        map((usuarios) => {
                            const userMap = new Map(usuarios.map(u => [u.id.toString(), u.nombre_usuario]));
                            return docs.map(doc => this.mapUsernames(doc, userMap));
                        }),
                        catchError(() => of(docs))
                    );
                })
            );
    }

    get(id: string): Observable<Documento> {
        return this.http
            .get<Documento>(`${this.baseUrl}/${id}`)
            .pipe(
                catchError(this.mapError),
                switchMap((doc) => {
                    if (!doc) return throwError(() => new Error('Documento no encontrado'));
                    return this.usuariosService.list().pipe(
                        take(1),
                        map((usuarios) => {
                            const userMap = new Map(usuarios.map(u => [u.id.toString(), u.nombre_usuario]));
                            return this.mapUsernames(doc, userMap);
                        }),
                        catchError(() => of(doc))
                    );
                })
            );
    }

    private mapUsernames(doc: Documento, userMap: Map<string, string>): Documento {
        return {
            ...doc,
            createdBy: userMap.get(doc.createdBy) || doc.createdBy,
            deletedBy: doc.deletedBy ? (userMap.get(doc.deletedBy) || doc.deletedBy) : doc.deletedBy,
            updateHistory: doc.updateHistory?.map(record => ({
                ...record,
                updatedBy: userMap.get(record.updatedBy) || record.updatedBy
            })) || []
        };
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

    updateFile(id: string, file: File): Observable<DocumentoUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http
            .put<DocumentoUploadResponse>(
                `${this.baseUrl}/${id}/upload`,
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
