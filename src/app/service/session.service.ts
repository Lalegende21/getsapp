import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Session } from '../models/session.model';
import { Observable } from 'rxjs';
import { ConfigService } from './config-service.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  sessionEndPoint = '/session';

  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  createSession(id:number, session: Session): Observable<Session> {
    return this.http.post<Session>(
      `${this.configService.baseUrl}${this.sessionEndPoint}/save-session/${id}`,
      session
    );
  }

  uploadImageForSession(sessionId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file); // Ajoutez le fichier au FormData

    return this.http.post(
      `${this.configService.baseUrl}${this.sessionEndPoint}/${sessionId}/upload-image`,
      formData,
      { responseType: 'text' } // Indique que la réponse est une chaîne de caractères
    );
  }

  getSessionImageUrl(sessionId: number): Observable<string> {
    return this.http.get(
      `${this.configService.baseUrl}${this.sessionEndPoint}/${sessionId}/image-url`,
      {
        responseType: 'text', // Indique que la réponse est une chaîne de caractères
      }
    );
  }

  getAllSession(): Observable<Session[]> {
    return this.http.get<Session[]>(
      `${this.configService.baseUrl}${this.sessionEndPoint}/get-all-session`
    );
  }

  searchSession(
    searchTerm: string,
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    return this.http.get<any>(
      `${this.configService.baseUrl}${this.sessionEndPoint}/search?searchTerm=${searchTerm}&page=${page}&size=${size}`
    );
  }

  getAllStudentBySession(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.configService.baseUrl}${this.sessionEndPoint}/get-all-student-session/${id}`
    );
  }

  getAllSessionFrequently(): Observable<Session[]> {
    return this.http.get<Session[]>(
      `${this.configService.baseUrl}${this.sessionEndPoint}/get-session-frequently`
    );
  }

  getSessionById(id: number): Observable<Session> {
    return this.http.get<Session>(
      `${this.configService.baseUrl}${this.sessionEndPoint}/get-session/${id}`
    );
  }

  updateSession(id: number, session: Session): Observable<Session> {
    return this.http.put<Session>(
      `${this.configService.baseUrl}${this.sessionEndPoint}/update-session/${id}`,
      session
    );
  }

  deleteAllSessions() {
    return this.http.delete(
      `${this.configService.baseUrl}${this.sessionEndPoint}/delete-all-session`
    );
  }

  deleteSessionById(id: number): Observable<any> {
    return this.http.delete(
      `${this.configService.baseUrl}${this.sessionEndPoint}/delete-session/${id}`
    );
  }
}
