import { Component, inject, OnInit } from '@angular/core';
import { PaiementService } from '../../../../../service/paiement.service';
import { Paiement } from '../../../../../models/paiement.model';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Student } from '../../../../../models/Student.model';
import { StudentService } from '../../../../../service/student.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-cancel-paiement',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './cancel-paiement.component.html',
  styleUrl: './cancel-paiement.component.scss',
})
export class CancelPaiementComponent implements OnInit {
  cancelPaiementForm!: FormGroup;
  id: number = 0;
  paiements: Paiement[] = [];
  student!: Student;

  private paiementService = inject(PaiementService);
  private studentService = inject(StudentService);
  private builder = inject(FormBuilder);
  private data = inject(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<CancelPaiementComponent>);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);

  constructor() {
    this.id = this.data.id;
    this.cancelPaiementForm = this.builder.group({
      id: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.getAllPaiements();
  }

  getAllPaiements() {
    this.studentService.getStudentPaiement(this.id).subscribe({
      next: (data) => {
        this.paiements = data;
      },
      error: (error) => {
        this.toastr.error(error.error.message);
      },
    });
  }

  closePopup() {
    this.cancelPaiementForm.invalid;
    this.cancelPaiementForm.reset();
    this.ref.close();
  }

  cancelPaiement() {
    if (this.cancelPaiementForm.valid) {
      this.spinner.show();
      this.paiementService
        .cancelPaiement(this.cancelPaiementForm.value.id)
        .subscribe({
          next: () => {
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.toastr.success('Paiement annulé avec succès');
            this.getAllPaiements();
            this.closePopup();
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
}
