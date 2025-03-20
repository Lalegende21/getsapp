import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UpdateProfilComponent } from './update-profil/update-profil.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { UserService } from '../../../service/user.service';
import { User } from '../../../models/User.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-profil',
  imports: [CommonModule, MatIconModule],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss',
})
export class ProfilComponent implements OnInit {
  user!: User;
  id: number = 0;
  fullname!: string | null;
  width: string = '';
  firstname: string = '';
  lastname: string = '';
  email: string = '';
  phone: string = '';
  sexe: string = '';
  role: string = '';
  img!: File;
  safeImageUrl: SafeUrl = '';

  private dialog = inject(MatDialog);
  private userService = inject(UserService);
  private breakPointObserver = inject(BreakpointObserver);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private cdk = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);


  constructor() {
    this.fullname = localStorage.getItem('fullname');
    this.getUserProfil();
  }

  ngOnInit(): void {

    this.breakPointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe((result) => {
        if (result.matches) {
          this.width = '40%';
        } else {
          this.width = '80%';
        }
      });

    setTimeout(() => {
      this.getImageUser();
    }, 500);
  }

  getUserProfil() {
    this.userService.getUserProfil().subscribe({
      next: (response) => {
        this.id = response.id;
        this.user = response;
        this.firstname = response.firstname;
        this.lastname = response.lastname;
        this.email = response.email;
        this.phone = response.phone;
        this.sexe = response.sexe;
        this.role = response.role.libelle;
        localStorage.removeItem('fullname');
        const fullname = response.firstname + ' ' + response.lastname;
        localStorage.setItem('fullname', fullname);
      },
      error: (error) => {
        this.toastr.error(error.error.message);
      },
    });
  }

  //Methode pour recuperer l'image selectionnee
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.uploadImageUser(file);
      setTimeout(() => {
        this.getImageUser(); //Rafraichir l'image apres l'upload
        this.cdk.detectChanges();
      }, 500);
    } else {
      this.toastr.error('Veuillez selectionner une image valide!');
    }
  }

  //Methode pour enregistrer l'image
  uploadImageUser(image: File) {
    this.spinner.show();
    this.userService.uploadImageForUser(this.id, image).subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Image enregistrée avec succès!');
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
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

  updateProfil() {
    this.dialog
      .open(UpdateProfilComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: {
          id: this.id,
          firstname: this.firstname,
          lastname: this.lastname,
          phone: this.phone,
          sexe: this.sexe,
        },
      })
      .afterClosed()
      .subscribe(() => {
        setTimeout(() => {
          this.getUserProfil();
        }, 500);
      });
  }
}
