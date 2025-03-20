import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnInit,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../service/user.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-voir-utilisateur',
  imports: [CommonModule, MatIconModule],
  templateUrl: './voir-utilisateur.component.html',
  styleUrl: './voir-utilisateur.component.scss',
})
export class VoirUtilisateurComponent implements OnInit {
  id: number;
  firstname: string = '';
  lastname: string = '';
  email: string = '';
  phone: string = '';
  genre: string = '';
  role: string = '';
  safeImageUrl: SafeUrl = '';

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private userService = inject(UserService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private cdk = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);
  private ngZone = inject(NgZone);

  constructor() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.getUser();
  }
  ngOnInit(): void {
    setTimeout(() => {
      this.getImageUser();
    }, 500);
  }

  //Methode pour revenir sur la page precedente
  backPage() {
    this.router.navigateByUrl('/dashboard/liste-utilisateurs');
  }

  getUser() {
    this.userService.getUserById(this.id).subscribe({
      next: (response) => {
        this.firstname = response.firstname;
        this.lastname = response.lastname;
        this.email = response.email;
        this.phone = response.phone;
        this.genre = response.sexe;
        this.role = response.role.libelle;
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
    });
  }

  updateUserRole() {
    this.router.navigate([
      '/dashboard/liste-utilisateur',
      this.id,
      'update-role',
    ]);
  }
}
