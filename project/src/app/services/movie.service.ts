import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Movie } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'http://127.0.0.1:5000/recommend';

  constructor(private http: HttpClient) { }

  getRecommendations(title: string): Observable<Movie[]> {
    if (!title.trim()) {
      return throwError(() => new Error('Le titre est vide'));
    }

    const url = `${this.apiUrl}?title=${encodeURIComponent(title)}`;
    return this.http.get<{ recommendations: Movie[] }>(url).pipe(
      map((response) => response.recommendations || []), // Extraire les recommandations
      catchError((error) => {
        console.error('Erreur API :', error);
        return throwError(() => new Error(error.error?.error || 'Erreur API'));
      })
    );
  }
  
}