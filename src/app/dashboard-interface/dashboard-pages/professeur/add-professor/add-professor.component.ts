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
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ProfessorService } from '../../../../service/professor.service';
import { MatSelectModule } from '@angular/material/select';

interface Sexe {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-add-professor',
  imports: [
    CommonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './add-professor.component.html',
  styleUrl: './add-professor.component.scss',
})
export class AddProfessorComponent {
  addProfessorForm: FormGroup;

  //Type de tuteur
  sexe: Sexe[] = [
    { value: 'HOMME', viewValue: 'Homme' },
    { value: 'FEMME', viewValue: 'Femme' },
  ];

  private ref = inject(MatDialogRef<AddProfessorComponent>);
  private builder = inject(FormBuilder);
  private professorService = inject(ProfessorService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.addProfessorForm = this.builder.group({
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
    this.addProfessorForm.invalid;
    this.addProfessorForm.reset();
    this.ref.close();
  }

  //Methode pour ajouter un professeur
  addProfessor() {
    if (this.addProfessorForm.valid) {
      this.spinner.show();
      this.professorService
        .CreateProfessor(this.addProfessorForm.value)
        .subscribe({
          next: () => {
            this.closePopup();
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.toastr.success('Professeur enregistré avec succès!');
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
      this.addProfessorForm.markAllAsTouched();
    }
  }
}
