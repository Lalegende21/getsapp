import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { Course } from '../../../../models/course.model';
import { Professor } from '../../../../models/Professor.model';
import { CourseService } from '../../../../service/course.service';
import { ProfessorService } from '../../../../service/professor.service';
import { SessionService } from '../../../../service/session.service';
import { StartCourseService } from '../../../../service/start-course.service';
import { StartCourseComponent } from '../start-course/start-course.component';
import { Session } from '../../../../models/session.model';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';

interface Horaire {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-update-start-course',
  imports: [
    CommonModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './update-start-course.component.html',
  styleUrl: './update-start-course.component.scss',
})
export class UpdateSTartCourseComponent {
  id: number = 0;
  isLinear = false;
  searchTermSession$ = new Subject<string>();
  searchTermCourse$ = new Subject<string>();
  searchTermProfessor$ = new Subject<string>();

  filteredSessions: Session[] = [];
  filteredCourse: Course[] = [];
  filteredProfessor: Professor[] = [];

  //horaire de l'etudiant
  horaire: Horaire[] = [
    { value: 'JOUR', viewValue: 'Jour' },
    { value: 'SOIR', viewValue: 'Soir' },
    { value: 'PARTICULIER', viewValue: 'Particuier' },
  ];

  private _formBuilder = inject(FormBuilder);
  private sessionService = inject(SessionService);
  private courseService = inject(CourseService);
  private professorService = inject(ProfessorService);
  private startCourseService = inject(StartCourseService);
  private ref = inject(MatDialogRef<StartCourseComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  firstFormGroup = this._formBuilder.group({
    session: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    course: ['', Validators.required],
  });
  thirdFormGroup = this._formBuilder.group({
    professor: ['', Validators.required],
  });
  fourthFormGroup = this._formBuilder.group({
    horaire: ['', Validators.required],
  });

  constructor() {
    this.id = this.data.id;

    // Gestion du flux de recherche
    this.searchTermSession$
      .pipe(
        debounceTime(300), // Évite les requêtes trop fréquentes
        distinctUntilChanged(), // Ignore les recherches répétées identiques
        switchMap((term) => this.sessionService.searchSession(term)) // Appelle l'API
      )
      .subscribe((response) => {
        this.filteredSessions = response.content; // Met à jour la liste affichée
      });

    this.searchTermCourse$
      .pipe(
        debounceTime(300), // Évite les requêtes trop fréquentes
        distinctUntilChanged(), // Ignore les recherches répétées identiques
        switchMap((term) => this.courseService.searchCourse(term)) // Appelle l'API
      )
      .subscribe((response) => {
        this.filteredCourse = response.content; // Met à jour la liste affichée
      });

    this.searchTermProfessor$
      .pipe(
        debounceTime(300), // Évite les requêtes trop fréquentes
        distinctUntilChanged(), // Ignore les recherches répétées identiques
        switchMap((term) => this.professorService.searchProfessor(term)) // Appelle l'API
      )
      .subscribe((response) => {
        this.filteredProfessor = response.content; // Met à jour la liste affichée
      });
  }

  onSearchSession(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.value) {
      this.searchTermSession$.next(inputElement.value);
    }
  }

  onSearchCourse(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.value) {
      this.searchTermCourse$.next(inputElement.value);
    }
  }

  onSearchProfessor(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.value) {
      this.searchTermProfessor$.next(inputElement.value);
    }
  }

  /** Vérifie si l'étape est complétée avant de passer à la suivante */
  isStepCompleted(index: number): boolean {
    switch (index) {
      case 0:
        return this.firstFormGroup.valid;
      case 1:
        return this.secondFormGroup.valid;
      case 2:
        return this.thirdFormGroup.valid;
      case 3:
        return this.fourthFormGroup.valid;
      default:
        return false;
    }
  }

  closeModal() {
    this.firstFormGroup.reset();
    this.secondFormGroup.reset();
    this.thirdFormGroup.reset();
    this.fourthFormGroup.reset();
    this.ref.close();
  }

  getAllFormData() {
    if (
      this.firstFormGroup.valid &&
      this.secondFormGroup.valid &&
      this.thirdFormGroup.valid &&
      this.fourthFormGroup.valid
    ) {
      this.spinner.show();
      const formData = {
        id: this.id,
        session: this.firstFormGroup.value.session,
        course: this.secondFormGroup.value.course
          ? this.secondFormGroup.value.course
          : null,
        professor: this.thirdFormGroup.value.professor,
        horaire: this.fourthFormGroup.value.horaire,
      };
      this.startCourseService.updateStartCourse(this.id, formData).subscribe({
        next: () => {
          this.closeModal();
          setTimeout(() => {
            this.spinner.hide();
          }, 2000);
          this.toastr.success('Matière modifiée avec succès!');
        },
        error: (error) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 2000);
          this.toastr.error(error.error.message);
        },
      });
    } else {
      this.closeModal();
      this.toastr.error('Veuillez remplir tous les champs correctement.');
    }
  }
}
