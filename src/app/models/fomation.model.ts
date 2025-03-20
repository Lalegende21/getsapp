import { SpecificiteFormation } from './Specificite.model';
import { Student } from './Student.model';

export interface Formation {
  id: number;
  specialite: string;
  periode: string;
  price: number;
  specificiteFormation: SpecificiteFormation;
  createDate: Date;
  students: Student;
  studentCount: number;
}
