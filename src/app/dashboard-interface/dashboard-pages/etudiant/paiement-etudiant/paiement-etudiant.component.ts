import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ModalPaiementComponent } from './modal-paiement/modal-paiement.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Student } from '../../../../models/Student.model';
import { StudentService } from '../../../../service/student.service';
import { PaiementService } from '../../../../service/paiement.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Paiement } from '../../../../models/paiement.model';

interface TypePaiement {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-paiement-etudiant',
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './paiement-etudiant.component.html',
  styleUrl: './paiement-etudiant.component.scss',
})
export class PaiementEtudiantComponent {
  //Type de paiement
  typePaiement: TypePaiement[] = [
    { value: 'INSCRIPTION', viewValue: 'Inscription' },
    { value: 'FIRST_PAIEMENT', viewValue: '1ere tranche' },
    { value: 'SECOND_PAIEMENT', viewValue: '2e tranche' },
    { value: 'THIRD_PAIEMENT', viewValue: '3e tranche' },
    { value: 'OTHER', viewValue: 'Autres' },
  ];

  addPaiementForm: FormGroup;
  id: number;
  width: string | undefined;
  firstname: string;
  lastname: string;
  student: Student;

  private builder = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private ref = inject(MatDialogRef<PaiementEtudiantComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private paiementService = inject(PaiementService);
  private studentService = inject(StudentService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private breakPointObserver = inject(BreakpointObserver);

  constructor() {
    this.id = this.data.id;
    this.firstname = this.data.firstname;
    this.lastname = this.data.lastname;
    this.student = this.data.student;

    this.addPaiementForm = this.builder.group({
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
    this.addPaiementForm.reset();
    this.ref.close();
  }

  addPaiement() {
    if (this.addPaiementForm.valid) {
      console.log(this.addPaiementForm.value);

      //Confirmation du paiement avant enregistrement
      const dialogRef = this.dialog.open(ModalPaiementComponent, {
        enterAnimationDuration: '200ms',
        exitAnimationDuration: '200ms',
        data: {
          firstname: this.data.firstname,
          lastname: this.data.lastname,
          amount: this.addPaiementForm.value.amount,
          typePaiement: this.addPaiementForm.value.typePaiement,
        },
        width: this.width,
      });

      //nouvel objet paiement a envoye a l'api
      const paiementData = {
        amount: this.addPaiementForm.value.amount,
        typePaiement: this.addPaiementForm.value.typePaiement,
        student: { id: this.addPaiementForm.value.student.id },
      };

      this.closePopup();
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.spinner.show();
          this.paiementService
            .createPaiement(paiementData as Paiement)
            .subscribe({
              next: () => {
                setTimeout(() => {
                  this.spinner.hide();
                }, 2000);
                this.closePopup();
                this.toastr.success('Paiement enregistré avec succès!');
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
      this.addPaiementForm.markAllAsTouched();
    }
  }
}
