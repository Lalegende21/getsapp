import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import {
  MatDialogRef,
} from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from '../../../../service/session.service';
import { CampusService } from '../../../../service/campus.service';
import { Center } from '../../../../models/center.model';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-session',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
  ],
  templateUrl: './add-session.component.html',
  styleUrl: './add-session.component.scss',
})
export class AddSessionComponent implements OnInit {
  addSessionForm: FormGroup;
  center: Center[] = [];

  private ref = inject(MatDialogRef<AddSessionComponent>);
  private builder = inject(FormBuilder);
  private sessionService = inject(SessionService);
  private centerService = inject(CampusService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.addSessionForm = this.builder.group({
      dateDebut: new FormControl('', [Validators.required]),
      center: new FormControl('', [Validators.required]),
    });
  }
  ngOnInit(): void {
    this.getAllCenter();
  }

  //Methode pour fermer le modal
  closePopup() {
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

  //Methode pour ajouter une session
  addSession() {
    if (this.addSessionForm.valid) {
      this.spinner.show();
      this.sessionService
        .createSession(
          this.addSessionForm.value.center.id,
          this.addSessionForm.value
        )
        .subscribe({
          next: (response) => {
            this.closePopup();
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            console.log(response);
            this.toastr.success('Session enregistrée avec succès!');
          },
          error: (error) => {
            this.closePopup();
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            console.log(error);
          },
        });
    } else {
      this.addSessionForm.markAllAsTouched();
    }
  }
}
