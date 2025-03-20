import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AddMatiereComponent } from '../add-matiere/add-matiere.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Professor } from '../../../../models/Professor.model';
import { CourseService } from '../../../../service/course.service';

@Component({
  selector: 'app-update-matiere',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './update-matiere.component.html',
  styleUrl: './update-matiere.component.scss',
})
export class UpdateMatiereComponent {
  updateCourseForm!: FormGroup;
  professor: Professor[] = [];
  filteredProfessors: Professor[] = [];
  id: number;
  name: string;
  duree: number;

  private ref = inject(MatDialogRef<AddMatiereComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private courseService = inject(CourseService);
  private builder = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.id = this.data.id;
    this.name = this.data.name;
    this.duree = this.data.duree;

    this.updateCourseForm = this.builder.group({
      id: new FormControl(this.data.id),
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      duree: new FormControl('', [Validators.required]),
    });
  }

  //Methode pour fermer le modal
  closePopup() {
    this.updateCourseForm.reset();
    this.ref.close();
  }

  //Methode pour modifier une matiere
  updateCourse() {
    if (this.updateCourseForm.valid) {
      this.spinner.show();
      this.courseService
        .updateCourse(this.data.id, this.updateCourseForm.value)
        .subscribe({
          next: () => {
            this.closePopup();
            this.toastr.success('Matière modifiée avec succès!');
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
          },
          error: (error) => {
            this.closePopup();
            this.toastr.error(
              'Impossible de modifier la matière: ' + error.error.message
            );
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
          },
        });
    } else {
      this.updateCourseForm.markAllAsTouched();
    }
  }
}
