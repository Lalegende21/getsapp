import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
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
import { MatSelectModule } from '@angular/material/select';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { StudentService } from '../../../../../service/student.service';

interface Gender {
  value: string;
  viewValue: string;
}

@Component({
    selector: 'app-update-student-profil',
    imports: [
      CommonModule,
      ReactiveFormsModule,
      MatCardModule,
      MatDatepickerModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './update-student-profil.component.html',
    styleUrl: './update-student-profil.component.scss'
})
export class UpdateStudentProfilComponent {
  updateProfilForm: FormGroup;
  id!: number;
  firstname!: string;
  lastname!: string;
  email!: string;
  phone!: string;
  sexe!: string;
  dob!: string;
  cni: any;

  //Type de sexe
  gender: Gender[] = [
    { value: 'HOMME', viewValue: 'Homme' },
    { value: 'FEMME', viewValue: 'Femme' },
  ];

  private ref = inject(MatDialogRef<UpdateStudentProfilComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private builder = inject(FormBuilder);
  private studentService = inject(StudentService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.id = this.data.id;
    this.firstname = this.data.firstname;
    this.lastname = this.data.lastname;
    this.email = this.data.email;
    this.phone = this.data.phone;
    this.sexe = this.data.sexe;
    this.cni = this.data.cni;
    this.dob = this.data.dob;

    this.updateProfilForm = this.builder.group({
      id: new FormControl(this.data.id),
      firstname: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      sexe: new FormControl('', [Validators.required]),
      dob: new FormControl(''),
      phonenumber: new FormControl('', [
        Validators.required,
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
      cni: new FormControl(''),
      formation: new FormControl(this.data.formation),
      center: new FormControl(this.data.center),
      session: new FormControl(this.data.session),
      horaire: new FormControl(this.data.horaire),
    });
  }

  closePopup() {
    this.updateProfilForm.invalid;
    this.updateProfilForm.reset();
    this.ref.close();
  }

  updateStudentStudent() {
    if (this.updateProfilForm.valid) {
      console.log(this.updateProfilForm.value);

      this.spinner.show();
      this.studentService
        .updateStudentProfil(this.id, this.updateProfilForm.value)
        .subscribe({
          next: () => {
            setTimeout(() => {
              this.closePopup();
              this.spinner.hide();
            }, 2000);
            this.toastr.success("Profil de l'étudiant modifié avec succès!");
          },
          error: (error) => {
            this.closePopup();
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.toastr.error(error.error.message);
          },
        });
    } else {
      this.updateProfilForm.markAllAsTouched();
    }
  }
}
