import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StudentService } from '../../../../service/student.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Student } from '../../../../models/Student.model';
import { PaiementService } from '../../../../service/paiement.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ModalPaiementComponent } from '../paiement-etudiant/modal-paiement/modal-paiement.component';
import { Paiement } from '../../../../models/paiement.model';

interface TypePaiement {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-update-paiement-student',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './update-paiement-student.component.html',
  styleUrl: './update-paiement-student.component.scss',
})
export class UpdatePaiementStudentComponent {
  //Type de paiement
  typePaiement: TypePaiement[] = [
    { value: 'INSCRIPTION', viewValue: 'Inscription' },
    { value: 'FIRST_PAIEMENT', viewValue: '1ere tranche' },
    { value: 'SECOND_PAIEMENT', viewValue: '2e tranche' },
    { value: 'THIRD_PAIEMENT', viewValue: '3e tranche' },
    { value: 'OTHER', viewValue: 'Autres' },
  ];

  updatePaiementForm: FormGroup;
  id: number;
  width: string | undefined;
  firstname: string;
  lastname: string;
  student: Student;

  private builder = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private ref = inject(MatDialogRef<UpdatePaiementStudentComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private paiementService = inject(PaiementService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private breakPointObserver = inject(BreakpointObserver);

  constructor() {
    this.id = this.data.id;
    this.firstname = this.data.student.firstname;
    this.lastname = this.data.student.lastname;
    this.student = this.data.student;

    this.updatePaiementForm = this.builder.group({
      student: new FormControl(this.student, Validators.required),
      amount: new FormControl('', [Validators.required]),
      typePaiement: new FormControl('', Validators.required),
    });

    this.breakPointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe((result) => {
        if (result.matches) {
          this.width = '30%';
        } else {
          this.width = '80%';
        }
      });
  }

  //Methode pour fermer le modal
  closePopup() {
    this.updatePaiementForm.reset();
    this.ref.close();
  }

  updatePaiement() {
    if (this.updatePaiementForm.valid) {
      console.log(this.updatePaiementForm.value);

      //Confirmation du paiement avant enregistrement
      const dialogRef = this.dialog.open(ModalPaiementComponent, {
        enterAnimationDuration: '200ms',
        exitAnimationDuration: '200ms',
        data: {
          firstname: this.data.student.firstname,
          lastname: this.data.student.lastname,
          amount: this.updatePaiementForm.value.amount,
          typePaiement: this.updatePaiementForm.value.typePaiement,
        },
        width: this.width,
      });

      //nouvel objet paiement a envoye a l'api
      const paiementData = {
        amount: this.updatePaiementForm.value.amount,
        typePaiement: this.updatePaiementForm.value.typePaiement,
        student: { id: this.updatePaiementForm.value.student.id },
      };

      this.closePopup();
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.spinner.show();
          this.paiementService
            .updatePaiement(this.id, paiementData as Paiement)
            .subscribe({
              next: (response) => {
                setTimeout(() => {
                  this.spinner.hide();
                }, 2000);
                this.closePopup();
                this.toastr.success('Paiement modifié avec succès!');
              },
              error: (error) => {
                setTimeout(() => {
                  this.spinner.hide();
                }, 2000);
                this.toastr.error(error.error.message);
              },
            });
        } else {
          this.closePopup();
        }
      });
    } else {
      this.updatePaiementForm.markAllAsTouched();
    }
  }
}
