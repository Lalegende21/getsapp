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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SpecificiteService } from '../../../../service/specificiteFormation.service';

@Component({
  selector: 'app-add-specificite',
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: './add-specificite.component.html',
  styleUrl: './add-specificite.component.scss',
})
export class AddSpecificiteComponent {
  addCodeForm!: FormGroup;

  private dialog = inject(MatDialogRef<AddSpecificiteComponent>);
  private builder = inject(FormBuilder);
  private specificteFormation = inject(SpecificiteService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.addCodeForm = this.builder.group({
      code: new FormControl('', [Validators.required, Validators.minLength(2)]),
      libelle: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
  }

  //Methode pour fermer le modal
  closePopup() {
    this.addCodeForm.invalid;
    this.addCodeForm.reset();
    this.dialog.close();
  }

  //Methode pour enregistrer une specificte de formation
  addSpecificiteFormation() {
    if (this.addCodeForm.valid) {
      this.spinner.show();
      this.specificteFormation
        .CreateSpecificite(this.addCodeForm.value)
        .subscribe({
          next: () => {
            this.closePopup();
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.toastr.success('Spécificté enregistrée avec succès!');
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
      this.addCodeForm.markAllAsTouched();
    }
  }
}
