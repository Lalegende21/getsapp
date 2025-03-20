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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SpecificiteFormation } from '../../../../models/Specificite.model';
import { FormationService } from '../../../../service/formation.service';
import { SpecificiteService } from '../../../../service/specificiteFormation.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-update-formations',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './update-formations.component.html',
  styleUrl: './update-formations.component.scss',
})
export class UpdateFormationsComponent implements OnInit {
  updateFormationForm!: FormGroup;
  specifictes: SpecificiteFormation[] = [];
  //Initialisation des donnees
  id!:number;
  specialite!: string;
  code!: string;
  periode!: string;
  price!: number;

  private ref = inject(MatDialogRef<UpdateFormationsComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private formationsService = inject(FormationService);
  private specificiteService = inject(SpecificiteService);
  private builder = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.id = this.data.id;
    this.specialite = this.data.specialite;
    this.code = this.data.code;
    this.periode = this.data.periode;
    this.price = this.data.price;

    this.updateFormationForm = this.builder.group({
      id: new FormControl(this.data.id),
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

  //Methode pour recuperer la liste des specialites
  getAllSpecificite() {
    this.specificiteService.getAllSpecificite().subscribe({
      next: (response) => {
        this.specifictes = response;
      },
      error: (error) => {
        console.log(error);
        this.toastr.error(error.error.message);
      },
    });
  }

  //Methode pour fermer le modal
  closePopup() {
    this.updateFormationForm.invalid;
    this.updateFormationForm.reset();
    this.ref.close();
  }

  updateFormation() {
    if (this.updateFormationForm.valid) {
      console.log(this.updateFormationForm.value);
      
      this.spinner.show();
      this.formationsService
        .updateFormation(this.id, this.updateFormationForm.value)
        .subscribe({
          next: (response) => {
            this.closePopup();
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            console.log(response);
            this.toastr.success('Formation modifiée avec succès!');
          },
          error: (error) => {
            this.closePopup();
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            console.log(error);
            this.toastr.error(error.error.message);
          },
        });
    } else {
      this.updateFormationForm.markAllAsTouched();
    }
  }
}
