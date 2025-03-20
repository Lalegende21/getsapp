import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { UserService } from '../../service/user.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    RouterModule,
    NgxSpinnerModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  resetPasswordForm!: FormGroup;

  private userService = inject(UserService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  constructor() {
    this.resetPasswordForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
    });
  }

  confirm() {
    if (this.resetPasswordForm.valid) {
      const email = this.resetPasswordForm.value.email;
      this.spinner.show();
      this.userService.resetPassword(this.resetPasswordForm.value).subscribe({
        next: () => {
          setTimeout(() => {
            this.spinner.hide();
          }, 500);
          this.toastr.success('Demande traitée avec succès.');
          this.resetPasswordForm.reset();
          this.router.navigate(['code-activation']);
          localStorage.setItem('resetEmail', email);

        },
        error: (error) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 500);
          this.toastr.error(error.error.message);
        },
      });
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }
}
