import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ProfessorService } from '../../../../service/professor.service';

interface Sexe {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-update-professor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSelectModule,
  ],
  templateUrl: './update-professor.component.html',
  styleUrl: './update-professor.component.scss',
})
export class UpdateProfessorComponent {
  updateProfessorForm: FormGroup;
  id: number;
  fullname: string;
  phoneNumber: string;
  cni: string;
  email: string;
  sexe: string;

  //Type de tuteur
  sexes: Sexe[] = [
    { value: 'HOMME', viewValue: 'Homme' },
    { value: 'FEMME', viewValue: 'Femme' },
  ];

  private ref = inject(MatDialogRef<UpdateProfessorComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private builder = inject(FormBuilder);
  private professorService = inject(ProfessorService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.id = this.data.id;
    this.fullname = this.data.fullname;
    this.cni = this.data.cni;
    this.email = this.data.email;
    this.phoneNumber = this.data.phoneNumber;
    this.sexe = this.data.sexe;

    this.updateProfessorForm = this.builder.group({
      id: new FormControl(this.data.id),
      fullname: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      cni: new FormControl(''),
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9]*$/),
        Validators.pattern(/^(?=.*\d.*\d.*\d.*\d.*\d.*\d.*\d.*\d.*\d).{9,}$/),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
      sexe: new FormControl('', Validators.required),
    });
  }

  //Methode pour fermer le modal
  closePopup() {
    this.updateProfessorForm.invalid;
    this.updateProfessorForm.reset();
    this.ref.close();
  }

  //Methode pour modifier un professeur
  updateProfessor() {
    if (this.updateProfessorForm.valid) {
      this.spinner.show();
      this.professorService
        .updateProfessor(this.id, this.updateProfessorForm.value)
        .subscribe({
          next: () => {
            this.closePopup();
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.toastr.success('Professeur modifié avec succès!');
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
      this.updateProfessorForm.markAllAsTouched();
    }
  }
}
