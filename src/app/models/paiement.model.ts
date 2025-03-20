import { Student } from './Student.model';

export interface Paiement {
  id: number;
  amount: number;
  student: Student;
  typePaiement: string;
  createDate: Date;
}
