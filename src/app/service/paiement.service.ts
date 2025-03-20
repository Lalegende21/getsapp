import {
  HttpHeaders,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Paiement } from '../models/paiement.model';
import { ConfigService } from './config-service.service';

@Injectable({
  providedIn: 'root',
})
export class PaiementService {
  paiementEndPoint = '/paiement';

  private http = inject(HttpClient);
  private configService = inject(ConfigService)

  createPaiement(paiement: Paiement): Observable<any> {
    return this.http.post(`${this.configService.baseUrl}${this.paiementEndPoint}/save-paiement`, paiement);
  }

  getAllPaiement(): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.paiementEndPoint}/get-all-paiement`);
  }

  getAllPaiementFrequently(): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.paiementEndPoint}/get-paiement-frequently`);
  }

  getPaiementById(id: number): Observable<any> {
    return this.http.get(`${this.configService.baseUrl}${this.paiementEndPoint}/get-paiement/${id}`);
  }

  updatePaiement(id: number, paiement: Paiement): Observable<any> {
    return this.http.put(`${this.configService.baseUrl}${this.paiementEndPoint}/update-paiement/${id}`, paiement);
  }

  cancelPaiement(id:number) {
    return this.http.delete(`${this.configService.baseUrl}${this.paiementEndPoint}/cancel-paiement/${id}`)
  }

  deletePaiement() {
    return this.http.delete(`${this.configService.baseUrl}${this.paiementEndPoint}/delete-all-paiement`);
  }

  deletePaiementById(id: number): Observable<any> {
    return this.http.delete(`${this.configService.baseUrl}${this.paiementEndPoint}/delete-paiement/${id}`);
  }
}
