import { Img } from "./img.model";

export interface Professor {
  id: number;
  fullname: string;
  cni: string;
  email: string;
  img: Img;
  phoneNumber: string;
  sexe: string;
  createDate: Date;
}

export type Professors = Professor[];
