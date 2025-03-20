import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule, MatCardActions } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CampusService } from '../../../../service/campus.service';

@Component({
  selector: 'app-update-campus',
  imports: [
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  templateUrl: './update-campus.component.html',
  styleUrl: './update-campus.component.scss',
})
export class UpdateCampusComponent {
  updateCampusForm: FormGroup;
  id: number;
  name: string;
  localisation: string;

  private ref = inject(MatDialogRef<UpdateCampusComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private builder = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private campusService = inject(CampusService);

  constructor() {
    this.id = this.data.id;
    this.name = this.data.name;
    this.localisation = this.data.localisation;

    this.updateCampusForm = this.builder.group({
      id: new FormControl(this.data.id),
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      localisation: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
  }

  //Methode pour fermer le modal
  closePopup() {
    this.updateCampusForm.invalid;
    this.updateCampusForm.reset();
    this.ref.close();
  }

  //Methode pour modifier le campus
  UpdateCampus() {
    if (this.updateCampusForm.valid) {
      this.spinner.show();
      this.campusService
        .updateCampus(this.id, this.updateCampusForm.value)
        .subscribe({
          next: (response) => {
            this.closePopup();
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.toastr.success('Campus modifié avec succès!');
          },
          error: (error) => {
            this.closePopup();
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.toastr.error(error.error.message);
          },
        });
    } else {
      this.updateCampusForm.markAllAsTouched();
    }
  }
}
