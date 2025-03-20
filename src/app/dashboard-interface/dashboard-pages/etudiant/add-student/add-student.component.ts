import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Formation } from '../../../../models/fomation.model';
import { Center } from '../../../../models/center.model';
import { Session } from '../../../../models/session.model';
import { CampusService } from '../../../../service/campus.service';
import { SessionService } from '../../../../service/session.service';
import { StudentService } from '../../../../service/student.service';
import { FormationService } from '../../../../service/formation.service';
import { Student } from '../../../../models/Student.model';

interface Gender {
  value: string;
  viewValue: string;
}

interface Horaire {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-add-student',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.scss',
})
export class AddStudentComponent {
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

  //Validation du formulaire d'enregistrement des etudiants
  addStudentForm!: FormGroup;
  formation: Formation[] = [];
  center: Center[] = [];
  session: Session[] = [];

  private dialog = inject(MatDialog);
  private builder = inject(FormBuilder);
  private ref = inject(MatDialogRef<AddStudentComponent>);
  private studentService = inject(StudentService);
  private formationService = inject(FormationService);
  private centerService = inject(CampusService);
  private sessionService = inject(SessionService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.addStudentForm = this.builder.group({
      firstname: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      lastname: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      sexe: new FormControl('', [Validators.required]),
      dob: new FormControl(''),
      phonenumber: new FormControl('', [
        Validators.required,
        // Validators.pattern(/^(?=.*\d.*\d.*\d.*\d.*\d.*\d.*\d.*\d.*\d).{9,}$/),
        Validators.pattern(/^[0-9]*$/),
      ]),
      horaire: new FormControl('', [Validators.required]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
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
    this.addStudentForm.reset();
    this.ref.close();
  }

  getAllFormations() {
    this.formationService.getAllFormation().subscribe({
      next: (response) => {
        this.formation = response;
      },
    });
  }

  getAllSessions() {
    this.sessionService.getAllSession().subscribe({
      next: (response) => {
        this.session = response;
      },
    });
  }

  //Methode pour enregistrer le student
  addStudent() {
    if (this.addStudentForm.valid) {
      this.spinner.show();
      this.studentService.createStudent(this.addStudentForm.value).subscribe({
        next: () => {
          this.closePopup();
          setTimeout(() => {
            this.spinner.hide();
          }, 2000);
          this.toastr.success('Etudiant enregistré avec succès!');
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
      this.addStudentForm.markAllAsTouched();
    }
  }
}
