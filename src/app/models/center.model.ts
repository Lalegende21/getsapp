import { Img } from "./img.model";

export interface Center {
    id: number,
    name: string,
    localisation: string,
    img: Img;
    createDate: Date;
}

export type Centers = Center[];