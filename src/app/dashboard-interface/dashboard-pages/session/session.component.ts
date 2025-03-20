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
import { AddSessionComponent } from './add-session/add-session.component';
import { UpdateSessionComponent } from './update-session/update-session.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AddButttonComponent } from '../../../components/add-buttton/add-buttton.component';
import { Session } from '../../../models/session.model';
import { SessionService } from '../../../service/session.service';
import { Router } from '@angular/router';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-session',
  imports: [CommonModule, MatIconModule, AddButttonComponent, NgxSpinnerModule],
  templateUrl: './session.component.html',
  styleUrl: './session.component.scss',
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
export class SessionComponent implements OnInit {
  isModalVisible: boolean[] = [];
  width!: string;
  dernierElement!: Session;
  dernierElementRecently!: Session;
  dernierSessionEnCours!: Session;
  dernierSessionCompletees!: Session;
  sessions: Session[] = [];
  sessionsFrequently: Session[] = [];
  filteredSession: Array<Session> = [];
  currentVisibleData: any[] = [];
  currentPageState = 'enter';
  role: string | null;

  currentPage: number = 1;
  pageSize: number = 5;
  sessionTotaleFrequently: number = 0;
  sessionTotale: number = 0;
  sessionEnCours: number = 0;
  sessionCompletees: number = 0;

  private dialog = inject(MatDialog);
  private breakPointObserver = inject(BreakpointObserver);
  private sessionService = inject(SessionService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private router = inject(Router);
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
    this.getAllSessions();
    this.getAllSessionsFrequently();
    this.pageNumbers();

    setTimeout(() => {
      this.visibleData();
      this.initializeModalVisibility();
    }, 500);
  }

  initializeModalVisibility() {
    this.isModalVisible = Array(this.sessions.length).fill(false);
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
    this.sessionService.deleteSessionById(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Session supprimée avec succès!');
        this.getAllSessions();
        this.getAllSessionsFrequently();
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
    this.currentVisibleData = this.filteredSession.slice(startIndex, endIndex);
  }

  nextPage() {
    const totalPages = Math.ceil(this.filteredSession.length / this.pageSize);
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
    const totalPages = Math.ceil(this.filteredSession.length / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(pageNumber: number) {
    if (
      pageNumber >= 1 &&
      pageNumber <= Math.ceil(this.filteredSession.length / this.pageSize)
    ) {
      this.currentPage = pageNumber;
      this.visibleData();
    }
  }

  //Recherche par date de debut de session
  filterByName(searchItem: string) {
    this.filteredSession = this.sessions.filter((item) => {
      return item.dateDebut?.toLowerCase().includes(searchItem.toLowerCase());
    });
    this.visibleData(); // Met à jour les données visibles pour la pagination
  }

  //Recherche par statuts de session
  filterByStatuts(searchItem: string) {
    this.filteredSession = this.sessions.filter((item) => {
      return item.statuts?.toUpperCase().includes(searchItem.toUpperCase());
    });
    this.visibleData(); // Met à jour les données visibles pour la pagination
  }

  /*******************end pagination and search ***************************/

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

    this.filteredSession.sort((a, b) => {
      const valueA = a[column as keyof Session] as any;
      const valueB = b[column as keyof Session] as any;

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

  //Methode pour recuperer toutes les sessions
  getAllSessions() {
    this.sessionService.getAllSession().subscribe({
      next: (response) => {
        this.sessions = response;
        this.sessionTotale = response.length;
        this.filteredSession = this.sessions;
        this.dernierElement = response[0];
        this.visibleData();
        // Compter les sessions avec les statuts 'active' et 'pause'
        const activeAndPauseSessions = response.filter(
          (session: any) =>
            session.statuts === 'ACTIVE' || session.statuts === 'PAUSE'
        );
        this.sessionEnCours = activeAndPauseSessions.length;
        this.dernierSessionEnCours =
          activeAndPauseSessions[activeAndPauseSessions.length - 1];
        // Compter les sessions avec le statut 'completee'
        const completeSessions = response.filter(
          (session: any) => session.statuts === 'COMPLETEE'
        );
        this.sessionCompletees = completeSessions.length;
        this.dernierSessionCompletees =
          completeSessions[completeSessions.length - 1];
        this.getAllSessionsFrequently();
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
          this.toastr.error('Impossible de récupérer la liste des sessions!');
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

  //Methode pour recuperer toutes les sessions ajoutees frequemment
  getAllSessionsFrequently() {
    this.sessionService.getAllSessionFrequently().subscribe({
      next: (response) => {
        this.sessionsFrequently = response;
        this.sessionTotaleFrequently = this.sessionsFrequently.length;
        this.dernierElementRecently = response[0];
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
            'Impossible de récupérer la liste des sessions ajoutées recemment!'
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

  //Methode pour modifier la classe en fonction du statut de la session
  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'PAUSE':
        return 'yellow';
      case 'ANNULEE':
        return 'red';
      case 'COMPLETEE':
        return 'blue';
      default:
        return 'ACTIVE'; // Classe par défaut si nécessaire
    }
  }

  //Methode pour consulter une session
  consulterSession(id: number) {
    this.router.navigateByUrl('/dashboard/session/' + id);
  }

  //Methode pour ouvrir le modal d'ajout d'une session
  addSession() {
    this.dialog
      .open(AddSessionComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
      })
      .afterClosed()
      .subscribe(() => {
        this.getAllSessions();
        this.getAllSessionsFrequently();
        setTimeout(() => {
          this.visibleData();
          this.initializeModalVisibility();
          this.cdk.detectChanges();
        }, 500);
      });
  }

  //Methode pour ouvrir le modal de modification d'une session
  updateSession(id: number, dateDebut: string) {
    this.dialog
      .open(UpdateSessionComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: { id, dateDebut },
      })
      .afterClosed()
      .subscribe(() => {
        this.getAllSessions();
        setTimeout(() => {
          this.visibleData();
          this.initializeModalVisibility();
          this.cdk.detectChanges();
        }, 500);
      });
  }
}
