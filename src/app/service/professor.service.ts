import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Professor } from '../models/Professor.model';
import { ConfigService } from './config-service.service';

@Injectable({
  providedIn: 'root',
})
export class ProfessorService {
  professorEndPoint = '/professor';

  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  CreateProfessor(professor: Professor): Observable<any> {
    return this.http.post(
      `${this.configService.baseUrl}${this.professorEndPoint}/save-professor`,
      professor
    );
  }

  searchProfessor(
    searchTerm: string,
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    return this.http.get<any>(
      `${this.configService.baseUrl}${this.professorEndPoint}/search?searchTerm=${searchTerm}&page=${page}&size=${size}`
    );
  }

  getAllProfessor(): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.professorEndPoint}/get-all-professor`
    );
  }

  GetAllProfessorFrequently(): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.professorEndPoint}/get-professor-frequently`
    );
  }

  getProfessorById(id: number): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.professorEndPoint}/get-professor/${id}`
    );
  }

  updateProfessor(id: number, professor: Professor): Observable<any> {
    return this.http.put(
      `${this.configService.baseUrl}${this.professorEndPoint}/update-professor/${id}`,
      professor
    );
  }

  deleteProfessor() {
    return this.http.delete(
      `${this.configService.baseUrl}${this.professorEndPoint}/delete-all-professor`
    );
  }

  deleteProfessorById(id: number): Observable<any> {
    return this.http.delete(
      `${this.configService.baseUrl}${this.professorEndPoint}/delete-professor/${id}`
    );
  }

  uploadImageForProfessor(professorId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file); // Ajoutez le fichier au FormData

    return this.http.post(
      `${this.configService.baseUrl}${this.professorEndPoint}/${professorId}/upload-image`,
      formData,
      { responseType: 'text' } // Indique que la réponse est une chaîne de caractères
    );
  }

  getProfessorImageUrl(professorId: number): Observable<string> {
    return this.http.get(
      `${this.configService.baseUrl}${this.professorEndPoint}/${professorId}/image-url`,
      {
        responseType: 'text', // Indique que la réponse est une chaîne de caractères
      }
    );
  }
}
