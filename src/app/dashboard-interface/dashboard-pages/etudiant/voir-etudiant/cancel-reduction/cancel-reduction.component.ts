import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { StudentService } from '../../../../../service/student.service';

@Component({
  selector: 'app-cancel-reduction',
  imports: [],
  templateUrl: './cancel-reduction.component.html',
  styleUrl: './cancel-reduction.component.scss',
})
export class CancelReductionComponent {
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
  student: any;

  constructor() {
    this.id = this.data.id;
    this.firstname = this.data.firstname;
    this.lastname = this.data.lastname;
    this.specialite = this.data.formation;
    this.montantTotal = this.data.montantTotal;
    this.student = this.data.student;
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  cancelReduction() {
    this.spinner.show();
    this.studentService.cancelReduction(this.id).subscribe({
      next: () => {
        this.closeDialog();
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Reduction annulée avec succès!');
      },
      error: (error) => {
        console.log(error.error.message);
        this.closeDialog();
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.error(error.error.message);
      },
    });
  }
}
