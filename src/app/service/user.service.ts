import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config-service.service';
import { User } from '../models/User.model';
import { Observable } from 'rxjs';
import { ResetPassword } from '../models/ResetPassword.model';
import { UpdatePassword } from '../models/UpdatePassword.model';
import { ChangeRole } from '../models/ChangeRole.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  userEndPoint = '/user';

  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  createUser(user: User): Observable<any> {
    return this.http.post(
      `${this.configService.baseUrl}${this.userEndPoint}/save-user`,
      user
    );
  }

  changeUserRole(role: ChangeRole): Observable<any> {
    return this.http.post(
      `${this.configService.baseUrl}${this.userEndPoint}/change-role`,
      role
    );
  }

  getAllUser(): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.userEndPoint}/get-all-user`
    );
  }

  getAllUserFrequently(): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.userEndPoint}/get-user-frequently`
    );
  }

  getUserById(id: number): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.userEndPoint}/get-user/${id}`
    );
  }

  getUserProfil(): Observable<any> {
    return this.http.get(
      `${this.configService.baseUrl}${this.userEndPoint}/profil`
    );
  }

  uploadImageForUser(userId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file); // Ajoutez le fichier au FormData

    return this.http.post(
      `${this.configService.baseUrl}${this.userEndPoint}/${userId}/upload-image`,
      formData,
      { responseType: 'text' } // Indique que la réponse est une chaîne de caractères
    );
  }

  getUserImageUrl(userId: number): Observable<string> {
    return this.http.get(
      `${this.configService.baseUrl}${this.userEndPoint}/${userId}/image-url`,
      {
        responseType: 'text', // Indique que la réponse est une chaîne de caractères
      }
    );
  }

  resetPassword(resetPasword: ResetPassword): Observable<any> {
    return this.http.post(
      `${this.configService.baseUrl}${this.userEndPoint}/reset-password`,
      resetPasword
    );
  }

  updatePassword(updatePassword: UpdatePassword) {
    return this.http.post(
      `${this.configService.baseUrl}${this.userEndPoint}/update-password`,
      updatePassword
    );
  }

  updateUser(id: number, user: User): Observable<any> {
    return this.http.put(
      `${this.configService.baseUrl}${this.userEndPoint}/update-user/${id}`,
      user
    );
  }
}
