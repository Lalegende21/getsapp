import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../../models/User.model';
import { UserService } from '../../../../service/user.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../../../service/auth.service';

@Component({
  selector: 'app-update-role-user',
  imports: [CommonModule, MatIconModule],
  templateUrl: './update-role-user.component.html',
  styleUrl: './update-role-user.component.scss',
})
export class UpdateRoleUserComponent implements OnInit {
  id: number;
  currentRole: string = '';
  user!: User;

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);

  constructor() {
    this.id = this.activatedRoute.snapshot.params['id'];
  }
  ngOnInit(): void {
    this.getUser();
  }

  //Methode pour revenir sur la page precedente
  backPage() {
    this.router.navigateByUrl('/dashboard/liste-utilisateurs/' + this.id);
  }

  getUser() {
    this.userService.getUserById(this.id).subscribe({
      next: (response) => {
        this.user = response;
        this.currentRole = response.role.libelle;
      },
      error: (error) => {
        this.toastr.error(error.error.message);
      },
    });
  }

  getRoleVisiteur(role: string) {
    console.log(role);
    return role;
  }
  getRoleContributeur(role: string) {
    console.log(role);
    return role;
  }
  getRoleEditeur(role: string) {
    console.log(role);
    return role;
  }
  getRoleManageur(role: string) {
    console.log(role);
    return role;
  }
  getRoleAdministrateur(role: string) {
    console.log(role);
    return role;
  }

  updateRole(rule: string) {
    if (this.currentRole === rule) {
      this.toastr.info('Ce rôle est déjà attribué.');
    } else {
      this.spinner.show();
      const formData = {
        id: this.id,
        role: rule,
      };
      this.userService.changeUserRole(formData).subscribe({
        next: (response) => {
          setTimeout(() => {
            this.spinner.hide();
          }, 2000);
          const role = response.role.libelle;
          if (role === 'ADMINISTRATEUR') {
            this.toastr.success('Rôle modifié avec succès!');
            setTimeout(() => {
              this.toastr.success(
                'Vous allez être deconnecté pour actualiser les changements!'
              );
            }, 2500);
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3500);
          } else {
            this.toastr.success('Rôle modifié avec succès!');
            this.router.navigate(['/dashboard/liste-utilisateurs/' + this.id]);
          }
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
}
