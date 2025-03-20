import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AddButttonComponent } from '../../../components/add-buttton/add-buttton.component';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { StartCourseComponent } from './start-course/start-course.component';
import { StartCourseService } from '../../../service/start-course.service';
import { StartCourse } from '../../../models/startCourse.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-demarrer-matiere',
  imports: [CommonModule, MatIconModule, AddButttonComponent],
  templateUrl: './demarrer-matiere.component.html',
  styleUrl: './demarrer-matiere.component.scss',
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
export class DemarrerMatiereComponent implements OnInit {
  width: string = '';
  isModalVisible: boolean[] = [];
  startAllCourse: StartCourse[] = [];
  startAllCourseRecently: StartCourse[] = [];
  filteredStartCourse: Array<StartCourse> = [];
  currentVisibleData: any[] = [];
  allStartCourse: number = 0;
  allStartCourseRecently: number = 0;
  allStartCourseEnCours: number = 0;
  allStartCourseTermine: number = 0;
  lastStartCourse!: StartCourse;
  lastStartCourseRecently!: StartCourse;
  startCourseEnCours!: StartCourse;
  startCourseTermine!: StartCourse;
  currentPageState = 'enter';
  currentPage: number = 1;
  pageSize: number = 5;
  startCourseTotal: number = 0;
  startCourseRecentlyTotal: number = 0;
  role: string | null;

  private router = inject(Router);
  private dialog = inject(MatDialog);
  private breakPointObserver = inject(BreakpointObserver);
  private cdr = inject(ChangeDetectorRef);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private startCourseService = inject(StartCourseService);

  constructor() {
    this.role = localStorage.getItem('role');
  }

  ngOnInit(): void {
    this.breakPointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe((result) => {
        if (result.matches) {
          this.width = '70%';
        } else {
          this.width = '80%';
        }
      });

    this.getAllStartCourse();
    this.getAllStartCourseFrequently();
    this.pageNumbers();

    setTimeout(() => {
      this.visibleData();
      this.initializeModalVisibility();
    }, 500);
  }

  initializeModalVisibility() {
    this.isModalVisible = Array(this.startAllCourse.length).fill(false);
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
    this.startCourseService.deleteStartCourseById(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Matière supprimée avec succès!');
        this.getAllStartCourse();
        this.getAllStartCourseFrequently();
      },
      error: (error) => {
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

  //Changer le statut du bouton des formulaires
  isButtonDisabled(statut: string): boolean {
    return statut === 'ACTIVER' || statut === 'TERMINER';
  }

  //Methode pour modifier la classe en fonction du statut de la session
  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVER':
        return 'green';
      case 'TERMINER':
        return 'red';
      default:
        return 'ACTIVER'; // Classe par défaut si nécessaire
    }
  }

  //Methode pour recuperer la liste des matieres demarrees
  getAllStartCourse() {
    this.startCourseService.getAllStartCourse().subscribe({
      next: (response) => {
        console.log(response);

        this.startAllCourse = response;
        this.filteredStartCourse = response;
        this.allStartCourse = this.startAllCourse.length;
        this.lastStartCourse =
          this.startAllCourse[this.startAllCourse.length - 1];

        const allStartCourseEnCoursArray = this.startAllCourse.filter(
          (course) => course.statut == 'ACTIVER'
        );
        this.allStartCourseEnCours = allStartCourseEnCoursArray.length;
        this.startCourseEnCours = allStartCourseEnCoursArray[0];

        const allStartCourseTermineArray = this.startAllCourse.filter(
          (course) => course.statut == 'TERMINER'
        );
        this.allStartCourseTermine = allStartCourseTermineArray.length;
        this.startCourseTermine = allStartCourseTermineArray[0];

        this.visibleData();
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
            'Impossible de récupérer la liste des matières demarrées!'
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

  //Methode pour recuperer la liste des matieres demarrees recemment
  getAllStartCourseFrequently() {
    this.startCourseService.getAllStartCourseFrequently().subscribe({
      next: (response) => {
        this.startAllCourseRecently = response;
        this.allStartCourseRecently = this.startAllCourseRecently.length;
        this.lastStartCourseRecently =
          this.startAllCourseRecently[this.startAllCourseRecently.length - 1];
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
            'Impossible de récupérer la liste des matières demarrèes recemment!'
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

  /*******************start pagination of course ***************************/
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
    this.currentVisibleData = this.filteredStartCourse.slice(
      startIndex,
      endIndex
    );
  }

  nextPage() {
    const totalPages = Math.ceil(
      this.filteredStartCourse.length / this.pageSize
    );
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
    const totalPages = Math.ceil(
      this.filteredStartCourse.length / this.pageSize
    );
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(pageNumber: number) {
    if (
      pageNumber >= 1 &&
      pageNumber <= Math.ceil(this.filteredStartCourse.length / this.pageSize)
    ) {
      this.currentPage = pageNumber;
      this.visibleData();
    }
  }

  //Recherche par nom de matiere
  filterByName(searchItem: string) {
    this.filteredStartCourse = this.startAllCourse.filter((item) => {
      return item.course.name?.toLowerCase().includes(searchItem.toLowerCase());
    });
    this.visibleData(); // Met à jour les données visibles pour la pagination
  }

  //Recherche par session de matiere
  filterBySession(searchItem: string) {
    this.filteredStartCourse = this.startAllCourse.filter((item) => {
      return item.session.dateDebut
        ?.toLowerCase()
        .includes(searchItem.toLowerCase());
    });
    this.visibleData(); // Met à jour les données visibles pour la pagination
  }
  /*******************end pagination ***************************/

  consulterStartCourse(id: number) {
    this.router.navigateByUrl('/dashboard/demarrer-matiere/' + id);
  }

  /*******************start pagination of start course ***************************/

  /*******************end pagination ***************************/

  startCourse() {
    this.dialog
      .open(StartCourseComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
      })
      .afterClosed()
      .subscribe(() => {
        this.getAllStartCourse();
        this.getAllStartCourseFrequently();
        setTimeout(() => {
          this.visibleData();
          this.initializeModalVisibility();
          this.cdr.detectChanges();
        }, 500);
      });
  }
}
