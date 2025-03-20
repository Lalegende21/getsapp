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
import { AddButttonComponent } from '../../../components/add-buttton/add-buttton.component';
import { AddUserComponent } from './add-user/add-user.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { UserService } from '../../../service/user.service';
import { User } from '../../../models/User.model';
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
  selector: 'app-liste-utilisateurs',
  imports: [CommonModule, MatIconModule, AddButttonComponent],
  templateUrl: './liste-utilisateurs.component.html',
  styleUrl: './liste-utilisateurs.component.scss',
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
export class ListeUtilisateursComponent implements OnInit {
  width: string = '';
  users: User[] = [];
  usersRecently: User[] = [];
  currentVisibleData: any[] = [];
  usersTotal: number = 0;
  usersRecentlyTotal: number = 0;
  lastUser!: User;
  lastUserRecently!: User;
  lastHommeTotal!: User;
  lastFemmeTotal!: User;
  isModalVisible: boolean[] = [];
  filteredUser: Array<User> = [];
  hommeTotal: number = 0;
  femmeTotal: number = 0;
  currentPage: number = 1;
  pageSize: number = 5;
  currentPageState = 'enter';

  private dialog = inject(MatDialog);
  private route = inject(Router);
  private breakPointObserver = inject(BreakpointObserver);
  private userService = inject(UserService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private cdk = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

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

    this.getAllUsers();
    this.getAllUsersFrequently();
    this.pageNumbers();

    setTimeout(() => {
      this.visibleData();
      this.initializeModalVisibility();
    }, 500);
  }

  initializeModalVisibility() {
    this.isModalVisible = Array(this.users.length).fill(false);
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

  //Methode pour afficher les informations du professeur
  consulterProfessor(id: number) {
    this.route.navigateByUrl('/dashboard/liste-utilisateurs/' + id);
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
    this.currentVisibleData = this.filteredUser.slice(startIndex, endIndex);
  }

  nextPage() {
    const totalPages = Math.ceil(this.filteredUser.length / this.pageSize);
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
    const totalPages = Math.ceil(this.filteredUser.length / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  changePage(pageNumber: number) {
    if (
      pageNumber >= 1 &&
      pageNumber <= Math.ceil(this.filteredUser.length / this.pageSize)
    ) {
      this.currentPage = pageNumber;
      this.visibleData();
    }
  }

  //Recherche par nom d'etudiant
  filterByName(searchItem: string) {
    this.filteredUser = this.users.filter((item) => {
      const fullname = item.firstname + ' ' + item.lastname;
      return fullname?.toLowerCase().includes(searchItem.toLowerCase());
    });
    this.visibleData(); // Met à jour les données visibles pour la pagination
  }

  //Recherche par email
  filterByEmail(searchItem: string) {
    this.filteredUser = this.users.filter((item) => {
      return item.email?.toLowerCase().includes(searchItem.toLowerCase());
    });
    this.visibleData(); // Met à jour les données visibles pour la pagination
  }
  /*******************end pagination ***************************/

  getAllUsers() {
    this.userService.getAllUser().subscribe({
      next: (response) => {
        this.users = response;
        this.filteredUser = response;
        this.usersTotal = response.length;
        this.lastUser = response[0];
        this.visibleData();

        this.hommeTotal = response.filter(
          (user: { sexe: string }) => user.sexe === 'HOMME'
        ).length;
        this.lastHommeTotal = response.filter(
          (user: { sexe: string }) => user.sexe === 'HOMME'
        )[0];
        this.femmeTotal = response.filter(
          (user: { sexe: string }) => user.sexe === 'FEMME'
        ).length;
        this.lastFemmeTotal = response.filter(
          (user: { sexe: string }) => user.sexe === 'FEMME'
        )[0];

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
          this.toastr.error(
            'Impossible de récupérer la liste des utilisateurs!'
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

  getAllUsersFrequently() {
    this.userService.getAllUserFrequently().subscribe({
      next: (response) => {
        this.usersRecently = response;
        this.usersRecentlyTotal = response.length;
        this.lastUserRecently = response[response.length - 1];
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
            'Impossible de récupérer la liste des utilisateurs ajoutés recemment!'
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

  addUser() {
    this.dialog
      .open(AddUserComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
      })
      .afterClosed()
      .subscribe(() => {
        setTimeout(() => {
          this.ngZone.run(() => {
            this.getAllUsers();
            this.initializeModalVisibility();
          });
        }, 500);
        this.cdk.detectChanges();
      });
  }
}
