import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StudentService } from '../../../../../service/student.service';
import { TuteurService } from '../../../../../service/tuteur.service';
import { Student } from '../../../../../models/Student.model';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-student',
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.scss',
})
export class AddStudentComponent {
  addStudentToTutorForm!: FormGroup;
  id: number = 0;
  searchText: string = '';
  filteredStudents: Student[] = [];
  searchTerm$ = new Subject<string>();

  private dialog = inject(MatDialog);
  private data = inject(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<AddStudentComponent>);
  private studentService = inject(StudentService);
  private tutorService = inject(TuteurService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  constructor() {
    this.id = this.data.id;
    this.addStudentToTutorForm = new FormGroup({
      student: new FormControl('', Validators.required),
    });

    this.getAllStudent();

    // Gestion du flux de recherche
    this.searchTerm$
      .pipe(
        debounceTime(300), // Évite les requêtes trop fréquentes
        distinctUntilChanged(), // Ignore les recherches répétées identiques
        switchMap((term) => this.studentService.searchStudents(term)) // Appelle l'API
      )
      .subscribe((response) => {
        this.filteredStudents = response.content; // Met à jour la liste affichée
      });
  }

  onSearch(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.value) {
      this.searchTerm$.next(inputElement.value);
    }
  }

  getAllStudent() {
    this.studentService.getAllStudent().subscribe({
      next: (students) => {
        console.log(students);

        this.filteredStudents = students;
      },
      error: (error) => {
        // Vérifie si error.error existe
        if (!error.error) {
          this.toastr.error('Une erreur inattendue est survenue.');
          return;
        }

        // Récupère le message d'erreur
        const errorMessage = error.error.message;

        // Gestion des erreurs spécifiques
        if (!errorMessage) {
          this.toastr.error('Impossible de récupérer la liste des étudiants!');
        } else if (errorMessage === 'Access Denied') {
          this.toastr.error(
            "Vous n'êtes pas autorisé à consulter cette information."
          );
        } else {
          // Gestion des autres erreurs
          this.toastr.error(errorMessage || 'Une erreur est survenue.');
        }
      },
    });
  }

  //Methode pour fermer le modal
  closePopup() {
    this.addStudentToTutorForm.reset();
    this.ref.close();
  }

  //Methode pour ajouter un student au tutor
  addStudentToTutor() {
    if (this.addStudentToTutorForm.valid) {
      this.spinner.show();
      this.tutorService
        .addStudentToTutor(this.id, this.addStudentToTutorForm.value.student)
        .subscribe({
          next: () => {
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.closePopup();
            this.toastr.success('Enregistrement reussi...');
          },
          error: (error) => {
            setTimeout(() => {
              this.spinner.hide();
            }, 2000);
            this.closePopup();
            this.toastr.error(error.error.message);
          },
        });
    }
  }
}
