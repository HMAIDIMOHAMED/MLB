import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MovieService } from './services/movie.service';
import { Movie } from './models/movie.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="app-container">
      <header class="header">
        <div class="header-content">
          <h1>🎬 Découvrez des Films</h1>
          <p class="subtitle">Trouvez vos prochains films préférés</p>
        </div>
      </header>

      <main class="main-content">
        <div class="search-container">
          <div class="search-box">
            <input 
              type="text" 
              [(ngModel)]="searchTitle" 
              placeholder="Entrez un titre de film..."
              (keyup.enter)="searchMovies()"
              class="search-input"
            >
            <button (click)="searchMovies()" class="search-button">
              <span class="search-icon">🔍</span>
              Rechercher
            </button>
          </div>
        </div>

        <div *ngIf="error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ error }}
        </div>

        <div *ngIf="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Recherche des meilleures recommandations...</p>
        </div>

        <div *ngIf="recommendations.length > 0" class="recommendations-section">
          <h2>Films Recommandés pour Vous</h2>
          <div class="movie-grid">
            <div *ngFor="let movie of recommendations" class="movie-card">
              <div class="movie-card-content">
                <h3>{{ movie.title }}</h3>
                <div class="rating">
                  <span class="star">⭐</span>
                  <span class="rating-text">{{ movie.vote_average.toFixed(1) }}/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer class="footer">
        <p>Découvrez le meilleur du cinéma</p>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #ffffff;
    }

    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      background: rgba(0, 0, 0, 0.3);
      padding: 2rem 0;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      text-align: center;
    }

    h1 {
      font-size: 2.5rem;
      margin: 0;
      background: linear-gradient(45deg, #00b4db, #0083b0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 700;
    }

    .subtitle {
      font-size: 1.2rem;
      color: #a0aec0;
      margin: 0.5rem 0 0;
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      flex: 1;
    }

    .search-container {
      margin-bottom: 3rem;
    }

    .search-box {
      display: flex;
      gap: 1rem;
      max-width: 700px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.1);
      padding: 1rem;
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
    }

    .search-input {
      flex: 1;
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.9);
      font-size: 1.1rem;
      color: #1a1a2e;
      transition: all 0.3s ease;
    }

    .search-input:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(0, 180, 219, 0.3);
    }

    .search-button {
      padding: 1rem 2rem;
      border: none;
      border-radius: 10px;
      background: linear-gradient(45deg, #00b4db, #0083b0);
      color: white;
      font-size: 1.1rem;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .search-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 180, 219, 0.3);
    }

    .search-icon {
      font-size: 1.2rem;
    }

    .error-message {
      background: rgba(231, 76, 60, 0.1);
      border-left: 4px solid #e74c3c;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .loading-container {
      text-align: center;
      padding: 2rem;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-left-color: #00b4db;
      border-radius: 50%;
      margin: 0 auto 1rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .recommendations-section {
      margin-top: 2rem;
    }

    .recommendations-section h2 {
      text-align: center;
      margin-bottom: 2rem;
      font-size: 1.8rem;
      color: #00b4db;
    }

    .movie-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
      padding: 1rem 0;
    }

    .movie-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .movie-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
    }

    .movie-card-content {
      padding: 1.5rem;
    }

    .movie-card h3 {
      margin: 0 0 1rem 0;
      font-size: 1.3rem;
      color: #ffffff;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .star {
      color: #ffd700;
    }

    .rating-text {
      color: #a0aec0;
      font-size: 1.1rem;
    }

    .footer {
      text-align: center;
      padding: 2rem;
      background: rgba(0, 0, 0, 0.3);
      margin-top: 3rem;
      color: #a0aec0;
    }

    @media (max-width: 768px) {
      .header {
        padding: 1.5rem 0;
      }

      h1 {
        font-size: 2rem;
      }

      .search-box {
        flex-direction: column;
      }

      .search-button {
        width: 100%;
        justify-content: center;
      }

      .movie-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
      }
    }
  `]
})
export class App {
  searchTitle = '';
  recommendations: Movie[] = [];
  error = '';
  loading = false;

  constructor(private movieService: MovieService, private http: HttpClient) {}

  searchMovies() {
    if (!this.searchTitle.trim()) {
      this.error = 'Veuillez entrer un titre de film';
      return;
    }
  
    this.loading = true; // Démarrer l'état de chargement
    this.error = '';
    this.recommendations = [];
  
    this.movieService.getRecommendations(this.searchTitle)
      .subscribe({
        next: (movies) => {
          this.recommendations = movies; // Met à jour les recommandations
          this.loading = false; // Arrêter le chargement
        },
        error: (err) => {
          this.error = err.message || 'Erreur lors de la recherche. Veuillez réessayer.';
          this.loading = false; // Arrêter le chargement
        }
      });
  }
}