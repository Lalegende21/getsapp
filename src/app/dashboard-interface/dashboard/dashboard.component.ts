import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  RouterOutlet,
  RouterModule,
  Router,
  NavigationEnd,
} from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { filter } from 'rxjs';
import { AuthService } from '../../service/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UserService } from '../../service/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterOutlet,
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatTooltipModule,
    TranslateModule,
    NgxSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  id: number = 0;
  isSidenavOpen = true;
  isLargeScreen = true;
  sidenavMode: 'side' | 'over' = 'side';
  fullname: string | null;
  img!: File;
  safeImageUrl: SafeUrl = '';
  isLoading = true;
  role: string | null;

  private authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private spinner = inject(NgxSpinnerService);
  private userService = inject(UserService);
  private sanitizer = inject(DomSanitizer);
  private toastr = inject(ToastrService);

  changeLang(selectedLang: string) {
    this.translate.use(selectedLang);
  }

  constructor() {
    this.fullname = localStorage.getItem('fullname');
    this.role = localStorage.getItem('role');
    this.getUserProfil();
  }

  ngOnInit(): void {
    this.spinner.show();

    this.breakpointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe((result) => {
        if (result.matches) {
          this.isLargeScreen = true;
          this.sidenavMode = 'side';
          this.isSidenavOpen = true;
          this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
              this.isSidenavOpen = true; // Fermer le sidenav après la navigation
            });
        } else {
          this.isLargeScreen = false;
          this.sidenavMode = 'over';
          this.isSidenavOpen = false;
          this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
              this.isSidenavOpen = false; // Fermer le sidenav après la navigation
            });
        }
      });

    setTimeout(() => {
      this.getImageUser();
    }, 1000);

    setTimeout(() => {
      this.spinner.hide(); // Cache le spinner lorsque les données sont chargées
    }, 1000);
  }

  //Gerer le basculement de la sidenav du dashboard
  toggleSidenav(): void {
    if (this.isLargeScreen) {
      this.isSidenavOpen = !this.isSidenavOpen;
    } else {
      this.isSidenavOpen = !this.isSidenavOpen;
    }
  }

  getUserProfil() {
    this.userService.getUserProfil().subscribe({
      next: (response) => {
        this.id = response.id;
        console.log(this.id);
      },
      error: (error) => {
        this.toastr.error(error.error.message);
      },
    });
  }

  //methode pour recuperer l'image
  getImageUser() {
    this.userService.getUserImageUrl(this.id).subscribe({
      next: (url) => {
        this.safeImageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  /**************SELECTEUR DE LANGUE **********************/
  isActive = false;
  selectedCountry = 'FR';

  toggleMenu() {
    this.isActive = !this.isActive;
  }

  selectOption(event: Event, country: string) {
    this.selectedCountry = country;
    this.isActive = false;
    this.changeLang(country);
  }

  /******************* AFFICHER ET MASQUER LE MODAL DES OPTIONS DU PROFILS ************************/
  isModalVisible: boolean = false;

  toggleModal(event: Event) {
    event.stopPropagation(); // Empêche la propagation du clic pour éviter de fermer la modal immédiatement
    this.isModalVisible = !this.isModalVisible;
  }

  closeModal() {
    this.isModalVisible = false;
  }

  onOptionSelectedProfil(event: Event) {
    this.closeModal(); // Ferme le modal après avoir sélectionné une option
  }

  onOptionSelectedDeconnexion(event: Event) {
    this.closeModal(); // Ferme le modal après avoir sélectionné une option
    this.authService.logout();
  }

  onOptionSelectedSetting(event: Event) {
    this.closeModal(); // Ferme le modal après avoir sélectionné une option
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Vérifiez si le clic s'est produit à l'intérieur de la modal ou du bouton "more-icon"
    const clickedInsideModal = target.closest('.list');
    const clickedOnButton = target.closest('.profil');

    if (!clickedInsideModal && !clickedOnButton) {
      this.isModalVisible = false;
    }
  }
}
