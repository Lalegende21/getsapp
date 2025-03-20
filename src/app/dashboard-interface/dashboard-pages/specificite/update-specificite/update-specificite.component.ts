import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SpecificiteService } from '../../../../service/specificiteFormation.service';

@Component({
  selector: 'app-update-specificite',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './update-specificite.component.html',
  styleUrl: './update-specificite.component.scss',
})
export class UpdateSpecificiteComponent {
  updateCodeForm!: FormGroup;
  id: number;
  code: string;
  libelle: string;

  private dialog = inject(MatDialogRef<UpdateSpecificiteComponent>);
  private builder = inject(FormBuilder);
  private specificiteService = inject(SpecificiteService);
  private data = inject(MAT_DIALOG_DATA);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.id = this.data.id;
    this.code = this.data.code;
    this.libelle = this.data.libelle;

    this.updateCodeForm = this.builder.group({
      id: new FormControl(this.data.id),
      code: new FormControl('', [Validators.required, Validators.minLength(2)]),
      libelle: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
  }

  //Methode pour fermer le modal
  closePopup() {
    this.updateCodeForm.invalid;
    this.updateCodeForm.reset();
    this.dialog.close();
  }

  //Methode pour enregistrer une specificte de formation
  updateSpecificiteFormation() {
    if (this.updateCodeForm.valid) {
      this.spinner.show();
      this.specificiteService
        .updateSpecificite(this.id, this.updateCodeForm.value)
        .subscribe({
          next: () => {
            this.closePopup();
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.toastr.success('Spécificté modifiée avec succès!');
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
      this.updateCodeForm.markAllAsTouched();
    }
  }
}
