import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'code-activation',
    loadComponent: () =>
      import('./pages/code-validation/code-validation.component').then(
        (m) => m.CodeValidationComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard-interface/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'accueil',
      },
      {
        path: 'accueil',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/accueil/accueil.component'
          ).then((m) => m.AccueilComponent),
      },
      {
        path: 'profil',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/profil/profil.component'
          ).then((m) => m.ProfilComponent),
      },
      {
        path: 'session',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/session/session.component'
          ).then((m) => m.SessionComponent),
      },
      {
        path: 'session/:id',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/session/view-session/view-session.component'
          ).then((m) => m.ViewSessionComponent),
      },
      {
        path: 'etudiant',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/etudiant/etudiant.component'
          ).then((m) => m.EtudiantComponent),
      },
      {
        path: 'etudiant/:id',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/etudiant/voir-etudiant/voir-etudiant.component'
          ).then((m) => m.VoirEtudiantComponent),
      },
      {
        path: 'etudiant/:id/paiements',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/etudiant/liste-paiement-etudiant/liste-paiement-etudiant.component'
          ).then((m) => m.ListePaiementEtudiantComponent),
      },
      {
        path: 'campus',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/campus/campus.component'
          ).then((m) => m.CampusComponent),
      },
      {
        path: 'campus/:id',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/campus/view-campus/view-campus.component'
          ).then((m) => m.ViewCampusComponent),
      },
      {
        path: 'cours',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/matiere/matiere.component'
          ).then((m) => m.MatiereComponent),
      },
      {
        path: 'professeur',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/professeur/professeur.component'
          ).then((m) => m.ProfesseurComponent),
      },
      {
        path: 'professeur/:id',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/professeur/see-professor/see-professor.component'
          ).then((m) => m.SeeProfessorComponent),
      },
      {
        path: 'demarrer-matiere',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/demarrer-matiere/demarrer-matiere.component'
          ).then((m) => m.DemarrerMatiereComponent),
      },
      {
        path: 'demarrer-matiere/:id',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/demarrer-matiere/voir-matiere/voir-matiere.component'
          ).then((m) => m.VoirMatiereComponent),
      },
      {
        path: 'liste-utilisateurs',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/liste-utilisateurs/liste-utilisateurs.component'
          ).then((m) => m.ListeUtilisateursComponent),
      },
      {
        path: 'liste-utilisateurs/:id',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/liste-utilisateurs/voir-utilisateur/voir-utilisateur.component'
          ).then((m) => m.VoirUtilisateurComponent),
      },
      {
        path: 'liste-utilisateur/:id/update-role',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/liste-utilisateurs/update-role-user/update-role-user.component'
          ).then((m) => m.UpdateRoleUserComponent),
      },
      {
        path: 'parametres',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/parametres/parametres.component'
          ).then((m) => m.ParametresComponent),
      },
      {
        path: 'specificite',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/specificite/specificite.component'
          ).then((m) => m.SpecificiteComponent),
      },
      {
        path: 'liste-formattions',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/liste-formations/liste-formations.component'
          ).then((m) => m.ListeFormationsComponent),
      },
      {
        path: 'paiement',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/paiement/paiement.component'
          ).then((m) => m.PaiementComponent),
      },
      {
        path: 'tuteur',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/tuteur/tuteur.component'
          ).then((m) => m.TuteurComponent),
      },
      {
        path: 'tuteur/:id',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/tuteur/see-tutor/see-tutor.component'
          ).then((m) => m.SeeTutorComponent),
      },
      {
        path: 'statistique',
        loadComponent: () =>
          import(
            './dashboard-interface/dashboard-pages/statistique/statistique.component'
          ).then((m) => m.StatistiqueComponent),
      },
      {
        path: 'dashboard/**',
        loadComponent: () =>
          import('./pages/page-not-found/page-not-found.component').then(
            (m) => m.PageNotFoundComponent
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/page-not-found/page-not-found.component').then(
        (m) => m.PageNotFoundComponent
      ),
  },
];
