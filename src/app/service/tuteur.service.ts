import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { Tutor } from '../models/Tutor.models';
import { Observable } from 'rxjs';
import { Student } from '../models/Student.model';

@Injectable({
  providedIn: 'root',
})
export class TuteurService {
  tutorEndPoint = '/tutor';

  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  createTutor(tutor: Tutor): Observable<any> {
    return this.http.post(
      `${this.configService.baseUrl}${this.tutorEndPoint}/save-tutor`,
      tutor
    );
  }

  addStudentToTutor(id: number, student: Student): Observable<any> {
    return this.http.post(
      `${this.configService.baseUrl}${this.tutorEndPoint}/add-student-to-tutor/${id}`,
      student
    );
  }

  removeStudentToTutor(id: number, studentID: number): Observable<any> {
    return this.http.post(
      `${this.configService.baseUrl}${this.tutorEndPoint}/remove-student/${studentID}/to-tutor/${id}`, null
    );
  }

  getAllTutor(): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.tutorEndPoint}/get-all-tutor`);
  }

  getAllTutorFrequently(): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.tutorEndPoint}/get-tutor-frequently`);
  }

  getTutorById(id: number): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.tutorEndPoint}/get-tutor/${id}`);
  }

  getStudentbyTutor(id: number): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.tutorEndPoint}/get-all-student-tutor/${id}`);
  }

  updateTutor(id: number, tutor: Tutor): Observable<any> {
    return this.http.put(`${this.configService.baseUrl}${this.tutorEndPoint}/update-tutor/${id}`, tutor);
  }

  deleteTutor() {
    return this.http.delete(`${this.configService.baseUrl}${this.tutorEndPoint}/delete-all-tutor`);
  }

  deleteTutorById(id: number): Observable<any> {
    return this.http.delete(`${this.configService.baseUrl}${this.tutorEndPoint}/delete-tutor/${id}`);
  }

  uploadImageForTutor(tutorId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file); // Ajoutez le fichier au FormData

    return this.http.post(
      `${this.configService.baseUrl}${this.tutorEndPoint}/${tutorId}/upload-image`,
      formData,
      { responseType: 'text' } // Indique que la réponse est une chaîne de caractères
    );
  }

  getTutorImageUrl(tutorId: number): Observable<string> {
    return this.http.get(`${this.configService.baseUrl}${this.tutorEndPoint}/${tutorId}/image-url`, {
      responseType: 'text', // Indique que la réponse est une chaîne de caractères
    });
  }
}
