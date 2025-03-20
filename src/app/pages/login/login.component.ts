import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    NgxSpinnerModule,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  private router = inject(Router);
  private authService = inject(AuthService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  get isPasswordHidden() {
    return this.hide();
  }

  constructor() {
    this.loginForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
      password: new FormControl('', [Validators.required]),
    });
  }
  ngOnInit(): void {
    this.spinner.show();

    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }

  login() {
    if (this.loginForm.valid) {
      this.spinner.show();
      localStorage.clear();
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 500);
          const fullname = response.firstname + ' ' + response.lastname;
          // Si le backend renvoie un token JWT :
          localStorage.setItem('access_token', response.bearer);
          localStorage.setItem('refresh_token', response.refresh);
          localStorage.setItem('role', response.role);
          localStorage.setItem('fullname', fullname);
          this.toastr.success('Connexion reussie!');
          // Redirige vers la page d'accueil ou dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 500);
          this.toastr.error(error.error.message);
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
