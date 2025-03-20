import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Formation } from '../models/fomation.model';
import { Observable } from 'rxjs';
import { ConfigService } from './config-service.service';

@Injectable({
  providedIn: 'root',
})
export class FormationService {
  formationEndPoint = '/formation';

  private http = inject(HttpClient)
  private configService = inject(ConfigService);

  createFormation(formation: Formation): Observable<any> {
    return this.http.post(`${this.configService.baseUrl}${this.formationEndPoint}/save-formation`, formation);
  }

  getAllFormation(): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.formationEndPoint}/get-all-formation`);
  }

  getAllFormationFrequently(): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.formationEndPoint}/get-formation-frequently`);
  }

  getFormationById(id: number): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.formationEndPoint}/get-formation/${id}`);
  }

  getAllStudentByFormation(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.configService.baseUrl}${this.formationEndPoint}/get-all-student-formation/${id}`
    );
  }

  updateFormation(id: number, formation: Formation): Observable<any> {
    return this.http.put(`${this.configService.baseUrl}${this.formationEndPoint}/update-formation/${id}`, formation);
  }

  deleteFormation() {
    return this.http.delete(`${this.configService.baseUrl}${this.formationEndPoint}/delete-all-formation`);
  }

  deleteFormationById(id: number): Observable<any> {
    return this.http.delete(`${this.configService.baseUrl}${this.formationEndPoint}/delete-formation/${id}`);
  }

  // public uploadImage(image: File, formation: Formation): Observable<any> {
  //   const formData = new FormData();
  //   formData.append('image', image);
  //   return this.http.post<any>(
  //     `${this.baseUrl}/save-image/${formation.id}`,
  //     formData
  //   );
  // }

  // downloadImage(fileName: string): Observable<HttpResponse<Blob>> {
  //   const requestOptions: Object = {
  //     responseType: 'blob', // Spécifiez le type de réponse comme un blob
  //     observe: 'response', // Observez la réponse complète, y compris les en-têtes
  //   };

  //   const url = `${this.baseUrl}/donwload/${fileName}`;

  //   return this.http.get(url, requestOptions) as Observable<HttpResponse<Blob>>;
  // }
}
