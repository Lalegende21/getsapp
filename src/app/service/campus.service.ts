import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Center } from '../models/center.model';
import { ConfigService } from './config-service.service';

@Injectable({
  providedIn: 'root',
})
export class CampusService {
  campusEndPoint = '/center';

  private http = inject(HttpClient);
  private configService = inject(ConfigService)

  createCampus(center: Center): Observable<any> {
    return this.http.post(`${this.configService.baseUrl}${this.campusEndPoint}/save-center`, center);
  }

  getAllCenter(): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.campusEndPoint}/get-all-center`);
  }

  getAllCenterFrequently(): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.campusEndPoint}/get-center-frequently`);
  }

  getCampusById(id: number): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.campusEndPoint}/get-center/${id}`);
  }

  getCampusByName(name: string): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.campusEndPoint}/get-center/${name}`);
  }

  updateCampus(id: number, center: Center): Observable<any> {
    return this.http.put(`${this.configService.baseUrl}${this.campusEndPoint}/update-center/${id}`, center);
  }

  deleteCampus() {
    return this.http.delete(`${this.configService.baseUrl}${this.campusEndPoint}/delete-all-center`);
  }

  deleteCampusById(id: number): Observable<any> {
    return this.http.delete(`${this.configService.baseUrl}${this.campusEndPoint}/delete-center/${id}`);
  }

  uploadImageForCenter(professorId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file); // Ajoutez le fichier au FormData

    return this.http.post(
      `${this.configService.baseUrl}${this.campusEndPoint}/${professorId}/upload-image`,
      formData,
      { responseType: 'text' } // Indique que la réponse est une chaîne de caractères
    );
  }

  getCenterImageUrl(professorId: number): Observable<string> {
    return this.http.get(`${this.configService.baseUrl}${this.campusEndPoint}/${professorId}/image-url`, {
      responseType: 'text', // Indique que la réponse est une chaîne de caractères
    });
  }
}
