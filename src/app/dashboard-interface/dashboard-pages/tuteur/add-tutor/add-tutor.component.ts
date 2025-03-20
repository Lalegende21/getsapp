import { Component, Inject, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UpdateTutorComponent } from '../update-tutor/update-tutor.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
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
  selector: 'app-add-tutor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  standalone: true,
  templateUrl: './add-tutor.component.html',
  styleUrl: './add-tutor.component.scss',
})
export class AddTutorComponent {
  addTutorForm!: FormGroup;
  typeTutor: TypeTutor[] = [];

  private ref = inject(MatDialogRef<AddTutorComponent>);
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
    this.addTutorForm = new FormGroup({
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
    this.addTutorForm.reset();
    this.ref.close();
  }

  addTutor() {
    if (this.addTutorForm.valid) {
      this.spinner.show();
      this.tutorService.createTutor(this.addTutorForm.value).subscribe({
        next: () => {
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
          this.closePopup();
          this.toastr.success('Tuteur ajouté avec succès!');
        },
        error: (error) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
          this.toastr.error(error.error.message);
        },
      });
    } else {
      this.addTutorForm.markAllAsTouched();
    }
  }
}
