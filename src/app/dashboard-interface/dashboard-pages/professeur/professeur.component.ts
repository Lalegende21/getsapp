import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AddProfessorComponent } from './add-professor/add-professor.component';
import { UpdateProfessorComponent } from './update-professor/update-professor.component';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AddButttonComponent } from '../../../components/add-buttton/add-buttton.component';
import { Professor } from '../../../models/Professor.model';
import { ProfessorService } from '../../../service/professor.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-professeur',
  imports: [CommonModule, MatIconModule, AddButttonComponent],
  templateUrl: './professeur.component.html',
  styleUrl: './professeur.component.scss',
})
export class ProfesseurComponent implements OnInit {
  isModalVisible: boolean[] = [];
  width!: string;
  lastProfessor!: Professor;
  lastProfessorRecently!: Professor;
  allProfMale!: Professor;
  allProfFeMale!: Professor;
  professors: Professor[] = [];
  professorsTotal!: number;
  professorsFrequently: Professor[] = [];
  filteredProfessor: Array<Professor> = [];
  currentVisibleData: any[] = [];
  currentPageState = 'enter';
  professorsFrequentlyTotal!: number;
  currentPage: number = 1;
  pageSize: number = 5;
  totalProfHomme = 0;
  totalProfFemme = 0;
  imageUrl: string = '';
  arrayUrl = [];
  safeImageUrl!: SafeUrl;
  role: string | null;

  private dialog = inject(MatDialog);
  private route = inject(Router);
  private breakPointObserver = inject(BreakpointObserver);
  private professorService = inject(ProfessorService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private cdk = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);

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

    this.getAllProfessor();
    this.getAllProfessorFrequently();
    this.pageNumbers();

    setTimeout(() => {
      this.visibleData();
      this.initializeModalVisibility();
    }, 500);
  }

  initializeModalVisibility() {
    this.isModalVisible = Array(this.professors.length).fill(false);
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
    this.professorService.deleteProfessorById(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Professeur supprimé avec succès!');
        this.getAllProfessor();
        this.getAllProfessorFrequently();
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
    this.currentVisibleData = this.filteredProfessor.slice(
      startIndex,
      endIndex
    );
  }

  nextPage() {
    const totalPages = Math.ceil(this.filteredProfessor.length / this.pageSize);
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
    const totalPages = Math.ceil(this.filteredProfessor.length / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(pageNumber: number) {
    if (
      pageNumber >= 1 &&
      pageNumber <= Math.ceil(this.filteredProfessor.length / this.pageSize)
    ) {
      this.currentPage = pageNumber;
      this.visibleData();
    }
  }

  //Recherche par nom de matiere
  filterByName(searchItem: string) {
    this.filteredProfessor = this.professors.filter((item) => {
      return item.fullname?.toLowerCase().includes(searchItem.toLowerCase());
    });
    this.visibleData(); // Met à jour les données visibles pour la pagination
  }

  //Recherche par duree de matiere
  filterByEmail(searchItem: string) {
    this.filteredProfessor = this.professors.filter((item) => {
      return item.email?.toLowerCase().includes(searchItem.toLowerCase()); // Comparaison partielle
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

    this.filteredProfessor.sort((a, b) => {
      const valueA = a[column as keyof Professor] as any;
      const valueB = b[column as keyof Professor] as any;

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

  //Methode pour afficher les informations du professeur
  consulterProfessor(id: number) {
    this.route.navigateByUrl('/dashboard/professeur/' + id);
  }

  //Methode pour enregistrer un centre
  getAllProfessor() {
    this.professorService.getAllProfessor().subscribe({
      next: (response) => {
        this.professors = response;
        this.professorsTotal = this.professors.length;
        this.filteredProfessor = this.professors;
        this.lastProfessor = response[0];

        this.totalProfHomme = this.professors.filter(
          (professor) => professor.sexe == 'HOMME'
        ).length;
        const totalsProfHomme = this.professors.filter(
          (professor) => professor.sexe == 'HOMME'
        );
        this.allProfMale = totalsProfHomme[totalsProfHomme.length - 1];

        this.totalProfFemme = this.professors.filter(
          (professor) => professor.sexe == 'FEMME'
        ).length;
        const totalsProfFemme = this.professors.filter(
          (professor) => professor.sexe == 'FEMME'
        );
        this.allProfFeMale = totalsProfFemme[totalsProfFemme.length - 1];

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
            'Impossible de récupérer la liste des professeurs!'
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

  getAllProfessorFrequently() {
    this.professorService.GetAllProfessorFrequently().subscribe({
      next: (response) => {
        this.professorsFrequently = response;
        this.professorsFrequentlyTotal = response.length;
        this.lastProfessorRecently = response[0];
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
            'Impossible de récupérer la liste des professeurs ajoutés recemment!'
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

  //Methode pour ouvrir le modal d'ajout d'un professeur
  addProfessor() {
    this.dialog
      .open(AddProfessorComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
      })
      .afterClosed()
      .subscribe(() => {
        this.getAllProfessor();
        this.getAllProfessorFrequently();
        setTimeout(() => {
          this.visibleData();
          this.initializeModalVisibility();
          this.cdk.detectChanges();
        }, 500);
      });
  }

  //Methode pour ouvrir le modal de modification d'un professeur
  updateProfessor(
    id: number,
    fullname: string,
    cni: string,
    email: string,
    phonenumber: string
  ) {
    this.dialog
      .open(UpdateProfessorComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: { id, fullname, cni, email, phonenumber },
      })
      .afterClosed()
      .subscribe(() => {
        this.getAllProfessor();
        this.visibleData();
        this.initializeModalVisibility();
      });
  }
}
