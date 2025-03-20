import { Component, inject, OnInit } from '@angular/core';
import { SessionService } from '../../../service/session.service';
import { FormationService } from '../../../service/formation.service';
import { Session } from '../../../models/session.model';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Formation } from '../../../models/fomation.model';
import { StudentService } from '../../../service/student.service';
import { Student } from '../../../models/Student.model';

@Component({
  selector: 'app-statistique',
  imports: [CommonModule, FormsModule],
  templateUrl: './statistique.component.html',
  styleUrl: './statistique.component.scss',
})
export class StatistiqueComponent implements OnInit {
  sessions: Session[] = [];
  filteredSessions: Session[] = [];
  filteredSessionsFinance: Session[] = [];
  sessionTotale: number = 0;
  sessionEnCours: number = 0;
  sessionCompletees: number = 0;

  formations: Formation[] = [];
  filteredFormations: Formation[] = [];
  formationsTotal: number = 0;

  students: Student[] = [];
  filteredStudent: Student[] = [];
  studentTotal: number = 0;
  montantTotal: number = 0;
  montantPaye: number = 0;
  montantRestant: number = 0;

  filteredFinance: Session[] = [];
  totalMontantAttendu: number = 0;
  totalMontantPaye: number = 0;
  totalMontantRestant: number = 0;

  currentPageSession = 1;
  currentPageSessionFinance = 1;
  currentPageFormation = 1;
  pageSize = 2;
  pageSizeFinance = 5;
  searchTerm: string = '';
  searchTermFinance: string = '';

  private sessionService = inject(SessionService);
  private formationService = inject(FormationService);
  private studentService = inject(StudentService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.getAllSessions();
    this.getAllFormations();
    this.getAllStudent();
  }

  //Methode pour recuperer toutes les sessions
  getAllSessions() {
    this.sessionService.getAllSession().subscribe({
      next: (response) => {
        this.sessions = response;
        this.filteredSessions = response;
        this.filteredSessionsFinance = response;
        this.sessionTotale = response.length;
        // Compter les sessions avec les statuts 'active' et 'pause'
        const activeAndPauseSessions = response.filter(
          (session: any) =>
            session.statuts === 'ACTIVE' || session.statuts === 'PAUSE'
        );
        this.sessionEnCours = activeAndPauseSessions.length;
        // Compter les sessions avec le statut 'completee'
        const completeSessions = response.filter(
          (session: any) => session.statuts === 'COMPLETEE'
        );
        this.sessionCompletees = completeSessions.length;

        // récupération des étudiants pour chaque session
        this.sessions.forEach((session: any) => {
          this.getStudentBySession(session.id);
        });

        // Réinitialiser la pagination sur la première page
        this.currentPageSession = 1;
      },
      error: () => {
        this.toastr.error('Impossible de recupérer la liste des sessions');
      },
    });
  }

  getStudentBySession(id: number) {
    return this.sessionService.getAllStudentBySession(id).subscribe({
      next: (response) => {
        // Trouver la session correspondante
        const session = this.sessions.find((s: any) => s.id === id);
        if (session) {
          session.students = response; // Stocker les étudiants dans la session
          session.studentCount = response.length; // Nombre d'étudiants

          // Calculer le montant total attendu
          session.totalMontantAttendu = response.reduce(
            (
              total: number,
              student: { montantAfterReduction: number; montantTotal: number }
            ) => {
              const montant =
                student.montantAfterReduction != null
                  ? student.montantAfterReduction
                  : student.montantTotal || 0;
              return total + montant;
            },
            0
          );

          session.totalReduction = response.reduce(
            (total: number, student: { reduction: number }) => {
              return total + (student.reduction || 0);
            },
            0
          );

          session.totalMontantPaye = response.reduce(
            (total: number, student: { montantPaye: number }) => {
              return total + (student.montantPaye || 0);
            },
            0
          );

          session.totalMontantRestant = response.reduce(
            (total: number, student: { montantRestantaPayer: number }) => {
              return total + (student.montantRestantaPayer || 0);
            },
            0
          );
        }
      },
      error: () => {
        this.toastr.error(
          `Impossible de récupérer les étudiants pour la session ${id}`
        );
      },
    });
  }

  //Methode pour lister les formation
  getAllFormations() {
    this.formationService.getAllFormation().subscribe({
      next: (response) => {
        this.formations = response;
        this.filteredFormations = response;
        this.formationsTotal = response.length;

        // récupération des étudiants pour chaque formation
        this.formations.forEach((formation: any) => {
          this.getStudentByFormation(formation.id);
        });

        // Réinitialiser la pagination sur la première page
        this.currentPageFormation = 1;
      },
      error: (error) => {
        console.log(error);
        this.toastr.error('Impossible de recupérer la liste des formations');
      },
    });
  }

  getStudentByFormation(id: number) {
    return this.formationService.getAllStudentByFormation(id).subscribe({
      next: (response) => {
        // Trouver la formation correspondante
        const formation = this.formations.find((s: any) => s.id === id);
        if (formation) {
          formation.students = response; // Stocker les étudiants dans la session
          formation.studentCount = response.length; // Nombre d'étudiants
        }
      },
      error: () => {
        this.toastr.error(
          `Impossible de récupérer les étudiants pour la formation ${id}`
        );
      },
    });
  }

  //Methode pour lister les etudiant
  getAllStudent() {
    this.studentService.getAllStudent().subscribe({
      next: (response) => {
        this.students = response;
        this.studentTotal = response.length;
        this.filteredStudent = response;
        this.montantTotal = this.students.reduce((total, student) => {
          const price =
            student.montantAfterReduction ?? student.montantTotal ?? 0;
          return total + price;
        }, 0);

        this.montantPaye = this.students.reduce((total, student) => {
          // Si la formation existe et qu'il y a un prix
          const price = student.montantPaye || 0;
          return total + price;
        }, 0);

        this.montantRestant = this.montantTotal - this.montantPaye;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  //   start pagination
  get totalPagesSessions(): number {
    return Math.ceil(this.filteredSessions.length / this.pageSize);
  }

  get totalPagesFormations(): number {
    return Math.ceil(this.filteredFormations.length / this.pageSize);
  }

  get totalPagesSessionsFinances(): number {
    return Math.ceil(this.filteredSessionsFinance.length / this.pageSizeFinance);
  }

  get paginatedSessions() {
    const startIndex = (this.currentPageSession - 1) * this.pageSize;
    return this.filteredSessions.slice(startIndex, startIndex + this.pageSize);
  }

  get paginatedFormations() {
    const startIndex = (this.currentPageFormation - 1) * this.pageSize;
    return this.filteredFormations.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  get paginatedSessionsFinance() {
    const startIndex =
      (this.currentPageSessionFinance - 1) * this.pageSizeFinance;
    return this.filteredSessionsFinance.slice(
      startIndex,
      startIndex + this.pageSizeFinance
    );
  }

  filterSessions() {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredSessions = [...this.sessions];
    } else {
      this.filteredSessions = this.sessions.filter((session) =>
        session.dateDebut.toLowerCase().includes(term)
      );
    }

    // On revient sur la première page après un filtre
    this.currentPageSession = 1;
  }

  filterSessionsFinance() {
    const termFinance = this.searchTermFinance.trim().toLowerCase();

    if (!termFinance) {
      this.filteredSessionsFinance = [...this.sessions];
    } else {
      this.filteredSessionsFinance = this.sessions.filter((session) =>
        session.dateDebut.toLowerCase().includes(termFinance)
      );
    }

    // On revient sur la première page après un filtre
    this.currentPageSessionFinance = 1;
  }

  filterFormations() {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredFormations = [...this.formations];
    } else {
      this.filteredFormations = this.formations.filter((formation) =>
        formation.specialite.toLowerCase().includes(term)
      );
    }

    // On revient sur la première page après un filtre
    this.currentPageFormation = 1;
  }

  nextPageSessions() {
    if (this.currentPageSession < this.totalPagesSessions) {
      this.currentPageSession++;
    }
  }

  nextPageFormations() {
    if (this.currentPageFormation < this.totalPagesFormations) {
      this.currentPageFormation++;
    }
  }

  nextPageSessionsFinance() {
    if (this.currentPageSessionFinance < this.totalPagesSessionsFinances) {
      this.currentPageSessionFinance++;
    }
  }

  previousPageSession() {
    if (this.currentPageSession > 1) {
      this.currentPageSession--;
    }
  }

  previousPageFormation() {
    if (this.currentPageFormation > 1) {
      this.currentPageFormation--;
    }
  }

  previousPageSessionFinance() {
    if (this.currentPageSessionFinance > 1) {
      this.currentPageSessionFinance--;
    }
  }
  //   end pagination
}
