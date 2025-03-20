import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AddFormationsComponent } from './add-formations/add-formations.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { UpdateFormationsComponent } from './update-formations/update-formations.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Formation } from '../../../models/fomation.model';
import { FormationService } from '../../../service/formation.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { AddButttonComponent } from '../../../components/add-buttton/add-buttton.component';

@Component({
  selector: 'app-liste-formations',
  imports: [CommonModule, MatIconModule, AddButttonComponent],
  templateUrl: './liste-formations.component.html',
  styleUrl: './liste-formations.component.scss',
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
export class ListeFormationsComponent implements OnInit {
  isModalVisible: boolean[] = [];
  width!: string;
  formations: Formation[] = [];
  formationsTotal!: number;
  formationsFrequently: Formation[] = [];
  formationsFrequentlyTotal!: number;
  filteredFormations: Array<Formation> = [];
  currentVisibleData: any[] = [];
  currentPageState = 'enter';
  role: string | null;

  currentPage: number = 1;
  pageSize: number = 5;

  private router = inject(Router);
  private dialog = inject(MatDialog);
  // private data = inject(MAT_DIALOG_DATA);
  private breakPointObserver = inject(BreakpointObserver);
  private formationService = inject(FormationService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

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
    this.getAllFormations();
    this.pageNumbers();

    setTimeout(() => {
      this.visibleData();
      this.initializeModalVisibility();
    }, 500);
  }

  initializeModalVisibility() {
    this.isModalVisible = Array(this.formations.length).fill(false);
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Fermez tous les modals si le clic est en dehors d'un modal et d'un bouton
    if (!target.closest('.modal') && !target.closest('.more-icon')) {
      this.isModalVisible.fill(false);
    }
  }

  /*******************start pagination and search ***************************/
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
    this.currentVisibleData = this.filteredFormations.slice(
      startIndex,
      endIndex
    );
  }

  nextPage() {
    const totalPages = Math.ceil(
      this.filteredFormations.length / this.pageSize
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
      this.filteredFormations.length / this.pageSize
    );
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(pageNumber: number) {
    if (
      pageNumber >= 1 &&
      pageNumber <= Math.ceil(this.filteredFormations.length / this.pageSize)
    ) {
      this.currentPage = pageNumber;
      this.visibleData();
    }
  }

  //Recherche par nom de matiere
  filterBySpeciality(searchItem: string) {
    this.filteredFormations = this.formations.filter((item) => {
      return item.specialite?.toLowerCase().includes(searchItem.toLowerCase());
    });
    this.visibleData(); // Met à jour les données visibles pour la pagination
  }

  // Recherche par duree de matiere
  filterByCode(searchItem: string) {
    this.filteredFormations = this.formations.filter((item) => {
      return item.specificiteFormation.code
        ?.toLowerCase()
        .includes(searchItem.toLowerCase()); // Comparaison partielle
    });

    this.visibleData(); // Met à jour les données visibles pour la pagination
  }

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

    this.filteredFormations.sort((a, b) => {
      const valueA = a[column as keyof Formation] as any;
      const valueB = b[column as keyof Formation] as any;

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

  //Methode pour enregistrer une formation
  getAllFormations() {
    this.formationService.getAllFormation().subscribe({
      next: (response) => {
        this.formations = response;
        this.formationsTotal = response.length;
        this.filteredFormations = response;
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
          this.toastr.error('Impossible de récupérer la liste des formations!');
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

  addFormation() {
    this.dialog
      .open(AddFormationsComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
      })
      .afterClosed()
      .subscribe(() => {
        this.getAllFormations();
        setTimeout(() => {
          this.visibleData();
          this.initializeModalVisibility();
        }, 500);
      });
  }

  updateFormation(
    id: number,
    specialite: string,
    code: string,
    periode: string,
    price: number
  ) {
    this.dialog
      .open(UpdateFormationsComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: { id, specialite, code, periode, price },
      })
      .afterClosed()
      .subscribe(() => {
        this.getAllFormations();
        setTimeout(() => {
          this.visibleData();
          this.initializeModalVisibility();
        }, 500);
      });
  }

  deleteFormation(id: number) {
    this.spinner.show();
    this.formationService.deleteFormationById(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Formation supprimée avec succès!');
        this.getAllFormations();
        this.visibleData();
        this.initializeModalVisibility();
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.error(error.error.message);
      },
    });
  }
}
