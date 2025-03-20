import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-register',
  imports: [
    NgxSpinnerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  private spinner = inject(NgxSpinnerService);

  // afficher et cacher le mot de passe
  hide = signal(true);
  hideCmp = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  clickEventCmp(event: MouseEvent) {
    this.hideCmp.set(!this.hideCmp());
    event.stopPropagation();
  }

  constructor() {
    // Validator pour exiger un minimum de 8 caractères
    const minLengthValidator3 = Validators.minLength(3);

    // Validator pour exiger un minimum de 9 chiffres
    const nineDigitsValidator = Validators.pattern(
      /^(?=.*\d.*\d.*\d.*\d.*\d.*\d.*\d.*\d.*\d).{9,}$/
    );

    //Validator pour n'autoriser que des chiffres
    const onlyDigitsValidator = Validators.pattern(/^[0-9]*$/);

    //Validator pour valider un email
    const emailValidator = Validators.pattern(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    );

    // Validator pour exiger un minimum de 8 caractères
    const minLengthValidator = Validators.minLength(8);

    // Validator pour exiger au moins un caractère spécial
    const specialCharacterValidator = Validators.pattern(/[\W_]/);

    //Validator pour exiger au moins un chiffre
    const atLeastOneDigitValidator = Validators.pattern(/.*[0-9].*/);

    this.registerForm = new FormGroup(
      {
        firstname: new FormControl('', [
          Validators.required,
          minLengthValidator3,
        ]),
        lastname: new FormControl('', [
          Validators.required,
          minLengthValidator3,
        ]),
        phonenumber: new FormControl('', [
          Validators.required,
          nineDigitsValidator,
          onlyDigitsValidator,
        ]),
        email: new FormControl('', [
          Validators.required,
          Validators.email,
          emailValidator,
        ]),
        password: new FormControl('', [
          Validators.required,
          minLengthValidator,
          specialCharacterValidator,
          atLeastOneDigitValidator,
        ]),
        cmdp: new FormControl('', [Validators.required]),
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  ngOnInit(): void {
    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 3000);
  }

  //Methode pour verifier la correspondance des mots de passe
  passwordMatchValidator(control: AbstractControl) {
    return control.get('password')?.value === control.get('cmdp')?.value
      ? null
      : { mismatch: true };
  }

  register() {
    if (this.registerForm.valid) {
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
