import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateProfessorComponent } from '../update-professor/update-professor.component';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ProfessorService } from '../../../../service/professor.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Professor } from '../../../../models/Professor.model';

@Component({
  selector: 'app-see-professor',
  imports: [CommonModule, MatIconModule],
  templateUrl: './see-professor.component.html',
  styleUrl: './see-professor.component.scss',
})
export class SeeProfessorComponent implements OnInit {
  width!: string;
  id: number;
  professor!: Professor;
  fullname!: string;
  email!: string;
  phoneNumber!: string;
  cni!: string;
  sexe!: string;
  image!: any;
  safeImageUrl: SafeUrl = '';
  role: string | null;

  private dialog = inject(MatDialog);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private professorService = inject(ProfessorService);
  private breakPointObserver = inject(BreakpointObserver);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private cdk = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.role = localStorage.getItem('role');
  }

  ngOnInit(): void {
    this.getProfessorById();
    this.getImageProfessor();
    this.breakPointObserver
      .observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .subscribe((result) => {
        if (result.matches) {
          this.width = '30%';
        } else {
          this.width = '80%';
        }
      });
  }

  //Methode pour revenir sur la page precedente
  backPage() {
    this.router.navigateByUrl('/dashboard/professeur').then(() => {
      this.cdk.detectChanges();
      setTimeout(() => {
        this.professorService.getAllProfessor();
        this.professorService.GetAllProfessorFrequently();
      }, 100);
    });
  }

  //Methode pour recuperer le professeur
  getProfessorById() {
    this.spinner.show();
    this.professorService.getProfessorById(this.id).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 800);
        this.professor = response;
        this.fullname = response.fullname;
        this.email = response.email;
        this.phoneNumber = response.phoneNumber;
        this.cni = response.cni;
        this.sexe = response.sexe;
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 800);
        this.toastr.error(error.error.message);
      },
    });
  }

  //Methode pour recuperer l'image selectionnee
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.uploadImageProfessor(file);
      setTimeout(() => {
        this.getImageProfessor(); //Rafraichir l'image apres l'upload
        this.cdk.detectChanges();
      }, 500);
    } else {
      this.toastr.error('Veuillez selectionner une image valide!');
    }
  }

  //methode pour recuperer l'image
  getImageProfessor() {
    this.professorService.getProfessorImageUrl(this.id).subscribe({
      next: (url) => {
        this.safeImageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
      },
    });
  }

  //Methode pour enregistrer l'image
  uploadImageProfessor(image: File) {
    this.spinner.show();
    this.professorService.uploadImageForProfessor(this.id, image).subscribe({
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

  //Methode pour ouvrir le modal de modification d'un professeur
  updateProfessor() {
    this.dialog
      .open(UpdateProfessorComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: {
          id: this.id,
          fullname: this.fullname,
          email: this.email,
          phoneNumber: this.phoneNumber,
          cni: this.cni,
          sexe: this.sexe,
        },
      })
      .afterClosed()
      .subscribe(() => {
        this.getProfessorById();
      });
  }
}
