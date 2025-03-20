import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { StudentService } from '../../../../../service/student.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-reduction',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
  ],
  templateUrl: './reduction.component.html',
  styleUrl: './reduction.component.scss',
})
export class ReductionComponent {
  reductionForm!: FormGroup;
  id!: number;
  firstname!: string;
  lastname!: string;
  specialite!: string;
  montantTotal!: number;

  private studentService = inject(StudentService);
  private dialog = inject(MatDialog);
  private data = inject(MAT_DIALOG_DATA);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.id = this.data.id;
    this.firstname = this.data.firstname;
    this.lastname = this.data.lastname;
    this.specialite = this.data.formation;
    this.montantTotal = this.data.montantTotal;

    this.reductionForm = new FormGroup({
      amount: new FormControl('', Validators.required),
    });
  }

  closeDialog() {
    this.reductionForm.invalid;
    this.reductionForm.reset();
    this.dialog.closeAll();
  }

  getReduction() {
    if (this.reductionForm.valid) {
      this.spinner.show();
      this.studentService
        .applyReduction(this.id, this.reductionForm.value)
        .subscribe({
          next: () => {
            this.closeDialog();
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.toastr.success('Reduction enregistrée avec succès!');
          },
          error: (error) => {
            this.closeDialog()
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.toastr.error(error.error.message);
          },
        });
    } else {
      this.reductionForm.markAllAsTouched();
    }
  }
}
