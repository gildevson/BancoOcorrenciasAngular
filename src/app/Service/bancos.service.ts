// src/app/service/bancos.api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBanco } from '../models/ocorrencias.models';

@Injectable({ providedIn: 'root' })
export class BancosApi { /*'https://localhost:7041/api/bancos'*/
 /* private readonly API = 'https://exceptional-melita-gildevson-sistemas-1fffc163.koyeb.app/api/bancos';*/
  private readonly API = 'https://localhost:7041/api/bancos';

  constructor(private http: HttpClient) {}

  listar(): Observable<ApiBanco[]> {
    return this.http.get<ApiBanco[]>(this.API);
  }

  buscarPorId(id: string): Observable<ApiBanco> {
    return this.http.get<ApiBanco>(`${this.API}/${id}`);
  }
}
