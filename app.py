from flask import Flask, request, jsonify
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS


app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}})


movies_df = pd.read_csv("tmdb_5000_movies.csv")

def clean_data(data):
    return " ".join([d['name'] for d in eval(data)] if pd.notna(data) else "")

movies_df['genres_cleaned'] = movies_df['genres'].apply(clean_data)
movies_df['keywords_cleaned'] = movies_df['keywords'].apply(clean_data)
movies_df['combined_features'] = (
    (movies_df['genres_cleaned'] + " ") * 2 +
    (movies_df['keywords_cleaned'] + " ") * 2 +
    movies_df['overview'].fillna("")
)

tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(movies_df['combined_features'])
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
indices = pd.Series(movies_df.index, index=movies_df['title']).drop_duplicates()

def recommend_movies(title, score_threshold=6.0):
    if title not in indices:
        return []

    idx = indices[title]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = [
        (i, score) for i, score in sim_scores
        if movies_df.iloc[i]['vote_average'] >= score_threshold
    ]
    sim_scores = sim_scores[1:11]
    movie_indices = [i[0] for i in sim_scores]
    recommendations = movies_df[['title', 'vote_average']].iloc[movie_indices]
    return recommendations.to_dict(orient="records")

@app.route('/recommend', methods=['GET'])
def recommend():
    title = request.args.get('title')
    if not title:
        return jsonify({"error": "Le paramètre 'title' est requis"}), 400

    recommendations = recommend_movies(title)
    if not recommendations:
        return jsonify({"error": "Aucune recommandation trouvée ou film inconnu"}), 404

    return jsonify({"recommendations": recommendations})

if __name__ == '__main__':
    app.run(debug=True)
