import { Center } from './center.model';
import { Formation } from './fomation.model';
import { Img } from './img.model';
import { Session } from './session.model';

export interface Student {
  id: number;
  matricule: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  dob: string;
  cni: string;
  sexe: string;
  horaire: string;
  montantPaye: number;
  montantTotal: number;
  montantRestantaPayer: number;
  reduction: number;
  montantAfterReduction: number;
  img: Img;
  formation: Formation;
  session: Session;
  createDate: Date;
}
