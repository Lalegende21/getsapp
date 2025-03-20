import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '../../../../service/session.service';
import { Session } from '../../../../models/session.model';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { UpdateSessionComponent } from '../update-session/update-session.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-view-session',
  imports: [CommonModule, MatIconModule, NgxSpinnerModule],
  templateUrl: './view-session.component.html',
  styleUrl: './view-session.component.scss',
})
export class ViewSessionComponent implements OnInit {
  dateDebut: string = '';
  statut: string = '';
  center: string = '';
  id: number;
  session!: Session;
  fileName: string = '';
  width: string = '';
  role: string | null;
  img!: File;
  safeImageUrl: SafeUrl = '';

  private router = inject(Router);
  private breakPointObserver = inject(BreakpointObserver);
  private activatedRoute = inject(ActivatedRoute);
  private sessionService = inject(SessionService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private sanitizer = inject(DomSanitizer);
  private dialog = inject(MatDialog);
  private cdk = inject(ChangeDetectorRef);

  constructor() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.role = localStorage.getItem('role');
  }

  ngOnInit(): void {
    this.getSessionById();
    this.getImageSession();

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

  backPage() {
    this.router.navigateByUrl('/dashboard/session').then(() => {
      this.cdk.detectChanges();
      setTimeout(() => {
        this.sessionService.getAllSession();
        this.sessionService.getAllSessionFrequently();
      }, 100);
    });
  }

  //Methode pour recuperer la session
  getSessionById() {
    this.spinner.show();
    this.sessionService.getSessionById(this.id).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 800);
        this.session = response;
        this.dateDebut = response.dateDebut;
        this.statut = response.statuts;
        this.center = response.center.name;
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 800);
        console.log(error);
      },
    });
  }

  //Methode pour recuperer l'image selectionnee
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.uploadImageSession(file);
      setTimeout(() => {
        this.getImageSession(); //Rafraichir l'image apres l'upload
        this.cdk.detectChanges();
      }, 500);
    } else {
      this.toastr.error('Veuillez selectionner une image valide!');
    }
  }

  //Methode pour enregistrer l'image
  uploadImageSession(image: File) {
    this.spinner.show();
    this.sessionService.uploadImageForSession(this.id, image).subscribe({
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
  getImageSession() {
    this.sessionService.getSessionImageUrl(this.id).subscribe({
      next: (url) => {
        this.safeImageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
      },
    });
  }

  updateSession(dateDebut: string, statut: string) {
    this.dialog
      .open(UpdateSessionComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: { id: this.id, dateDebut, statut },
      })
      .afterClosed()
      .subscribe(() => {
        this.getSessionById();
      });
  }
}
