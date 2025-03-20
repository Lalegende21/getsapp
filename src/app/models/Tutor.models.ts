import { Img } from './img.model';
import { Student } from './Student.model';

export interface Tutor {
  id: number;
  fullname: string;
  email: string;
  phonenumber: number;
  student: Student;
  typeTutor: string;
  img: Img;
  createDate: Date;
}
