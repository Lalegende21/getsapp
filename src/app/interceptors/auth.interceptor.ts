import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const spinner = inject(NgxSpinnerService);

  const token = localStorage.getItem('access_token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((err) => {
      if (err.status === 403) {
        spinner.show();
        setTimeout(() => {
          spinner.hide();
        }, 500);
        router.navigate(['login']);
        localStorage.clear();
        toastr.info('Vous avez été déconnecté, veuillez-vous reconnecter.');
      }

      return throwError(() => err);
    })
  );
};
