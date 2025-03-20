import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  readonly baseUrl = 'http://localhost:8080/getsmarter';

  constructor() { }
}
