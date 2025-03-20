import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { UpdateStudentProfilComponent } from './update-student-profil/update-student-profil.component';
import { UpdateStudentFormationComponent } from './update-student-formation/update-student-formation.component';
import { Student } from '../../../../models/Student.model';
import { Paiement } from '../../../../models/paiement.model';
import { StudentService } from '../../../../service/student.service';
import { ReductionComponent } from './reduction/reduction.component';
import { PaiementEtudiantComponent } from '../paiement-etudiant/paiement-etudiant.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UpdateReductionComponent } from './update-reduction/update-reduction.component';
import { CancelReductionComponent } from './cancel-reduction/cancel-reduction.component';
import { CancelPaiementComponent } from './cancel-paiement/cancel-paiement.component';
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-voir-etudiant',
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './voir-etudiant.component.html',
  styleUrl: './voir-etudiant.component.scss',
  providers: [DatePipe],
})
export class VoirEtudiantComponent {
  id!: number;
  firstname!: string;
  lastname!: string;
  email!: string;
  phone!: string;
  sexe!: string;
  dob: string | null = '20-02-2024';
  center!: string;
  student!: Student;
  image!: any;
  safeImageUrl: SafeUrl = '';
  imagePdf: string = '';
  role: string | null;

  formation: any;
  matricule: any;
  montantRestantaPayer: any;
  montantTotal: any;
  montantPaye: any;
  cni: any;
  horaire: any;
  createDate: any;
  reduction: any;

  paiements!: Paiement[];
  inscriptionPaiements!: Paiement[];
  inscriptionPaiementsValue!: any;
  firstPaiementsValue!: any;
  secondPaiementsValue!: any;
  thirdPaiementsValue!: any;
  otherPaiementsValue!: any;
  firstPaiements!: Paiement[];
  secondPaiements!: Paiement[];
  thirdPaiements!: Paiement[];
  otherPaiements!: Paiement[];
  formationId: any;
  centerId: any;
  sessionId: any;
  dateDebut: any;
  formationStudent: any;
  sessionStudent: any;
  centerStudent: any;
  montantAfterReduction: any;
  width: string | undefined;
  differenceMontant: any;

  private router = inject(Router);
  private studentService = inject(StudentService);
  private activatedRoute = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);
  private breakPointObserver = inject(BreakpointObserver);
  private datePipe = inject(DatePipe);
  private sanitizer = inject(DomSanitizer);
  private cdk = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  constructor() {
    this.id = this.activatedRoute.snapshot.params['id'];
    this.role = localStorage.getItem('role');

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

  ngOnInit(): void {
    this.getStudentById();
    this.getImageStudent();
    this.getPaiementStudent();
  }

  getPaiementStudent() {
    this.studentService.getStudentPaiement(this.id).subscribe({
      next: (response) => {
        this.paiements = response;
        this.categoriserPaiements();
        // this.toastr.success('Etudiant recupéré avec succès!');
        this.getStudentById();
      },
      error: (error) => {
        console.log(error);
        this.toastr.error(error.error.message);
      },
    });
  }

  categoriserPaiements() {
    this.inscriptionPaiements = this.paiements.filter(
      (p) => p.typePaiement === 'INSCRIPTION'
    );
    this.inscriptionPaiementsValue = this.inscriptionPaiements
      .map((p) => p.amount)
      .toString();

    this.firstPaiements = this.paiements.filter(
      (p) => p.typePaiement === 'FIRST_PAIEMENT'
    );
    this.firstPaiementsValue = this.firstPaiements
      .map((p) => p.amount)
      .toString();

    this.secondPaiements = this.paiements.filter(
      (p) => p.typePaiement === 'SECOND_PAIEMENT'
    );
    this.secondPaiementsValue = this.secondPaiements
      .map((p) => p.amount)
      .toString();

    this.thirdPaiements = this.paiements.filter(
      (p) => p.typePaiement === 'THIRD_PAIEMENT'
    );
    this.thirdPaiementsValue = this.thirdPaiements
      .map((p) => p.amount)
      .toString();

    this.otherPaiements = this.paiements.filter(
      (p) => p.typePaiement === 'OTHER'
    );
    this.otherPaiementsValue = this.otherPaiements
      .map((p) => p.amount)
      .toString();
  }

  getStudentById() {
    this.studentService.getStudentById(this.id).subscribe((res) => {
      this.student = res;
      this.firstname = res.firstname;
      this.lastname = res.lastname;
      this.email = res.email;
      this.phone = res.phonenumber;
      this.sexe = res.sexe;
      this.dob = this.datePipe.transform(res.dob, 'dd-MM-yyyy');
      this.centerId = res.session.center.id;
      this.formationStudent = res.formation;
      this.centerStudent = res.session.center;
      this.center = res.session.center.name;
      this.formationId = res.formation.id;
      this.formation = res.formation.specialite;
      this.matricule = res.matricule;
      this.montantAfterReduction = res.montantAfterReduction;
      this.montantRestantaPayer = res.montantRestantaPayer;
      this.montantTotal = res.montantTotal;
      this.montantPaye = res.montantPaye;
      this.cni = res.cni;
      this.horaire = res.horaire;
      this.sessionStudent = res.session;
      this.sessionId = res.session.id;
      this.dateDebut = res.session.dateDebut;
      this.createDate = res.createDate;
      this.reduction = res.reduction;
    });
  }

  //Methode pour revenir sur la page precedente
  backPage() {
    this.cdk.detectChanges();
    this.router.navigateByUrl('/dashboard/etudiant');
  }

  goToPaiementsEtudiant() {
    this.router.navigateByUrl('/dashboard/etudiant/' + this.id + '/paiements');
  }

  //Methode pour recuperer l'image selectionnee
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.uploadImageStudent(file);
      setTimeout(() => {
        this.getImageStudent(); //Rafraichir l'image apres l'upload
        this.cdk.detectChanges();
      }, 500);
    } else {
      this.toastr.error('Veuillez selectionner une image valide!');
    }
  }

  //methode pour recuperer l'image
  getImageStudent() {
    this.studentService.getStudentImageUrl(this.id).subscribe({
      next: (url) => {
        this.safeImageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
        this.imagePdf = url;
      },
    });
  }

  //Methode pour enregistrer l'image
  uploadImageStudent(image: File) {
    this.spinner.show();
    this.studentService.uploadImageForStudent(this.id, image).subscribe({
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

  getReduction(
    firstname: string,
    lastname: string,
    formation: string,
    montantTotal: string
  ) {
    this.dialog
      .open(ReductionComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: { id: this.id, firstname, lastname, formation, montantTotal },
      })
      .afterClosed()
      .subscribe(() => {
        this.ngZone.run(() => {
          this.getStudentById();
          this.getPaiementStudent();
        });
      });
  }

  updateReduction(
    firstname: string,
    lastname: string,
    formation: string,
    montantTotal: string
  ) {
    this.dialog
      .open(UpdateReductionComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: { id: this.id, firstname, lastname, formation, montantTotal },
      })
      .afterClosed()
      .subscribe(() => {
        this.ngZone.run(() => {
          this.getStudentById();
          this.getPaiementStudent();
        });
      });
  }

  cancelPaiementsEtudiant() {
    this.dialog
      .open(CancelPaiementComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: { id: this.id },
      })
      .afterClosed()
      .subscribe(() => {
        this.ngZone.run(() => {
          this.getStudentById();
          this.getPaiementStudent();
        });
      });
  }

  cancelReduction(
    firstname: string,
    lastname: string,
    formation: string,
    montantTotal: string
  ) {
    this.dialog
      .open(CancelReductionComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: {
          id: this.id,
          firstname,
          lastname,
          formation,
          montantTotal,
          student: this.student,
        },
      })
      .afterClosed()
      .subscribe(() => {
        this.ngZone.run(() => {
          this.getStudentById();
          this.getPaiementStudent();
        });
      });
  }

  updateStudentProfil() {
    this.dialog
      .open(UpdateStudentProfilComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: {
          id: this.id,
          firstname: this.firstname,
          lastname: this.lastname,
          email: this.email,
          phone: this.phone,
          cni: this.cni,
          sexe: this.sexe,
          dob: this.dob,
          center: this.centerStudent,
          session: this.sessionStudent,
          formation: this.formationStudent,
          horaire: this.horaire,
        },
      })
      .afterClosed()
      .subscribe(() => {
        this.ngZone.run(() => {
          this.getStudentById();
        });
      });
  }

  updateStudentFormation() {
    this.dialog
      .open(UpdateStudentFormationComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: {
          id: this.id,
          firstname: this.firstname,
          lastname: this.lastname,
          email: this.email,
          phone: this.phone,
          cni: this.cni,
          sexe: this.sexe,
          dob: this.dob,
          center: this.centerStudent,
          session: this.sessionStudent,
          formation: this.formationStudent,
          horaire: this.horaire,
        },
      })
      .afterClosed()
      .subscribe(() => {
        this.ngZone.run(() => {
          this.getStudentById();
        });
      });
  }

  applyPaiement() {
    this.dialog
      .open(PaiementEtudiantComponent, {
        enterAnimationDuration: '500ms',
        exitAnimationDuration: '300ms',
        width: this.width,
        data: {
          id: this.id,
          firstname: this.firstname,
          lastname: this.lastname,
          student: this.student,
        },
      })
      .afterClosed()
      .subscribe(() => {
        this.ngZone.run(() => {
          this.getStudentById();
          this.getPaiementStudent();
        });
      });
  }

  generatePDF() {
    const doc = new jsPDF();

    // Couleurs
    const primaryColor = '#363949'; // Couleur principale (bleu foncé)
    const secondaryColor = '#e74c3c'; // Couleur secondaire (rouge)
    const backgroundColor = '#ecf0f1'; // Couleur de fond (gris clair)
    const textColor = '#2c3e50'; // Couleur du texte

    // Titre stylisé
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 60, 'F'); // Bandeau en haut plus grand (60 mm de hauteur)

    const logo = new Image();
    logo.src = '/images/icon-site.png'; // Chemin relatif vers le logo
    logo.crossOrigin = 'Anonymous'; // Autoriser le chargement de l'image

    logo.onload = async () => {
      // Définir la taille du logo
      const logoWidth = 30; // Largeur du logo
      const logoHeight = 30; // Hauteur du logo

      // Centrer le logo horizontalement
      const pageWidth = doc.internal.pageSize.getWidth(); // Largeur de la page (210 mm par défaut)
      const logoX = (pageWidth - logoWidth) / 2; // Position horizontale centrée

      // Ajouter le logo au PDF
      doc.addImage(logo, 'PNG', logoX, 10, logoWidth, logoHeight);

      // Texte sous le logo
      doc.setFontSize(22);
      doc.setTextColor('#ffffff'); // Texte blanc
      doc.setFont('helvetica', 'bold');

      // Calculer la largeur du texte
      const titleText = "Détails de l'Étudiant";
      const textWidth = doc.getTextWidth(titleText);

      // Centrer le texte horizontalement
      const textX = (pageWidth - textWidth) / 2; // Position horizontale centrée

      // Ajouter le texte centré sous le logo
      doc.text(titleText, textX, 50); // Ajustez la valeur de y pour placer le texte plus haut

      // Image de l'étudiant
      const img = new Image();
      const defaultImageUrl = '/images/user.png'; // Image par défaut
      img.src = this.imagePdf || defaultImageUrl; // Utiliser l'image de l'API ou l'image par défaut
      img.crossOrigin = 'Anonymous'; // Autoriser le chargement de l'image

      img.onload = () => {
        // Définir la taille et la position de l'image
        const imgWidth = 40; // Largeur de l'image
        const imgHeight = 50; // Hauteur de l'image
        const imgX = 160; // Position horizontale de l'image
        const imgY = 70; // Position verticale de l'image

        // Ajouter l'image au PDF
        doc.addImage(img, 'JPEG', imgX, imgY, imgWidth, imgHeight);

        // Informations de l'étudiant
        doc.setFontSize(12);
        doc.setTextColor(textColor);

        // Section 1: Informations personnelles
        doc.setFillColor(backgroundColor);
        doc.roundedRect(10, 70, 120, 60, 5, 5, 'F'); // Rectangle arrondi
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Informations Personnelles', 15, 80);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textColor);
        doc.text(`Nom: ${this.firstname} ${this.lastname}`, 15, 90);
        doc.text(`Email: ${this.email}`, 15, 100);
        doc.text(`Téléphone: ${this.phone}`, 15, 110);
        doc.text(`Sexe: ${this.sexe}`, 15, 120);

        // Section 2: Informations académiques
        doc.setFillColor(backgroundColor);
        doc.roundedRect(10, 140, 190, 60, 5, 5, 'F'); // Rectangle arrondi
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Informations Académiques', 15, 150);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textColor);
        doc.text(`Centre: ${this.center}`, 15, 160);
        doc.text(`Formation: ${this.formation}`, 15, 170);
        doc.text(`Matricule: ${this.matricule}`, 15, 180);
        doc.text(`Session: ${this.sessionStudent.dateDebut}`, 15, 190);

        // Section 3: Informations financières
        doc.setFillColor(backgroundColor);
        doc.roundedRect(10, 210, 190, 60, 5, 5, 'F'); // Rectangle arrondi
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Informations Financières', 15, 220);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textColor);
        doc.text(`Montant Total: ${this.montantTotal}`, 15, 230);
        doc.text(`Montant Payé: ${this.montantPaye}`, 15, 240);
        doc.text(
          `Montant Restant à Payer: ${this.montantRestantaPayer}`,
          15,
          250
        );
        doc.text(`Réduction: ${this.reduction}`, 15, 260);

        // Ajouter une bordure autour du PDF
        doc.setDrawColor(primaryColor);
        doc.rect(5, 5, 200, 287); // Bordure autour de la page

        // Sauvegarder le PDF
        doc.save(`fiche_details_${this.firstname}_${this.lastname}.pdf`);
      };

      img.onerror = () => {
        console.error(
          "Erreur de chargement de l'image. Utilisation de l'image par défaut..."
        );
        img.src = defaultImageUrl; // Recharger l'image par défaut en cas d'erreur
      };
    };

    logo.onerror = () => {
      console.error('Erreur de chargement du logo.');
    };
  }
}
