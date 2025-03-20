import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule, MatCardActions } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TuteurService } from '../../../../service/tuteur.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

interface TypeTutor {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-update-tutor',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  standalone: true,
  templateUrl: './update-tutor.component.html',
  styleUrl: './update-tutor.component.scss',
})
export class UpdateTutorComponent {
  updateTutorForm: FormGroup;
  typeTutor: TypeTutor[] = [];
  id: number;
  fullname: string;
  email: string;
  phonenumber: string;
  typeTutors: string;

  private data = inject(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<UpdateTutorComponent>);
  private tutorService = inject(TuteurService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  //Type de tuteur
  typeTuteur: TypeTutor[] = [
    { value: 'PARENT', viewValue: 'Parent' },
    { value: 'ONCLE', viewValue: 'Oncle' },
    { value: 'TANTE', viewValue: 'Tante' },
    { value: 'GRAND_PARENT', viewValue: 'Grand-parent' },
    { value: 'FRERE', viewValue: 'Frere' },
    { value: 'SOEUR', viewValue: 'Soeur' },
  ];

  constructor() {
    this.id = this.data.id;
    this.fullname = this.data.fullname;
    this.email = this.data.email;
    this.phonenumber = this.data.phonenumber;
    this.typeTutors = this.data.typeTutor;

    this.updateTutorForm = new FormGroup({
      id: new FormControl(this.id),
      fullname: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      email: new FormControl('', [
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
      phonenumber: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9]*$/),
      ]),
      typeTutor: new FormControl('', [Validators.required]),
      // student: new FormControl('', Validators.required),
    });
  }

  closePopup() {
    this.updateTutorForm.reset();
    this.ref.close();
  }
  updateTutor() {
    if (this.updateTutorForm.valid) {
      this.spinner.show();
      this.tutorService
        .updateTutor(this.id, this.updateTutorForm.value)
        .subscribe({
          next: () => {
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.closePopup();
            this.toastr.success('Tuteur modifié avec succès!');
          },
          error: (error) => {
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.toastr.error(error.error.message);
          },
        });
    } else {
      this.updateTutorForm.markAllAsTouched();
    }
  }
}
