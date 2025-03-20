import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SpecificiteFormation } from '../../../../models/Specificite.model';
import { FormationService } from '../../../../service/formation.service';
import { SpecificiteService } from '../../../../service/specificiteFormation.service';

@Component({
  selector: 'app-add-formations',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
  ],
  templateUrl: './add-formations.component.html',
  styleUrl: './add-formations.component.scss',
})
export class AddFormationsComponent implements OnInit {
  addFormationForm: FormGroup;
  specifictes: SpecificiteFormation[] = [];

  private ref = inject(MatDialogRef<AddFormationsComponent>);
  private formationsService = inject(FormationService);
  private specificiteService = inject(SpecificiteService);
  private builder = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.addFormationForm = this.builder.group({
      specialite: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      periode: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required]),
      specificiteFormation: new FormControl('', [Validators.required]),
    });
  }
  ngOnInit(): void {
    this.getAllSpecificite();
  }

  getAllSpecificite() {
    this.specificiteService.getAllSpecificite().subscribe({
      next: (response) => {
        this.specifictes = response;
      },
      error: (error) => {
        this.toastr.error(error.error.message);
      },
    });
  }

  //Methode pour fermer le modal
  closePopup() {
    this.addFormationForm.invalid;
    this.addFormationForm.reset();
    this.ref.close();
  }

  addFormation() {
    if (this.addFormationForm.valid) {
      this.spinner.show();
      this.formationsService
        .createFormation(this.addFormationForm.value)
        .subscribe({
          next: () => {
            this.closePopup();
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.toastr.success('Formation enregistrée avec succès!');
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
      this.addFormationForm.markAllAsTouched();
    }
  }
}
