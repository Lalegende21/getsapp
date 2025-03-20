import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StartCourseService } from '../../../../../service/start-course.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { StartCourse } from '../../../../../models/startCourse.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cancel-start-course',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatCardModule],
  templateUrl: './cancel-start-course.component.html',
  styleUrl: './cancel-start-course.component.scss',
})
export class CancelStartCourseComponent {
  id: number = 0;
  startCourse!: StartCourse;

  private data = inject(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<CancelStartCourseComponent>);
  private builder = inject(FormBuilder);
  private startCourseService = inject(StartCourseService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.id = this.data.id;
    this.startCourse = this.data.startCourse;
  }

  closeModal() {
    this.ref.close();
  }

  cancelStartCourse() {
    this.spinner.show();
    this.startCourseService
      .cancelCourseStatut(this.id, this.startCourse)
      .subscribe({
        next: () => {
          setTimeout(() => {
            this.spinner.hide();
          }, 2000);
          this.toastr.success('Matière désactivée avec succès');
          this.closeModal();
        },
        error: (error) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 2000);
          this.toastr.error(error.error.message);
        },
      });
  }
}
