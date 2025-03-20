import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  NgZone,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { UpdateTutorComponent } from './update-tutor/update-tutor.component';
import { AddTutorComponent } from './add-tutor/add-tutor.component';
import { AddButttonComponent } from '../../../components/add-buttton/add-buttton.component';
import { TuteurService } from '../../../service/tuteur.service';
import { Tutor } from '../../../models/Tutor.models';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-tuteur',
  imports: [CommonModule, MatIconModule, AddButttonComponent],
  templateUrl: './tuteur.component.html',
  styleUrl: './tuteur.component.scss',
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
export class TuteurComponent implements OnInit {
  isModalVisible: boolean[] = [];
  width!: string;
  hommeTotal: number = 0;
  femmeTotal: number = 0;
  tutorTotal: number = 0;
  tutorFrequentlyTotal: number = 0;
  lastTutor!: Tutor;
  lastTutorRecently!: Tutor;
  tutors: Tutor[] = [];
  tutorFrequently: Tutor[] = [];
  filteredTutor: Array<Tutor> = [];
  currentVisibleData: any[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  currentPageState = 'enter';
  role: string | null;

  private dialog = inject(MatDialog);
  private route = inject(Router);
  private breakPointObserver = inject(BreakpointObserver);
  private tutorService = inject(TuteurService);
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

    this.getAllTutor();
    this.getAllTutorFrequently();
    this.pageNumbers();

    setTimeout(() => {
      this.visibleData();
      this.initializeModalVisibility();
    }, 500);
  }

  initializeModalVisibility() {
    this.isModalVisible = Array(this.tutors.length).fill(false);
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

    //code pour supprimer le professeur
    this.spinner.show();
    this.tutorService.deleteTutorById(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Professeur supprimé avec succès!');
        this.getAllTutor();
        this.getAllTutorFrequently();
        this.initializeModalVisibility();
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
    this.currentVisibleData = this.filteredTutor.slice(startIndex, endIndex);
  }

  nextPage() {
    const totalPages = Math.ceil(this.filteredTutor.length / this.pageSize);
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
    const totalPages = Math.ceil(this.filteredTutor.length / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(pageNumber: number) {
    if (
      pageNumber >= 1 &&
      pageNumber <= Math.ceil(this.filteredTutor.length / this.pageSize)
    ) {
      this.currentPage = pageNumber;
      this.visibleData();
    }
  }

  //Recherche par nom d'etudiant
  filterByName(searchItem: string) {
    this.filteredTutor = this.tutors.filter((item) => {
      const fullname = item.fullname;
      return fullname?.toLowerCase().includes(searchItem.toLowerCase());
    });
    this.visibleData(); // Met à jour les données visibles pour la pagination
  }

  //Recherche par matricule
  filterByPhone(searchItem: string) {
    this.filteredTutor = this.tutors.filter((item) => {
      return item.phonenumber?.toString().includes(searchItem);
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

    this.filteredTutor.sort((a, b) => {
      const valueA = a[column as keyof Tutor] as any;
      const valueB = b[column as keyof Tutor] as any;

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

  consulterProfessor(id: number) {
    this.route.navigateByUrl('/dashboard/tuteur/' + id);
  }

  //Methode pour enregistrer un etudiant
  getAllTutor() {
    this.tutorService.getAllTutor().subscribe({
      next: (response) => {
        this.tutors = response;
        this.tutorTotal = response.length;
        this.filteredTutor = response;
        this.lastTutor = response[0];
        this.visibleData();
        // Compter le nombre d'étudiants de chaque sexe
        this.hommeTotal = response.filter(
          (tutor: { sexe: string }) => tutor.sexe === 'HOMME'
        ).length;
        this.femmeTotal = response.filter(
          (tutor: { sexe: string }) => tutor.sexe === 'FEMME'
        ).length;

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
          this.toastr.error('Impossible de récupérer la liste des tuteurs!');
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

  getAllTutorFrequently() {
    this.tutorService.getAllTutorFrequently().subscribe({
      next: (response) => {
        this.tutorFrequently = response;
        this.tutorFrequentlyTotal = response.length;
        this.lastTutorRecently = response[0];
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
            'Impossible de récupérer la liste des tuteurs ajoutés recemment!'
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

  addTutor() {
    this.dialog
      .open(AddTutorComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
      })
      .afterClosed()
      .subscribe(() => {
        setTimeout(() => {
          this.ngZone.run(() => {
            this.getAllTutor();
            this.initializeModalVisibility();
          });
        }, 500);
        this.cdk.detectChanges();
      });
  }

  //Methode pour ouvrir le modal de modification d'un tuteur
  updateProfessor(
    id: number,
    fullname: string,
    email: string,
    phonenumber: string,
    typeTutor: string
  ) {
    this.dialog
      .open(UpdateTutorComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: { id, fullname, email, phonenumber, typeTutor },
      })
      .afterClosed()
      .subscribe(() => {
        setTimeout(() => {
          this.ngZone.run(() => {
            this.getAllTutor();
            this.initializeModalVisibility();
          });
        }, 500);
        this.cdk.detectChanges();
      });
  }
}
