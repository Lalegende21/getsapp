import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CampusService } from '../../../../service/campus.service';
import { Center } from '../../../../models/center.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UpdateCampusComponent } from '../update-campus/update-campus.component';

@Component({
  selector: 'app-view-campus',
  imports: [CommonModule, MatIconModule, NgxSpinnerModule],
  templateUrl: './view-campus.component.html',
  styleUrl: './view-campus.component.scss',
})
export class ViewCampusComponent {
  center!: Center;
  id!: number;
  name!: string;
  localisation!: string;
  fileName!: string;
  width!: string;
  image!: any;
  safeImageUrl: SafeUrl = '';
  role: string | null;

  private router = inject(Router);
  private breakPointObserver = inject(BreakpointObserver);
  private activatedRoute = inject(ActivatedRoute);
  private campusService = inject(CampusService);
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
    this.getCenterById();
    this.getImageCenter();
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
    this.router.navigateByUrl('/dashboard/campus').then(() => {
      this.cdk.detectChanges();
      setTimeout(() => {
        this.campusService.getAllCenter();
        this.campusService.getAllCenterFrequently();
      }, 100);
    });
  }

  //Methode pour recuperer le campus
  getCenterById() {
    this.spinner.show();
    this.campusService.getCampusById(this.id).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 500);
        this.center = response;
        this.name = response.name;
        this.localisation = response.localisation;
        this.fileName = response.image?.split('\\').pop() ?? 'null';
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 500);
        this.toastr.error(error.error.message)
      },
    });
  }

  //Methode pour enregistrer l'image
  uploadImageCenter(image: File) {
    this.spinner.show();
    this.campusService.uploadImageForCenter(this.id, image).subscribe({
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

  //Methode pour recuperer l'image selectionnee
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.uploadImageCenter(file);
      setTimeout(() => {
        this.getImageCenter(); //Rafraichir l'image apres l'upload
        this.cdk.detectChanges();
      }, 500);
    } else {
      this.toastr.error('Veuillez selectionner une image valide!');
    }
  }

  //methode pour recuperer l'image
  getImageCenter() {
    this.campusService.getCenterImageUrl(this.id).subscribe({
      next: (url) => {
        this.safeImageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
      },
    });
  }

  //Methode pour modifier un centre
  updateCenter(name: string, localisation: string) {
    this.dialog
      .open(UpdateCampusComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: { name, localisation, id: this.id },
      })
      .afterClosed()
      .subscribe(() => {
        this.getCenterById();
      });
  }
}
