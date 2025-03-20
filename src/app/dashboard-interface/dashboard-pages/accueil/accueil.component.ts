import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { Chart, registerables } from 'chart.js';
import { SessionService } from '../../../service/session.service';
import { StudentService } from '../../../service/student.service';
import { FormationService } from '../../../service/formation.service';
import { CampusService } from '../../../service/campus.service';
import { CourseService } from '../../../service/course.service';
import { ProfessorService } from '../../../service/professor.service';
import { Session } from '../../../models/session.model';
import { Student } from '../../../models/Student.model';
import { Formation } from '../../../models/fomation.model';
import { Center } from '../../../models/center.model';
import { Course } from '../../../models/course.model';
import { Professor, Professors } from '../../../models/Professor.model';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
} from 'ng-apexcharts';
import { PaiementService } from '../../../service/paiement.service';
import { Paiement } from '../../../models/paiement.model';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-accueil',
  providers: [provideNativeDateAdapter()],
  imports: [
    MatIconModule,
    MatNativeDateModule,
    MatDatepickerModule,
    CommonModule,
    NgxSpinnerModule,
    NgApexchartsModule,
  ],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.scss',
})
export class AccueilComponent implements OnInit {
  @ViewChild('chartStudent')
  chartStudent!: ChartComponent;
  public chartOptionsStudent: ChartOptions;

  @ViewChild('chartPaiement')
  chartPaiement!: ChartComponent;
  public chartOptionsPaiement: ChartOptions;

  sessions: Session[] = [];
  students: Student[] = [];
  formations: Formation[] = [];
  centers: Center[] = [];
  courses: Course[] = [];
  professors: Professors[] = [];
  paiements: Paiement[] = [];

  lastSession!: Session;
  lastStudent!: Student;
  lastFormation!: Formation;
  lastCenter!: Center;
  lastCourse!: Course;
  lastProfessor!: Professor;

  totalSession: number = 0;
  totalStudent: number = 0;
  totalFormation: number = 0;
  totalCenter: number = 0;
  totalCourse: number = 0;
  totalProfessors: number = 0;

  fullname!: string | null;

  private sessionService = inject(SessionService);
  private studentService = inject(StudentService);
  private formationService = inject(FormationService);
  private centerService = inject(CampusService);
  private courseService = inject(CourseService);
  private professorService = inject(ProfessorService);
  private paiementService = inject(PaiementService);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private cdr = inject(ChangeDetectorRef);

  studentsByMonth: any;
  studentCounts: any[] = [];
  monthsInRange: string[] = [];
  monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  constructor() {
    //Graphique etudiant
    this.chartOptionsStudent = {
      series: [
        {
          name: 'etudiant',
          data: [31, 40, 28, 51, 42, 109, 100],
          color: '#f5d333',
        },
      ],
      chart: {
        height: 350,
        type: 'area',
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        type: 'datetime',
        categories: [
          '2018-09-19T00:00:00.000Z',
          '2018-09-19T01:30:00.000Z',
          '2018-09-19T02:30:00.000Z',
          '2018-09-19T03:30:00.000Z',
          '2018-09-19T04:30:00.000Z',
          '2018-09-19T05:30:00.000Z',
          '2018-09-19T06:30:00.000Z',
        ],
      },
      tooltip: {
        x: {
          format: 'MM/yyyy',
        },
      },
    };

    //Graphique paiement
    this.chartOptionsPaiement = {
      series: [
        {
          name: 'series1',
          data: [31, 40, 28, 51, 42, 109, 100],
          color: '#f5d333',
        },
      ],
      chart: {
        height: 350,
        type: 'area',
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        type: 'datetime',
        categories: [
          '2018-09-19T00:00:00.000Z',
          '2018-09-19T01:30:00.000Z',
          '2018-09-19T02:30:00.000Z',
          '2018-09-19T03:30:00.000Z',
          '2018-09-19T04:30:00.000Z',
          '2018-09-19T05:30:00.000Z',
          '2018-09-19T06:30:00.000Z',
        ],
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm',
        },
      },
    };
  }

  public generateData(
    baseval: number,
    count: number,
    yrange: { max: number; min: number }
  ) {
    var i = 0;
    var series = [];
    while (i < count) {
      var x = Math.floor(Math.random() * (750 - 1 + 1)) + 1;
      var y =
        Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
      var z = Math.floor(Math.random() * (75 - 15 + 1)) + 15;

      series.push([x, y, z]);
      baseval += 86400000;
      i++;
    }
    return series;
  }

  ngOnInit(): void {
    this.fullname = localStorage.getItem('fullname');
    this.spinner.show();

    setTimeout(() => {
      this.spinner.hide();
    }, 1000);

    this.getAllStudent();
    this.getAllCenter();
    this.getAllCourse();
    this.getAllFormations();
    this.getAllProfessor();
    this.getAllSessions();
    this.getAllPaiement();
  }

  //Methode pour recuperer la listes des centres
  getAllCenter() {
    this.centerService.getAllCenter().subscribe({
      next: (response) => {
        this.centers = response;
        this.totalCenter = response.length;
        this.lastCenter = response[0];
      },
      error: () => {
        this.toastr.error('Impossible de recupérer la liste des centres');
      },
    });
  }

  //Methode pour recuperer la listes des etudiants
  getAllStudent() {
    this.studentService.getAllStudent().subscribe({
      next: (response) => {
        this.students = response;
        this.totalStudent = response.length;
        this.lastStudent = response[0];

        // Mise à jour des données du graphique avec le nombre d'étudiants des 6 derniers mois
        this.updateChartWithMonthlyData(response);
      },
      error: () => {
        this.toastr.error('Impossible de recupérer la liste des étudiants');
      },
    });
  }

  updateChartWithMonthlyData(students: any[]) {
    // Obtenir la date actuelle
    const currentDate = new Date();
    // Tableau pour stocker les 6 derniers mois (format: MM/YYYY)
    const lastSixMonths: string[] = [];
    // Tableau pour stocker le nombre d'étudiants par mois
    const monthlyData: number[] = [];
    // Tableau pour stocker les dates au format ISO pour les catégories du graphique
    const categories = [];

    // Générer les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);

      // Format MM/YYYY pour l'affichage
      const monthYear = `${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`;
      lastSixMonths.push(monthYear);

      // Format ISO pour les catégories du graphique
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      categories.push(firstDayOfMonth.toISOString());

      // Initialiser le compteur d'étudiants pour ce mois à 0
      monthlyData.push(0);
    }

    // Compter les étudiants par mois de création
    students.forEach((student) => {
      if (student.createDate) {
        const studentDate = new Date(student.createDate);
        const studentMonthYear = `${(studentDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}/${studentDate.getFullYear()}`;

        // Vérifier si la date est dans les 6 derniers mois
        const monthIndex = lastSixMonths.indexOf(studentMonthYear);
        if (monthIndex !== -1) {
          monthlyData[monthIndex]++;
        }
      }
    });

    // Mettre à jour le graphique
    this.chartOptionsStudent = {
      series: [
        {
          name: 'étudiants',
          data: monthlyData,
          color: '#f5d333',
        },
      ],
      chart: {
        height: 350,
        type: 'area',
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        type: 'datetime',
        categories: categories,
      },
      tooltip: {
        x: {
          format: 'MM/yyyy',
        },
      },
    };

    // Si vous utilisez ApexCharts et que vous avez une référence au graphique
    if (this.chartStudent) {
      this.chartStudent.updateOptions(this.chartOptionsStudent);
    }
  }

  //Methode pour recuperer la listes des formations
  getAllFormations() {
    this.formationService.getAllFormation().subscribe({
      next: (response) => {
        this.formations = response;
        this.totalFormation = response.length;
        this.lastFormation = this.formations[0];
      },
      error: () => {
        this.toastr.error('Impossible de recupérer la liste des formations');
      },
    });
  }

  //Methode pour recuperer toutes les matieres
  getAllCourse() {
    this.courseService.getAllCourse().subscribe({
      next: (response) => {
        this.courses = response;
        this.totalCourse = response.length;
        this.lastCourse = response[0];
      },
      error: () => {
        this.toastr.error('Impossible de recupérer la liste des matières');
      },
    });
  }

  //Methode pour recuperer tous les professeurs
  getAllProfessor() {
    this.professorService.getAllProfessor().subscribe({
      next: (response) => {
        this.professors = response;
        this.totalProfessors = response.length;
        this.lastProfessor = response[0];
      },
      error: () => {
        this.toastr.error('Impossible de recupérer la liste des professeurs !');
      },
    });
  }

  //Methode pour recuperer toutes les sessions
  getAllSessions() {
    this.sessionService.getAllSession().subscribe({
      next: (response) => {
        this.sessions = response;
        this.totalSession = response.length;
        this.lastSession = response[0];
      },
      error: () => {
        this.toastr.error('Impossible de recupérer la liste des sessions');
      },
    });
  }

  //Methode pour recuperer tous les paiements
  getAllPaiement() {
    this.paiementService.getAllPaiement().subscribe({
      next: (response) => {
        this.paiements = response;

        // Mise à jour des données du graphique
        this.updateChartWithPaymentData(response);
      },
      error: () => {
        this.toastr.error('Impossible de recupérer la liste des paiements');
      },
    });
  }

  updateChartWithPaymentData(paiements: any[]) {
    // Obtenir la date actuelle
    const currentDate = new Date();

    // Préparer les données pour les 6 derniers mois
    const monthlyTotals: any[] = [];
    const categories = [];

    // Générer les dates des 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);

      // Format pour les catégories (premier jour du mois)
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      categories.push(firstDayOfMonth.toISOString());

      // Initialiser le total des paiements pour ce mois à 0
      monthlyTotals.push(0);
    }

    // Calculer le total des paiements par mois
    paiements.forEach((paiement: { createDate: string | number | Date; amount: any; }) => {
      if (paiement.createDate) {
        const paymentDate = new Date(paiement.createDate);

        // Vérifier si le paiement est dans les 6 derniers mois
        const monthsAgo =
          (currentDate.getFullYear() - paymentDate.getFullYear()) * 12 +
          (currentDate.getMonth() - paymentDate.getMonth());

        if (monthsAgo >= 0 && monthsAgo < 6) {
          // Ajouter le montant au mois correspondant (5-monthsAgo car nous allons du plus ancien au plus récent)
          monthlyTotals[5 - monthsAgo] += paiement.amount;
        }
      }
    });

    // Mettre à jour le graphique
    this.chartOptionsPaiement = {
      series: [
        {
          name: 'Total des paiements',
          data: monthlyTotals,
          color: '#f5d333',
        },
      ],
      chart: {
        height: 350,
        type: 'area',
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        type: 'datetime',
        categories: categories,
      },
      tooltip: {
        x: {
          format: 'MM/yyyy',
        },
        y: {
          formatter: function (value) {
            return value.toLocaleString() + ' FCFA';
          },
        },
      },
    };

    // Si vous utilisez ApexCharts et que vous avez une référence au graphique
    if (this.chartPaiement) {
      this.chartPaiement.updateOptions(this.chartOptionsPaiement);
    }
  }
}
