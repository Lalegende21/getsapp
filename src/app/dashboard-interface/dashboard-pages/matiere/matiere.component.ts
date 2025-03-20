import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { AddMatiereComponent } from './add-matiere/add-matiere.component';
import { UpdateMatiereComponent } from './update-matiere/update-matiere.component';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Course } from '../../../models/course.model';
import { AddButttonComponent } from '../../../components/add-buttton/add-buttton.component';
import { CourseService } from '../../../service/course.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-matiere',
  imports: [CommonModule, MatIconModule, AddButttonComponent],
  templateUrl: './matiere.component.html',
  styleUrl: './matiere.component.scss',
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
export class MatiereComponent implements OnInit {
  isModalVisible: boolean[] = [];
  width!: string;
  lastCourse!: Course;
  lastCourseRecently!: Course;
  matieres: Course[] = [];
  matiereFrequently: Course[] = [];
  allCourse: number = 0;
  allMatiereFrequently: number = 0;
  currentPage: number = 1;
  pageSize: number = 5;
  filteredMatiere: Array<Course> = [];
  currentVisibleData: any[] = [];
  currentPageState = 'enter';
  longestDurationMatiere!: Course;
  shortestDurationMatiere!: Course;
  role: string | null;

  private dialog = inject(MatDialog);
  private breakPointObserver = inject(BreakpointObserver);
  private courseService = inject(CourseService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private cdk = inject(ChangeDetectorRef);

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

    this.getAllCourse();
    this.getAllCourseFrequently();
    this.pageNumbers();

    setTimeout(() => {
      this.visibleData();
      this.initializeModalVisibility();
    }, 500);
  }

  initializeModalVisibility() {
    this.isModalVisible = Array(this.matieres.length).fill(false);
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
  }

  onOptionSelectedDelete(index: number, event: Event, id: number) {
    event.stopPropagation(); // Empêche la propagation du clic
    this.isModalVisible[index] = false; // Ferme le modal correspondant
    //Methode pour supprimer le campus
    this.spinner.show();
    this.courseService.deleteCourseById(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Matière supprimée avec succès!');
        this.getAllCourse();
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
      this.visibleData();
      this.currentPageState = 'enter';
    }, 300); // Correspond à la durée de l'animation
  }

  visibleData() {
    let startIndex = (this.currentPage - 1) * this.pageSize;
    let endIndex = startIndex + this.pageSize;
    this.currentVisibleData = this.filteredMatiere.slice(startIndex, endIndex);
  }

  nextPage() {
    const totalPages = Math.ceil(this.filteredMatiere.length / this.pageSize);
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
    const totalPages = Math.ceil(this.filteredMatiere.length / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(pageNumber: number) {
    if (
      pageNumber >= 1 &&
      pageNumber <= Math.ceil(this.filteredMatiere.length / this.pageSize)
    ) {
      this.currentPage = pageNumber;
      this.visibleData();
    }
  }

  //Recherche par nom de matiere
  filterByName(searchItem: string) {
    this.filteredMatiere = this.matieres.filter((item) => {
      return item.name?.toLowerCase().includes(searchItem.toLowerCase());
    });
    this.visibleData(); // Met à jour les données visibles pour la pagination
  }

  //Recherche par duree de matiere
  filterByDuree(searchItem: string) {
    this.filteredMatiere = this.matieres.filter((item) => {
      return item.duree.toString().includes(searchItem); // Comparaison partielle
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

    this.filteredMatiere.sort((a, b) => {
      const valueA = a[column as keyof Course] as any;
      const valueB = b[column as keyof Course] as any;

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

  //Methode pour recuperer toutes les matieres
  getAllCourse() {
    this.courseService.getAllCourse().subscribe({
      next: (response) => {
        this.matieres = response;
        this.allCourse = response.length;
        this.filteredMatiere = this.matieres;
        this.lastCourse = response[0];
        this.visibleData();

        // Trouver la matière avec la plus grande durée
        if (this.matieres && this.matieres.length > 0) {
          this.longestDurationMatiere = this.matieres.reduce((prev, current) =>
            prev.duree > current.duree ? prev : current
          );
        }

        // Trouver la matière avec la plus courte durée
        if (this.matieres && this.matieres.length > 0) {
          this.shortestDurationMatiere = this.matieres.reduce((prev, current) =>
            prev.duree < current.duree ? prev : current
          );
        }
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
          this.toastr.error('Impossible de récupérer la liste des matières!');
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

  getAllCourseFrequently() {
    this.courseService.GetAllCourseFrequently().subscribe({
      next: (response) => {
        this.matiereFrequently = response;
        this.allMatiereFrequently = this.matiereFrequently.length;
        this.lastCourseRecently = response[0];
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
            'Impossible de récupérer la liste des matières ajoutés recemment!'
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

  //Methode pour ouvrir le modal d'ajout d'une matiere
  addMatiere() {
    this.dialog
      .open(AddMatiereComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
      })
      .afterClosed()
      .subscribe(() => {
        this.getAllCourse();
        this.getAllCourseFrequently();
        setTimeout(() => {
          this.visibleData();
          this.initializeModalVisibility();
          this.cdk.detectChanges();
        }, 500);
      });
  }

  //Methode pour ouvrir le modal de modification d'une matiere
  updateMatiere(id: number, name: string, duree: string) {
    this.dialog
      .open(UpdateMatiereComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: { id, name, duree },
      })
      .afterClosed()
      .subscribe(() => {
        setTimeout(() => {
          this.getAllCourse();
          this.visibleData();
          this.initializeModalVisibility();
          this.cdk.detectChanges();
        }, 500);
      });
  }
}
