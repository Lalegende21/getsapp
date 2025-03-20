import { Img } from './img.model';

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  sexe: string;
  role: string;
  img: Img;
  createDate: Date;
}
