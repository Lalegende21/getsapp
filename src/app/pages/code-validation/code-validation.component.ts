import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-code-validation',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    RouterModule,
    NgxSpinnerModule,
  ],
  templateUrl: './code-validation.component.html',
  styleUrl: './code-validation.component.scss',
})
export class CodeValidationComponent {
  codeActivationForm!: FormGroup;
  email: any;

  private userService = inject(UserService);
  private activatedRoute = inject(ActivatedRoute);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  constructor() {
    this.email = localStorage.getItem('resetEmail');
    localStorage.removeItem('resetEmail');

    this.codeActivationForm = new FormGroup({
      email: new FormControl(this.email),
      code: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d{6}$/),
        Validators.pattern(/^[0-9]*$/),
      ]),
      password: new FormControl('', [Validators.required]),
    });
  }

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  get isPasswordHidden() {
    return this.hide();
  }

  confirm() {
    if (this.codeActivationForm.valid) {
      this.spinner.show();
      this.userService.updatePassword(this.codeActivationForm.value).subscribe({
        next: () => {
          setTimeout(() => {
            this.spinner.hide();
          }, 500);
          this.toastr.success('Mot de passe modifié avec succès');
          this.codeActivationForm.reset();
          this.router.navigate(['login']);
        },
        error: (error) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 500);
          this.toastr.error(error.error.message);
        },
      });
    } else {
      this.codeActivationForm.markAllAsTouched();
    }
  }
}
