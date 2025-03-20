import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from './config-service.service';
import { StartCourseDto } from '../models/StartCourseDto.model';
import { StartCourse } from '../models/startCourse.model';

@Injectable({
  providedIn: 'root',
})
export class StartCourseService {
  startCourseEndPoint = '/startCourse';

  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  postStartCourse(startCourseDto: StartCourseDto): Observable<any> {
    return this.http.post(
      `${this.configService.baseUrl}${this.startCourseEndPoint}/handle-course-lifecycle`,
      startCourseDto
    );
  }

  getAllStartCourse(): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.startCourseEndPoint}/get-all-start-course`
    );
  }

  getAllStartCourseFrequently(): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.startCourseEndPoint}/get-start-course-frequently`
    );
  }

  getStartCourseById(id: number): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.startCourseEndPoint}/get-start-course/${id}`
    );
  }

  cancelCourseStatut(
    id: number,
    cancelStartCourse: StartCourse
  ): Observable<any> {
    return this.http.put(
      `${this.configService.baseUrl}${this.startCourseEndPoint}/cancel-statut-course/${id}`,
      cancelStartCourse
    );
  }

  updateStartCourse(
    id: number,
    startCourseDto: StartCourseDto
  ): Observable<any> {
    return this.http.put(
      `${this.configService.baseUrl}${this.startCourseEndPoint}/update-course-statut/${id}`,
      startCourseDto
    );
  }

  deleteStartCourseById(id: number): Observable<any> {
    return this.http.delete(
      `${this.configService.baseUrl}${this.startCourseEndPoint}/delete-start-course/${id}`
    );
  }

  deleteAllStartCourse(): Observable<any> {
    return this.http.delete(
      `${this.configService.baseUrl}${this.startCourseEndPoint}/delete-all-start-course`
    );
  }
}
