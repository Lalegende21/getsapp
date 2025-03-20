import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Paiement } from '../../../models/paiement.model';
import { PaiementService } from '../../../service/paiement.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-paiement',
  imports: [CommonModule, MatIconModule],
  templateUrl: './paiement.component.html',
  styleUrl: './paiement.component.scss',
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
export class PaiementComponent implements OnInit {
  paiements: Paiement[] = [];
  lastPaiementTotal!: Paiement;
  lastPaiementTotalRecently!: Paiement;
  paiementFrequently: Paiement[] = [];
  paiementsTotal: number = 0;
  paiementsFrequentlyTotal: number = 0;

  currentPage: number = 1;
  pageSize: number = 5;
  filteredPaiement: Array<Paiement> = [];
  currentVisibleData: any[] = [];
  currentPageState = 'enter';

  isModalVisible: boolean[] = [];
  private router = inject(Router); // Associe le composant à la route Angular
  private paiementService = inject(PaiementService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  ngOnInit(): void {
    this.getAllPaiement();
    this.getAllPaiementFrequently();
    this.pageNumbers();

    setTimeout(() => {
      this.visibleData();
      this.initializeModalVisibility();
    }, 500);
  }

  initializeModalVisibility() {
    this.isModalVisible = Array(this.paiements.length).fill(false);
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
    this.currentVisibleData = this.filteredPaiement.slice(startIndex, endIndex);
  }

  nextPage() {
    const totalPages = Math.ceil(this.filteredPaiement.length / this.pageSize);
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
    const totalPages = Math.ceil(this.filteredPaiement.length / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(pageNumber: number) {
    if (
      pageNumber >= 1 &&
      pageNumber <= Math.ceil(this.filteredPaiement.length / this.pageSize)
    ) {
      this.currentPage = pageNumber;
      this.visibleData();
    }
  }

  //Recherche par nom d'etudiant
  filterByStudent(searchItem: string) {
    this.filteredPaiement = this.paiements.filter((item) => {
      const fullname = item.student.firstname + ' ' + item.student.lastname;
      return fullname?.toLowerCase().includes(searchItem.toLowerCase());
    });
    this.visibleData(); // Met à jour les données visibles pour la pagination
  }

  //Recherche par matricule
  filterByTypePaiement(searchItem: string) {
    this.filteredPaiement = this.paiements.filter((item) => {
      return item.typePaiement
        ?.toLowerCase()
        .includes(searchItem.toLowerCase());
    });
    this.visibleData(); // Met à jour les données visibles pour la pagination
  }
  /*******************end pagination ***************************/

  getAllPaiement() {
    this.paiementService.getAllPaiement().subscribe({
      next: (response) => {
        this.paiements = response;
        this.paiementsTotal = response.length;
        this.filteredPaiement = response;
        this.lastPaiementTotal = response[0];
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
          this.toastr.error('Impossible de récupérer la liste des paiements!');
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

  getAllPaiementFrequently() {
    this.paiementService.getAllPaiementFrequently().subscribe({
      next: (response) => {
        this.paiementFrequently = response;
        this.paiementsFrequentlyTotal = response.length;
        this.lastPaiementTotalRecently = response[0];
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
            'Impossible de récupérer la liste des paiements ajoutés recemment!'
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

  //Methode pour afficher les informations du professeur
  consulterPaiement(id: number) {
    this.router.navigateByUrl('/dashboard/etudiant/' + id + '/paiements');
  }
}
