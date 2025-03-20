import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SessionService } from '../../../service/session.service';
import { FormationService } from '../../../service/formation.service';
import { StudentService } from '../../../service/student.service';
import { SpecificiteService } from '../../../service/specificiteFormation.service';
import { CampusService } from '../../../service/campus.service';
import { PaiementService } from '../../../service/paiement.service';
import { CourseService } from '../../../service/course.service';
import { StartCourseService } from '../../../service/start-course.service';
import { ProfessorService } from '../../../service/professor.service';
import { TuteurService } from '../../../service/tuteur.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-parametres',
  imports: [MatIconModule],
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.scss',
})
export class ParametresComponent {
  private sessionService = inject(SessionService);
  private studentService = inject(StudentService);
  private formationService = inject(FormationService);
  private specificite = inject(SpecificiteService);
  private campusService = inject(CampusService);
  private paiementService = inject(PaiementService);
  private courseService = inject(CourseService);
  private startCourseService = inject(StartCourseService);
  private professorService = inject(ProfessorService);
  private tutorService = inject(TuteurService);
  private spinner = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);

  deleteAllSession() {
    this.spinner.show();
    this.sessionService.deleteAllSessions().subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Sessions supprimées avec succès!');
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.error(error.error.message);
      },
    });
  }

  deleteAllStudent() {
    this.spinner.show();
    this.studentService.deleteAllStudent().subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Etudiants supprimés avec succès!');
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.error(error.error.message);
      },
    });
  }

  deleteAllFormation() {
    this.spinner.show();
    this.formationService.deleteFormation().subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Formations supprimées avec succès!');
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.error(error.error.message);
      },
    });
  }

  deleteAllSpecificte() {
    this.spinner.show();
    this.specificite.deleteAllSpecificite().subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Specificités supprimées avec succès!');
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.error(error.error.message);
      },
    });
  }

  deleteAllCampus() {
    this.spinner.show();
    this.campusService.deleteCampus().subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Campus supprimés avec succès!');
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.error(error.error.message);
      },
    });
  }

  deleteAllPaiement() {
    this.spinner.show();
    this.paiementService.deletePaiement().subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Paiements supprimés avec succès!');
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.error(error.error.message);
      },
    });
  }

  deleteAllCourse() {
    this.spinner.show();
    this.courseService.deleteCourse().subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Matières supprimées avec succès!');
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.error(error.error.message);
      },
    });
  }

  deleteAllStartCourse() {
    this.spinner.show();
    this.startCourseService.deleteAllStartCourse().subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Matières demarrées supprimées avec succès!');
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.error(error.error.message);
      },
    });
  }

  deleteAllProfessor() {
    this.spinner.show();
    this.professorService.deleteProfessor().subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Professeurs supprimés avec succès!');
      },
      error: (error) => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.error(error.error.message);
      },
    });
  }

  deleteAllTuteur() {
    this.spinner.show();
    this.tutorService.deleteTutor().subscribe({
      next: () => {
        setTimeout(() => {
          this.spinner.hide();
        }, 2000);
        this.toastr.success('Tuteurs supprimés avec succès!');
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
