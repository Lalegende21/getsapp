import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  NgZone,
  OnInit,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { AddStudentComponent } from './add-student/add-student.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PaiementEtudiantComponent } from './paiement-etudiant/paiement-etudiant.component';
import { AddButttonComponent } from '../../../components/add-buttton/add-buttton.component';
import { Student } from '../../../models/Student.model';
import { StudentService } from '../../../service/student.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-etudiant',
  imports: [CommonModule, MatIconModule, AddButttonComponent],
  templateUrl: './etudiant.component.html',
  styleUrl: './etudiant.component.scss',
  animations: [
    trigger('pageTransition', [
      state('enter', style({ opacity: 1, transform: 'translateX(0)' })),
      state('leave', style({ opacity: 0, transform: 'translateX(-100%)' })),
      transition('leave => enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms ease-out'),
      ]),
      transition('enter => leave', [
        animate(
          '300ms ease-in',
          style({ opacity: 0, transform: 'translateX(-100%)' })
        ),
      ]),
    ]),
  ],
})
export class EtudiantComponent implements OnInit {
  isModalVisible: boolean[] = [];
  width!: string;
  lastStudent!: Student;
  lastStudentRecently!: Student;
  lastStudentMale!: Student;
  lastStudentFeMale!: Student;
  students: Student[] = [];
  studentTotal: number = 0;
  studentsFrequently: Student[] = [];
  studentsFrequentlyTotal: number = 0;

  currentPage: number = 1;
  pageSize: number = 5;
  currentPageState = 'enter';
  filteredStudent: Array<Student> = [];
  currentVisibleData: any[] = [];
  hommeTotal: number = 0;
  femmeTotal: number = 0;

  role: string | null;

  private route = inject(Router);
  private dialog = inject(MatDialog);
  private breakPointObserver = inject(BreakpointObserver);
  private studentService = inject(StudentService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private cdk = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  constructor() {
    this.role = localStorage.getItem('role');
  }

  ngOnInit(): void {
    this.breakPointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe((result) => {
        if (result.matches) {
          this.width = '30%';
        } else {
          this.width = '80%';
        }
      });

    this.getAllStudent();
    this.getAllStudentFrequently();
    this.pageNumbers();

    setTimeout(() => {
      this.visibleData();
      this.initializeModalVisibility();
    }, 500);
  }

  initializeModalVisibility() {
    this.isModalVisible = Array(this.students.length).fill(false);
  }

  toggleModal(index: number, event: Event) {
    event.stopPropagation();
    this.isModalVisible = this.isModalVisible.map((visible, i) =>
      i === index ? !visible : false
    );
  }

  onOptionSelected(index: number, event: Event) {
    event.stopPropagation(); // Empêche la propagation du clic
    this.isModalVisible[index] = false; // Ferme le modal correspondant
    console.log('Option sélectionnée dans le modal', index);
  }

  onOptionSelectedDelete(index: number, event: Event, id: number) {
    event.stopPropagation(); // Empêche la propagation du clic
    this.isModalVisible[index] = false; // Ferme le modal correspondant
    console.log('Option sélectionnée dans le modal', index);

    //Methode pour supprimer le campus
    this.spinner.show();
    this.studentService.deleteStudentById(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Etudiant supprimé avec succès!');
        this.ngZone.run(() => {
          this.getAllStudent();
          this.initializeModalVisibility();
        });
        this.cdk.detectChanges();
      },
      error: (error) => {
        console.log(error);
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.error(error.error.message);
      },
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Fermez tous les modals si le clic est en dehors d'un modal et d'un bouton
    if (!target.closest('.modal') && !target.closest('.more-icon')) {
      this.isModalVisible.fill(false);
    }
  }

  /*******************start pagination ***************************/
  // Mise à jour des données visibles avec animation
  changePageWithAnimation(pageNumber: number) {
    this.currentPageState = 'leave';
    setTimeout(() => {
      this.currentPage = pageNumber;
      // this.updateVisibleData();
      this.visibleData();
      this.currentPageState = 'enter';
    }, 300); // Correspond à la durée de l'animation
  }

  visibleData() {
    let startIndex = (this.currentPage - 1) * this.pageSize;
    let endIndex = startIndex + this.pageSize;
    this.currentVisibleData = this.filteredStudent.slice(startIndex, endIndex);
  }

  nextPage() {
    const totalPages = Math.ceil(this.filteredStudent.length / this.pageSize);
    if (this.currentPage < totalPages) {
      this.changePageWithAnimation(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.changePageWithAnimation(this.currentPage - 1);
    }
  }

  pageNumbers() {
    const totalPages = Math.ceil(this.filteredStudent.length / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(pageNumber: number) {
    if (
      pageNumber >= 1 &&
      pageNumber <= Math.ceil(this.filteredStudent.length / this.pageSize)
    ) {
      this.currentPage = pageNumber;
      this.visibleData();
    }
  }

  //Recherche par nom d'etudiant
  filterByName(searchItem: string) {
    this.filteredStudent = this.students.filter((item) => {
      const fullname = item.firstname + ' ' + item.lastname;
      return fullname?.toLowerCase().includes(searchItem.toLowerCase());
    });
    this.visibleData(); // Met à jour les données visibles pour la pagination
  }

  //Recherche par matricule
  filterByMatricule(searchItem: string) {
    this.filteredStudent = this.students.filter((item) => {
      return item.matricule?.toLowerCase().includes(searchItem.toLowerCase());
    });
    this.visibleData(); // Met à jour les données visibles pour la pagination
  }
  /*******************end pagination ***************************/

  /*******************start sorting functionality ***************************/
  sortColumn: string = ''; // Colonne active pour le tri
  sortDirection: 'asc' | 'desc' = 'asc'; // Direction du tri

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredStudent.sort((a, b) => {
      const valueA = a[column as keyof Student] as any;
      const valueB = b[column as keyof Student] as any;

      if (valueA == null || valueB == null) {
        return 0; // Ignore null/undefined values
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }

      if (valueA instanceof Date && valueB instanceof Date) {
        return this.sortDirection === 'asc'
          ? valueA.getTime() - valueB.getTime()
          : valueB.getTime() - valueA.getTime();
      }

      return 0; // Ignore les autres types
    });

    this.visibleData(); // Met à jour les données visibles
  }

  getSortIcon(column: string): string {
    if (this.sortColumn === column) {
      return this.sortDirection === 'asc' ? 'arrow-up' : 'arrow-down';
    }
    return 'arrow-neutral';
  }

  /*******************end sorting functionality ***************************/

  consulterEtudiant(id: number) {
    this.route.navigateByUrl('/dashboard/etudiant/' + id);
  }

  //Methode pour enregistrer un etudiant
  getAllStudent() {
    this.studentService.getAllStudent().subscribe({
      next: (response) => {
        this.students = response;
        this.studentTotal = response.length;
        this.filteredStudent = response;
        this.lastStudent = response[0];
        this.visibleData();
        // Compter le nombre d'étudiants de chaque sexe
        this.hommeTotal = response.filter(
          (student: { sexe: string }) => student.sexe === 'HOMME'
        ).length;
        const hommesTotal = response.filter(
          (student: { sexe: string }) => student.sexe === 'HOMME'
        );
        this.lastStudentMale = hommesTotal[hommesTotal.length - 1];

        this.femmeTotal = response.filter(
          (student: { sexe: string }) => student.sexe === 'FEMME'
        ).length;
        const femmesTotal = response.filter(
          (student: { sexe: string }) => student.sexe === 'FEMME'
        );

        this.lastStudentFeMale = femmesTotal[femmesTotal.length - 1];

        this.initializeModalVisibility();
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

  getAllStudentFrequently() {
    this.studentService.getAllStudentFrequently().subscribe({
      next: (response) => {
        this.studentsFrequently = response;
        this.studentsFrequentlyTotal = this.studentsFrequently.length;
        this.lastStudentRecently = response[0];
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
          this.toastr.error(
            'Impossible de récupérer la liste des étudiants ajoutés recemment!'
          );
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

  addStudent() {
    this.dialog
      .open(AddStudentComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
      })
      .afterClosed()
      .subscribe(() => {
        this.ngZone.run(() => {
          this.getAllStudent();
          this.initializeModalVisibility();
        });
        this.cdk.detectChanges();
      });
  }

  paiementEtudiant(id: number, firstname: string, lastname: string) {
    this.dialog
      .open(PaiementEtudiantComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: { id, firstname, lastname },
      })
      .afterClosed()
      .subscribe(() => {
        this.ngZone.run(() => {
          this.getAllStudent();
          this.initializeModalVisibility();
        });
      });
  }
}
