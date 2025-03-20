import {
  HttpClient,
  HttpResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Student } from '../models/Student.model';
import { Observable } from 'rxjs';
import { ConfigService } from './config-service.service';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  studentEndPoint = "/student";

  private http = inject(HttpClient)
  private configService = inject(ConfigService)

  getAllStudent(): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.studentEndPoint}/get-all-student`);
  }

  getAllStudentFrequently(): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.studentEndPoint}/get-student-frequently`);
  }

  getStudentPaiement(id: number): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.studentEndPoint}/paiements/${id}`);
  }

  getStudentById(id: number): Observable<any> {
    return this.http.get<Student>(`${this.configService.baseUrl}${this.studentEndPoint}/get-student/${id}`);
  }

  searchStudents(searchTerm: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.configService.baseUrl}${this.studentEndPoint}/search?searchTerm=${searchTerm}&page=${page}&size=${size}`);
  }

  applyReduction(id: number, amount: number): Observable<any> {
    return this.http.post(`${this.configService.baseUrl}${this.studentEndPoint}/get-reduction/${id}`, amount);
  }

  deleteStudentById(id: number): Observable<any> {
    return this.http.delete(`${this.configService.baseUrl}${this.studentEndPoint}/delete-student/${id}`);
  }

  deleteAllStudent(): Observable<any> {
    return this.http.delete(`${this.configService.baseUrl}${this.studentEndPoint}/delete-all-student`);
  }

  updateReduction(id: number, amount: number): Observable<any> {
    return this.http.put(`${this.configService.baseUrl}${this.studentEndPoint}/update-student-reduction/${id}`, amount);
  }

  cancelReduction(id: number): Observable<any> {
    return this.http.put(`${this.configService.baseUrl}${this.studentEndPoint}/cancel-reduction/${id}`, {});
  }

  updateStudent(id: number, data: Student): Observable<any> {
    return this.http.put(`${this.configService.baseUrl}${this.studentEndPoint}/update-student/${id}`, data);
  }

  updateStudentProfil(id: number, data: Student): Observable<any> {
    return this.http.put(`${this.configService.baseUrl}${this.studentEndPoint}/update-student-profil/${id}`, data);
  }

  updateStudentFormation(id: number, data: Student): Observable<any> {
    return this.http.put(`${this.configService.baseUrl}${this.studentEndPoint}/update-student-formation/${id}`, data);
  }

  createStudent(data: Student): Observable<any> {
    return this.http.post(`${this.configService.baseUrl}${this.studentEndPoint}/save-student`, data);
  }

  uploadImageForStudent(studentId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file); // Ajoutez le fichier au FormData

    return this.http.post(
      `${this.configService.baseUrl}${this.studentEndPoint}/${studentId}/upload-image`,
      formData,
      { responseType: 'text' } // Indique que la réponse est une chaîne de caractères
    );
  }

  getStudentImageUrl(studentId: number): Observable<string> {
    return this.http.get(`${this.configService.baseUrl}${this.studentEndPoint}/${studentId}/image-url`, {
      responseType: 'text', // Indique que la réponse est une chaîne de caractères
    });
  }
}
