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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DureeCours } from '../../../../models/dureeCours.model';
import { Professor } from '../../../../models/Professor.model';
import { CourseService } from '../../../../service/course.service';

@Component({
  selector: 'app-add-matiere',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
  ],
  standalone: true,
  templateUrl: './add-matiere.component.html',
  styleUrl: './add-matiere.component.scss',
})
export class AddMatiereComponent {
  addCourseForm!: FormGroup;
  professor: Professor[] = [];
  filteredProfessors: Professor[] = [];
  id: number | undefined;

  private ref = inject(MatDialogRef<AddMatiereComponent>);
  private courseService = inject(CourseService);
  private builder = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.addCourseForm = this.builder.group({
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      duree: new FormControl('', [Validators.required]),
    });
  }

  //Methode pour fermer le modal
  closePopup() {
    this.ref.close();
  }

  //Methode pour enregistrer une matiere
  addCourse() {
    if (this.addCourseForm.valid) {
      this.spinner.show();
      this.courseService.CreateCourse(this.addCourseForm.value).subscribe({
        next: () => {
          this.closePopup();
          this.toastr.success('Matière enregistrée avec succès!');
          setTimeout(() => {
            this.spinner.hide();
          }, 2000);
        },
        error: (error) => {
          this.closePopup();
          this.toastr.error(error.error.message);
          setTimeout(() => {
            this.spinner.hide();
          }, 2000);
        },
      });
    } else {
      this.addCourseForm.markAllAsTouched();
    }
  }
}
