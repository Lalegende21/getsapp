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
  selector: 'app-add-campus',
  imports: [
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-campus.component.html',
  styleUrl: './add-campus.component.scss',
})
export class AddCampusComponent {
  addCampusForm!: FormGroup;

  private ref = inject(MatDialogRef<AddCampusComponent>);
  private builder = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private campusService = inject(CampusService);

  constructor() {
    this.addCampusForm = this.builder.group({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      localisation: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
  }

  //Methode pour fermer le modal
  closePopup() {
    this.addCampusForm.reset();
    this.ref.close();
  }

  //Methode pour ajouter un campus
  addCampus() {
    if (this.addCampusForm.valid) {
      this.spinner.show();
      this.campusService.createCampus(this.addCampusForm.value).subscribe({
        next: () => {
          this.closePopup();
          setTimeout(() => {
            this.spinner.hide();
          }, 2000);
          this.toastr.success('Campus enregistré avec succès!');
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
      this.addCampusForm.markAllAsTouched();
    }
  }
}
