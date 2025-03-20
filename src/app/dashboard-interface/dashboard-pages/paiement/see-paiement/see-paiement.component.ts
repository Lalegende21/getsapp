import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
    selector: 'app-see-paiement',
    imports: [CommonModule, MatIconModule],
    templateUrl: './see-paiement.component.html',
    styleUrl: './see-paiement.component.scss'
})
export class SeePaiementComponent {
  private router = inject(Router);
  //Methode pour revenir sur la page precedente
  backPage(){
    this.router.navigateByUrl('/dashboard/paiement');
  }
}
