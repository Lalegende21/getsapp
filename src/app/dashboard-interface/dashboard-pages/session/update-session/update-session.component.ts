import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule, MatCardActions } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { AddSessionComponent } from '../add-session/add-session.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MatSelectModule } from '@angular/material/select';
import { SessionService } from '../../../../service/session.service';
import { Center } from '../../../../models/center.model';
import { CampusService } from '../../../../service/campus.service';

interface Statut {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-update-session',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './update-session.component.html',
  styleUrl: './update-session.component.scss',
})
export class UpdateSessionComponent implements OnInit {
  updateSessionForm!: FormGroup;
  dateDebut: string;
  statuts: string;
  id: number = 0;
  center: Center[] = [];

  private ref = inject(MatDialogRef<AddSessionComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private builder = inject(FormBuilder);
  private sessionService = inject(SessionService);
  private centerService = inject(CampusService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);

  //Type de tuteur
  statut: Statut[] = [
    { value: 'ACTIVE', viewValue: 'Active' },
    { value: 'PAUSE', viewValue: 'Pause' },
    { value: 'ANNULEE', viewValue: 'Annulée' },
    { value: 'COMPLETEE', viewValue: 'Terminée' },
  ];

  constructor() {
    this.dateDebut = this.data.dateDebut;
    this.statuts = this.data.statut;

    this.updateSessionForm = this.builder.group({
      id: new FormControl(this.data.id),
      dateDebut: new FormControl('', [Validators.required]),
      statuts: new FormControl('', [Validators.required]),
      center: new FormControl('', [Validators.required]),
    });
  }
  ngOnInit(): void {
    this.getAllCenter();
  }

  //Methode pour fermer le modal
  closePopup() {
    this.updateSessionForm.invalid;
    this.updateSessionForm.reset();
    this.ref.close();
  }

  getAllCenter() {
    this.centerService.getAllCenter().subscribe({
      next: (response) => {
        this.center = response;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  //Methode pour modifier une session
  updateSession() {
    if (this.updateSessionForm.valid) {
      this.spinner.show();
      this.sessionService
        .updateSession(this.data.id, this.updateSessionForm.value)
        .subscribe({
          next: (response) => {
            this.closePopup();
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            console.log(response);
            this.toastr.success('Session modifiée avec succès!');
          },
          error: (error) => {
            this.closePopup();
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.toastr.error(error.error.message);
            console.log(error);
          },
        });
    } else {
      this.updateSessionForm.markAllAsTouched();
    }
  }
}
