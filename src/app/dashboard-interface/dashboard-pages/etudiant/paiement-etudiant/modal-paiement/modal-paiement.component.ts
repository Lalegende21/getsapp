import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-modal-paiement',
    imports: [],
    templateUrl: './modal-paiement.component.html',
    styleUrl: './modal-paiement.component.scss'
})
export class ModalPaiementComponent {
  firstname!: string;
  lastname!: string;
  typePaiement!: string;
  amount!: string;

  constructor(
    private ref: MatDialogRef<ModalPaiementComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      firstname: string;
      lastname: string;
      typePaiement: string;
      amount: string;
    }
  ) {
    this.firstname = data.firstname;
    this.lastname = data.lastname;
    this.typePaiement = data.typePaiement;
    this.amount = data.amount;
  }

  confirm() {
    this.ref.close(true);
  }

  closeDialog() {
    this.ref.close(false);
  }
}
