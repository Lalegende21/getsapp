import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, Router, withRouterConfig } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { routes } from './app.routes';
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { AuthService } from './service/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Fonction pour charger les fichiers de traduction
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(), withInterceptors([AuthInterceptor])),
    provideAnimationsAsync(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    //Permet de recharger le composant même si la navigation cible est la même route
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
      BrowserModule,
      BrowserAnimationsModule,
      NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        progressBar: true,
        progressAnimation: 'decreasing',
        closeButton: true,
      })
    ),
    provideAnimationsAsync(),
  ],
};
