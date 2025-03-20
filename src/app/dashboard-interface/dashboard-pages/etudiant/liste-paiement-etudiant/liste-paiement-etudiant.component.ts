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
import { StudentService } from '../../../../service/student.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Paiement } from '../../../../models/paiement.model';
import { MatDialog } from '@angular/material/dialog';
import { UpdatePaiementStudentComponent } from '../update-paiement-student/update-paiement-student.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Student } from '../../../../models/Student.model';
import { catchError, filter, of, tap } from 'rxjs';

@Component({
  selector: 'app-liste-paiement-etudiant',
  imports: [CommonModule, MatIconModule],
  templateUrl: './liste-paiement-etudiant.component.html',
  styleUrl: './liste-paiement-etudiant.component.scss',
})
export class ListePaiementEtudiantComponent implements OnInit {
  id: number;
  nom: string = '';
  paiements: Paiement[] = [];
  paiement!: Paiement;
  width: string = '';

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  private dialog = inject(MatDialog);
  private breakPointObserver = inject(BreakpointObserver);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private ngZone = inject(NgZone);
  private cdk = inject(ChangeDetectorRef);

  constructor() {
    this.id = this.activatedRoute.snapshot.params['id'];
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

    this.getAllPaiements();
  }

  //Methode pour revenir sur la page precedente
  backPage() {
    this.router.navigateByUrl('/dashboard/etudiant/' + this.id);
  }

  //Methode pour recuperer tous les paiements
  getAllPaiements() {
    this.spinner.show();
    this.studentService.getStudentPaiement(this.id).subscribe({
      next: (data) => {
        this.paiements = data;
        setTimeout(() => {
          this.spinner.hide();
          this.cdk.detectChanges();
        }, 2000);
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.error(error.error.message);
      },
    });
  }

  // Méthode pour récupérer un paiement spécifique par son ID
  getPaiementById(paiementId: number) {
    return this.paiements.find((paiement) => paiement.id === paiementId);
  }

  //Methode pour modifier un paiement
  updatePaiement(id: number, student: Student) {
    const dialogRef = this.dialog.open(UpdatePaiementStudentComponent, {
      enterAnimationDuration: '500ms',
      exitAnimationDuration: '300ms',
      width: this.width,
      data: { id, student },
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((result) => !!result), // Ne met à jour que si un changement a été fait
        tap(() => this.getAllPaiements()), // Recharge les paiements
        catchError(() => {
          return of(null); // Empêche le plantage en cas d'erreur
        })
      )
      .subscribe();
  }
}
