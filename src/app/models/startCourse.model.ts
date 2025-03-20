import { Course } from './course.model';
import { Professor } from './Professor.model';
import { Session } from './session.model';

export interface StartCourse {
  id: number;
  startDate: string;
  endDate: string;
  horaire: string;
  statut: string;
  course: Course;
  professor: Professor;
  session: Session;
  createDate: Date;
}

export type startCourses = StartCourse[];
