import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StartCourseService } from '../../../../service/start-course.service';
import { StartCourse } from '../../../../models/startCourse.model';
import { UpdateSTartCourseComponent } from '../update-start-course/update-start-course.component';
import { CancelStartCourseComponent } from './cancel-start-course/cancel-start-course.component';

@Component({
  selector: 'app-voir-matiere',
  imports: [MatIconModule],
  templateUrl: './voir-matiere.component.html',
  styleUrl: './voir-matiere.component.scss',
})
export class VoirMatiereComponent implements OnInit {
  id: number = 0;
  width: string = '';
  startCourse!: StartCourse;
  course: string = '';
  duree: string = '';
  professor: string = '';
  statut: string = '';
  session: string = '';
  horaire: string = '';
  startDate: string = '';
  endDate: string = '';
  role: string | null;

  private router = inject(Router);
  private breakPointObserver = inject(BreakpointObserver);
  private activatedRoute = inject(ActivatedRoute);
  private startCourseService = inject(StartCourseService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);
  private cdk = inject(ChangeDetectorRef);

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

    this.getStartCourseById();
  }

  getStartCourseById() {
    this.startCourseService.getStartCourseById(this.id).subscribe({
      next: (data) => {
        this.startCourse = data;
        this.course = data.course.name;
        this.duree = data.course.duree;
        this.professor = data.professor.fullname;
        this.statut = data.statut;
        this.session = data.session.dateDebut;
        this.horaire = data.horaire;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
      },
      error: (error) => {
        this.toastr.error(error.error.message);
      },
    });
  }

  backPage() {
    this.router.navigateByUrl('/dashboard/demarrer-matiere');
  }

  updateStartCourse() {
    this.dialog
      .open(UpdateSTartCourseComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: { id: this.id },
      })
      .afterClosed()
      .subscribe(() => {
        this.getStartCourseById();
        this.cdk.detectChanges();
      });
  }

  cancelStatutStartCourse() {
    this.dialog
      .open(CancelStartCourseComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: { id: this.id, startCourse: this.startCourse },
      })
      .afterClosed()
      .subscribe(() => {
        this.getStartCourseById();
        this.cdk.detectChanges();
      });
  }
}
