import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-voir-formations',
    imports: [CommonModule, MatIconModule],
    templateUrl: './voir-formations.component.html',
    styleUrl: './voir-formations.component.scss'
})
export class VoirFormationsComponent {
  specialite: string;
  code: string;
  libelle: string;
  periode: string;
  price: string;

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.specialite = this.route.snapshot.paramMap.get('specialite') || '';
    this.code = this.route.snapshot.paramMap.get('code') || '';
    this.libelle = this.route.snapshot.paramMap.get('libelle') || '';
    this.periode = this.route.snapshot.paramMap.get('periode') || '';
    this.price = this.route.snapshot.paramMap.get('price') || '';
  }

  //Methode pour revenir sur la page precedente
  backPage() {
    this.router.navigateByUrl('/dashboard/liste-formations');
  }
}
