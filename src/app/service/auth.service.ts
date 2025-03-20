import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userEndPoint = '/user';

  private router = inject(Router);
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  // 🔑 Login : récupère les tokens depuis le backend
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http
      .post<any>(
        `${this.configService.baseUrl}${this.userEndPoint}/connexion`,
        credentials
      )
      .pipe(
        tap((res) => {
          if (res && res.access_token) {
            this.saveTokens(res.access_token, res.refresh_token);
          }
        }),
        // catchError(this.handleError)
      );
  }

  // ✅ Vérifie si l'utilisateur est connecté (présence + validité du token)
  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token && !this.isTokenExpired(token);
  }

  // ➕ Méthode utilitaire : sauvegarde les tokens
  private saveTokens(access_token: string, refresh_token?: string): void {
    localStorage.setItem('access_token', access_token);
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token);
    }
  }

  // ➕ Méthode utilitaire : vérifie l'expiration du token
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp; // exp en secondes
      const now = Math.floor(Date.now() / 1000);
      return now > expiry;
    } catch (error) {
      return true;
    }
  }

  logout() {
    this.spinner.show();
    this.http
      .post(`${this.configService.baseUrl}${this.userEndPoint}/logout`, {})
      .subscribe({
        next: () => {
          this.spinner.hide();
          setTimeout(() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.clear();
            this.router.navigate(['/login']);
            this.toastr.success('Deconnexion reussie !');
          });
        },
        error: (error) => {
          this.spinner.hide();
          setTimeout(() => {
            this.toastr.error(error.error.message);
            console.error('Erreur lors de la déconnexion :', error);
          });
        },
      });
  }

  // 🔥 Gestion centralisée des erreurs HTTP
  // private handleError(error: HttpErrorResponse) {
  //   let message = 'Une erreur inconnue est survenue.';

  //   if (error.error instanceof ErrorEvent) {
  //     message = `Erreur côté client : ${error.error.message}`;
  //   } else {
  //     message = `Erreur côté serveur : ${error.status} - ${error.message}`;
  //   }

  //   this.toastr.error(message);
  //   console.error(message);
  //   return throwError(() => new Error(message));
  // }
}
