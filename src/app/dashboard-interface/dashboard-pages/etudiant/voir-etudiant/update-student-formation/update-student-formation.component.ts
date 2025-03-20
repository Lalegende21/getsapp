import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatCardActions } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Formation } from '../../../../../models/fomation.model';
import { Center } from '../../../../../models/center.model';
import { Session } from '../../../../../models/session.model';
import { MatIconModule } from '@angular/material/icon';
import { CampusService } from '../../../../../service/campus.service';
import { FormationService } from '../../../../../service/formation.service';
import { SessionService } from '../../../../../service/session.service';
import { StudentService } from '../../../../../service/student.service';

interface Gender {
  value: string;
  viewValue: string;
}

interface Horaire {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-update-student-formation',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './update-student-formation.component.html',
  styleUrl: './update-student-formation.component.scss',
})
export class UpdateStudentFormationComponent {
  updateStudentFormationForm!: FormGroup;
  id: number = 0;
  horaires: Horaire;
  formation: Formation;
  // center: Center;
  session: Session;
  allFormation: Formation[] = [];
  allCenter: Center[] = [];
  allSession: Session[] = [];

  //Type de sexe
  gender: Gender[] = [
    { value: 'HOMME', viewValue: 'Homme' },
    { value: 'FEMME', viewValue: 'Femme' },
  ];

  //horaire de l'etudiant
  horaire: Horaire[] = [
    { value: 'JOUR', viewValue: 'Jour' },
    { value: 'SOIR', viewValue: 'Soir' },
    { value: 'PARTICULIER', viewValue: 'Particuier' },
  ];

  private ref = inject(MatDialogRef<UpdateStudentFormationComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private builder = inject(FormBuilder);
  private studentService = inject(StudentService);
  private formationService = inject(FormationService);
  private centerService = inject(CampusService);
  private sessionService = inject(SessionService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.id = this.data.id;
    this.horaires = this.data.horaire;
    this.formation = this.data.formation;
    // this.center = this.data.center;
    this.session = this.data.session;

    this.updateStudentFormationForm = this.builder.group({
      id: new FormControl(this.id),
      firstname: new FormControl(this.data.firstname),
      lastname: new FormControl(this.data.lastname),
      sexe: new FormControl(this.data.sexe),
      dob: new FormControl(this.data.dob),
      phonenumber: new FormControl(this.data.phone),
      horaire: new FormControl('', [Validators.required]),
      email: new FormControl(this.data.email),
      // center: new FormControl('', [Validators.required]),
      formation: new FormControl('', [Validators.required]),
      session: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    //On recupere toutes les formations
    this.getAllFormations();

    //On recupere tous les campus
    // this.getAllCampus();

    //On recupere toutes les sessions
    this.getAllSessions();
  }

  //Methode pour fermer le modal
  closePopup() {
    this.updateStudentFormationForm.invalid;
    this.updateStudentFormationForm.reset();
    this.ref.close();
  }

  getAllFormations() {
    this.formationService.getAllFormation().subscribe({
      next: (response) => {
        this.allFormation = response;
      },
      error: (error) => {
        console.error('Error:', error.error.message);
      },
    });
  }

  getAllSessions() {
    this.sessionService.getAllSession().subscribe({
      next: (response) => {
        this.allSession = response;
      },
      error: (error) => {
        console.error('Error:', error.error.message);
      },
    });
  }

  updateStudentFormation() {
    if (this.updateStudentFormationForm.valid) {
      this.spinner.show();
      this.studentService
        .updateStudentFormation(this.data.id, this.updateStudentFormationForm.value)
        .subscribe({
          next: () => {
            setTimeout(() => {
              this.closePopup();
              this.spinner.hide();
            }, 2000);
            this.toastr.success("Profil de l'étudiant modifié avec succès!");
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
      this.updateStudentFormationForm.markAllAsTouched();
    }
  }
}
