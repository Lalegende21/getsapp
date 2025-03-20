import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../../service/user.service';

interface Gender {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-update-profil',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    RouterModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './update-profil.component.html',
  styleUrl: './update-profil.component.scss',
})
export class UpdateProfilComponent {
  updateProfilForm: FormGroup;
  id: number = 0;
  firstname: string;
  lastname: string;
  phone: string;
  sexe: string;

  private ref = inject(MatDialogRef<UpdateProfilComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private userService = inject(UserService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);

  //Type de sexe
  gender: Gender[] = [
    { value: 'HOMME', viewValue: 'Homme' },
    { value: 'FEMME', viewValue: 'Femme' },
  ];

  constructor() {
    this.id = this.data.id;
    this.firstname = this.data.firstname;
    this.lastname = this.data.lastname;
    this.phone = this.data.phone;
    this.sexe = this.data.sexe;

    this.updateProfilForm = new FormGroup({
      id: new FormControl(this.id),
      firstname: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      sexe: new FormControl('', Validators.required),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*\d.*\d.*\d.*\d.*\d.*\d.*\d.*\d.*\d).{9,}$/),
      ]),
    });
  }

  close() {
    this.updateProfilForm.reset();
    this.ref.close();
  }

  updateProfil() {
    if (this.updateProfilForm.valid) {
      this.spinner.show();
      this.userService
        .updateUser(this.id, this.updateProfilForm.value)
        .subscribe({
          next: (response) => {
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.close();
            this.toastr.success('Utilisateur modifié avec succès!');
          },
          error: (error) => {
            console.log(error);
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.close();
            this.toastr.error(error.error.message);
          },
        });
    } else {
      this.updateProfilForm.markAllAsTouched();
    }
  }
}
