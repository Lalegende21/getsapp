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
import { AddStudentComponent } from './add-student/add-student.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ActivatedRoute, Router } from '@angular/router';
import { TuteurService } from '../../../../service/tuteur.service';
import { Tutor } from '../../../../models/Tutor.models';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Student } from '../../../../models/Student.model';

@Component({
  selector: 'app-see-tutor',
  imports: [CommonModule, MatIconModule],
  standalone: true,
  templateUrl: './see-tutor.component.html',
  styleUrl: './see-tutor.component.scss',
})
export class SeeTutorComponent implements OnInit {
  isModalVisible: boolean[] = [false, false, false, false, false];
  width!: string;
  id: number = 0;
  tutor!: Tutor;
  fullname: string = '';
  email: string = '';
  phonenumber: string = '';
  typeTutor: string = '';
  safeImageUrl: SafeUrl = '';
  image!: any;
  student: Student[] = [];
  studentTotal: number = 0;
  role: string | null;

  private dialog = inject(MatDialog);
  private breakPointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private tutorService = inject(TuteurService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private cdk = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);
  private ngZone = inject(NgZone);

  constructor() {
    this.id = this.activatedRoute.snapshot.params['id'];
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

    this.getTutor();
    this.getImageTutor();
    this.getStudentByTutor();
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Fermez tous les modals si le clic est en dehors d'un modal et d'un bouton
    if (!target.closest('.modal') && !target.closest('.more-icon')) {
      this.isModalVisible = [false, false, false, false, false];
    }
  }

  //Methode pour recuperer l'image selectionnee
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.uploadImageTutor(file);
      setTimeout(() => {
        this.getImageTutor(); //Rafraichir l'image apres l'upload
        this.cdk.detectChanges();
      }, 500);
    } else {
      this.toastr.error('Veuillez selectionner une image valide!');
    }
  }

  //methode pour recuperer l'image
  getImageTutor() {
    this.tutorService.getTutorImageUrl(this.id).subscribe({
      next: (url) => {
        this.safeImageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
      },
    });
  }

  //Methode pour enregistrer l'image
  uploadImageTutor(image: File) {
    this.spinner.show();
    this.tutorService.uploadImageForTutor(this.id, image).subscribe({
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

  //Methode pour ouvrir le modal d'ajout d'un student
  addStudentToTutor() {
    this.dialog
      .open(AddStudentComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '500ms',
        width: this.width,
        data: { id: this.id },
      })
      .afterClosed()
      .subscribe(() => {
        setTimeout(() => {
          this.ngZone.run(() => {
            this.getTutor();
            this.getStudentByTutor();
          });
        }, 500);
      });
  }

  //Methode pour revenir sur la page precedente
  backPage() {
    this.router.navigateByUrl('/dashboard/tuteur');
  }

  consulterStudent(id: number) {
    this.router.navigateByUrl('/dashboard/etudiant/' + id);
  }

  getTutor() {
    this.tutorService.getTutorById(this.id).subscribe({
      next: (response) => {
        this.tutor = response;
        this.fullname = response.fullname;
        this.email = response.email;
        this.phonenumber = response.phonenumber;
        this.typeTutor = response.typeTutor;
      },
      error: (error) => {
        this.toastr.error(error.error.message);
      },
    });
  }

  getStudentByTutor() {
    this.tutorService.getStudentbyTutor(this.id).subscribe({
      next: (response) => {
        this.student = response;
        this.studentTotal = this.student.length;
      },
      error: (error) => {
        this.toastr.error(error.error.message);
      },
    });
  }

  deleteStudentToTutor(student: Student) {
    this.spinner.show();
    this.tutorService.removeStudentToTutor(this.id, student.id).subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.getStudentByTutor();
        this.toastr.success('Etudiant supprimé avec succès!');
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
