import { Center } from './center.model';
import { Img } from './img.model';
import { Student } from './Student.model';

export interface Session {
  id: number;
  dateDebut: string;
  statuts: string;
  center: Center;
  img: Img;
  createDate: string;
  students: Student;
  studentCount: number;
  totalMontantAttendu: number;
  totalMontantPaye: number;
  totalMontantRestant: number;
  totalReduction: number;
}

export type Sessions = Session[];
