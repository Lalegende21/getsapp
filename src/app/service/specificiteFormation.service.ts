import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { SpecificiteFormation } from '../models/Specificite.model';
import { ConfigService } from './config-service.service';

@Injectable({
  providedIn: 'root',
})
export class SpecificiteService {
  specificiteFormationEndPoint = '/specificite-formation';

  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  CreateSpecificite(specificite: SpecificiteFormation): Observable<any> {
    return this.http.post(
      `${this.configService.baseUrl}${this.specificiteFormationEndPoint}/save-specificite-formation`,
      specificite
    );
  }

  getAllSpecificite(): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.specificiteFormationEndPoint}/get-all-specificite-formation`
    );
  }

  getSpecificiteById(id: number): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.specificiteFormationEndPoint}/get-specificite-formation/${id}`
    );
  }

  updateSpecificite(
    id: number,
    specificite: SpecificiteFormation
  ): Observable<any> {
    return this.http.put(
      `${this.configService.baseUrl}${this.specificiteFormationEndPoint}/update-specificite-formation/${id}`,
      specificite
    );
  }

  deleteAllSpecificite() {
    return this.http.delete(
      `${this.configService.baseUrl}${this.specificiteFormationEndPoint}/delete-all-specificite-formation`
    );
  }

  deleteSpecificiteById(id: number): Observable<any> {
    return this.http.delete(
      `${this.configService.baseUrl}${this.specificiteFormationEndPoint}/delete-specificite-formation/${id}`
    );
  }
}
