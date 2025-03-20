import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../../../service/user.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

interface Gender {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-add-user',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
})
export class AddUserComponent {
  addUserForm!: FormGroup;
  gender: Gender[] = [
    { value: 'HOMME', viewValue: 'Homme' },
    { value: 'FEMME', viewValue: 'Femme' },
  ];

  private builder = inject(FormBuilder);
  private ref = inject(MatDialogRef<AddUserComponent>);
  private userService = inject(UserService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.addUserForm = this.builder.group({
      firstname: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      sexe: new FormControl('', [Validators.required]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
    });
  }

  closePopup() {
    this.addUserForm.reset();
    this.ref.close();
  }

  addUser() {
    if (this.addUserForm.valid) {
      this.spinner.show();
      this.userService.createUser(this.addUserForm.value).subscribe({
        next: () => {
          this.spinner.hide();
          setTimeout(() => {
            this.closePopup();
            this.toastr.success('Utilisateur crée avec succès!');
          }, 500);
        },
        error: (error) => {
          this.spinner.hide();
          setTimeout(() => {
            this.toastr.error(error.error.message);
          }, 500);
        },
      });
    }
  }
}
