import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Course } from '../models/course.model';
import { ConfigService } from './config-service.service';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  courseEndPoint = '/course';

  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  CreateCourse(course: Course): Observable<any> {
    return this.http.post(
      `${this.configService.baseUrl}${this.courseEndPoint}/save-course`,
      course
    );
  }

  searchCourse(
    searchTerm: string,
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    return this.http.get<any>(
      `${this.configService.baseUrl}${this.courseEndPoint}/search?searchTerm=${searchTerm}&page=${page}&size=${size}`
    );
  }

  getAllCourse(): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.courseEndPoint}/get-all-course`
    );
  }

  GetAllCourseFrequently(): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.courseEndPoint}/get-course-frequently`
    );
  }

  getCourseById(id: number): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.courseEndPoint}/get-course/${id}`
    );
  }

  startCourse(id: number, course: Course): Observable<any> {
    return this.http.post(
      `${this.configService.baseUrl}${this.courseEndPoint}/change-status/${id}`,
      course
    );
  }

  getCourseByName(name: string): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.courseEndPoint}/get-course/${name}`
    );
  }

  updateCourse(id: number, course: Course): Observable<any> {
    return this.http.put(
      `${this.configService.baseUrl}${this.courseEndPoint}/update-course/${id}`,
      course
    );
  }

  deleteCourse() {
    return this.http.delete(
      `${this.configService.baseUrl}${this.courseEndPoint}/delete-all-course`
    );
  }

  deleteCourseById(id: number): Observable<any> {
    return this.http.delete(
      `${this.configService.baseUrl}${this.courseEndPoint}/delete-course/${id}`
    );
  }

  uploadImageCourse(image: File, id: number): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<any>(
      `${this.configService.baseUrl}${this.courseEndPoint}/save-image/${id}`,
      formData
    );
  }

  getImageCourse(imageName: string): Observable<Blob> {
    return this.http.get(
      `${this.configService.baseUrl}${this.courseEndPoint}/${imageName}`,
      { responseType: 'blob' }
    );
  }
}
