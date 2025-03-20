import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AddSpecificiteComponent } from './add-specificite/add-specificite.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { UpdateSpecificiteComponent } from './update-specificite/update-specificite.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SpecificiteFormation } from '../../../models/Specificite.model';
import { AddButttonComponent } from '../../../components/add-buttton/add-buttton.component';
import { SpecificiteService } from '../../../service/specificiteFormation.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-specificite',
  imports: [CommonModule, MatIconModule, AddButttonComponent],
  templateUrl: './specificite.component.html',
  styleUrl: './specificite.component.scss',
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
export class SpecificiteComponent implements OnInit {
  isModalVisible: boolean[] = [];
  width!: string;
  specificites: SpecificiteFormation[] = [];
  specificitesFrequently: SpecificiteFormation[] = [];
  filteredSpecificites: Array<SpecificiteFormation> = [];
  currentVisibleData: any[] = [];
  currentPageState = 'enter';
  role: string | null;

  specificitesTotal: number = 0;
  specificitesFrequentlyTotal: number = 0;
  currentPage: number = 1;
  pageSize: number = 5;

  private dialog = inject(MatDialog);
  private breakPointObserver = inject(BreakpointObserver);
  private specificiteService = inject(SpecificiteService);
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

    this.getAllSpecificte();
    this.pageNumbers();

    setTimeout(() => {
      this.visibleData();
      this.initializeModalVisibility();
    }, 500);
  }

  initializeModalVisibility() {
    this.isModalVisible = Array(this.specificites.length).fill(false);
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
    console.log('Option sélectionnée dans le modal', index);

    //Methode pour supprimer le campus
    this.spinner.show();
    this.specificiteService.deleteSpecificiteById(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Specificité supprimée avec succès!');
        this.getAllSpecificte();
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
    this.currentVisibleData = this.filteredSpecificites.slice(
      startIndex,
      endIndex
    );
  }

  nextPage() {
    const totalPages = Math.ceil(
      this.filteredSpecificites.length / this.pageSize
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
      this.filteredSpecificites.length / this.pageSize
    );
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(pageNumber: number) {
    if (
      pageNumber >= 1 &&
      pageNumber <= Math.ceil(this.filteredSpecificites.length / this.pageSize)
    ) {
      this.currentPage = pageNumber;
      this.visibleData();
    }
  }

  //Recherche par nom de matiere
  filterByCode(searchItem: string) {
    this.filteredSpecificites = this.specificites.filter((item) => {
      return item.code?.toLowerCase().includes(searchItem.toLowerCase());
    });
    this.visibleData(); // Met à jour les données visibles pour la pagination
  }

  // Recherche par duree de matiere
  filterByLibelle(searchItem: string) {
    this.filteredSpecificites = this.specificites.filter((item) => {
      return item.libelle?.toLowerCase().includes(searchItem.toLowerCase()); // Comparaison partielle
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

    this.filteredSpecificites.sort((a, b) => {
      const valueA = a[column as keyof SpecificiteFormation] as any;
      const valueB = b[column as keyof SpecificiteFormation] as any;

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

  //Methode pour enregistrer une specificite
  getAllSpecificte() {
    this.specificiteService.getAllSpecificite().subscribe({
      next: (response) => {
        this.specificites = response;
        this.specificitesTotal = response.length;
        this.filteredSpecificites = response;
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
            'Impossible de récupérer la liste des specificités!'
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

  //Methode pour ajouter une specificite de formation
  addSpecificite() {
    this.dialog
      .open(AddSpecificiteComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
      })
      .afterClosed()
      .subscribe(() => {
        setTimeout(() => {
          this.visibleData();
          this.initializeModalVisibility();
          this.cdk.detectChanges();
        }, 500);
        this.getAllSpecificte();
      });
  }

  //Methode pour mettre a jour une specificite de formation
  updateSpecificte(id: number, code: string, libelle: string) {
    this.dialog
      .open(UpdateSpecificiteComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: { id, code, libelle },
      })
      .afterClosed()
      .subscribe(() => {
        setTimeout(() => {
          this.getAllSpecificte();
          this.visibleData();
          this.initializeModalVisibility();
          this.cdk.detectChanges();
        }, 500);
      });
  }
}
