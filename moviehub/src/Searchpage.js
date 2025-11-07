// src/Searchpage.js
import React, { useState, useEffect, useCallback } from 'react';

function SearchPage({ user, onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const API_KEY = process.env.REACT_APP_OMDB_API_KEY;

  const fetchSearch = useCallback(async (q, p = 1) => {
    const res = await fetch(
      `https://www.omdbapi.com/?s=${encodeURIComponent(q)}&page=${p}&apikey=${API_KEY}`
    );
    return res.json();
  }, [API_KEY]);

  const fetchDetails = useCallback(async (imdbID) => {
    const res = await fetch(
      `https://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${API_KEY}`
    );
    return res.json();
  }, [API_KEY]);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setError(null);
    setIsLoading(true);
    setIsLoadingMore(false);
    setResults([]);
    setPage(1);
    setTotalResults(0);
    try {
      const data = await fetchSearch(q, 1);
      if (data.Response === "False") {
        setError(data.Error || "No results found.");
      } else {
        setResults(data.Search || []);
        setTotalResults(Number(data.totalResults || 0));
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (results.length >= totalResults) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const data = await fetchSearch(searchQuery.trim(), nextPage);
      if (data.Response === "True") {
        setResults(prev => [...prev, ...(data.Search || [])]);
        setPage(nextPage);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const openDetails = async (imdbID) => {
    setIsDetailsLoading(true);
    try {
      const data = await fetchDetails(imdbID);
      if (data.Response === "True") setSelectedMovie(data);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const closeDetails = () => setSelectedMovie(null);

  const nice = (val) => (val && val !== "N/A" ? val : "—");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-400/30 grid place-items-center">
              <span className="text-blue-300 font-bold">🎬</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              <span className="text-white">Movie</span>
              <span className="text-blue-400">HUB</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-400 hidden sm:block">Welcome, {user}!</span>
            <button
              onClick={onLogout}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-4 py-2 font-semibold transition-all"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Search */}
        <div className="relative mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search movies (e.g., Batman, Inception, Interstellar)"
                className="w-full bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-3 pr-10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">⌘K</span>
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl px-5 py-3 font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Tip: click a poster for full details & ratings.
          </p>
        </div>

        {/* Loading */}
        {isLoading && <GridSkeleton />}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center text-red-300 bg-red-900/30 border border-red-800/50 p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && results.length === 0 && (
          <div className="mt-16 text-center text-gray-500">
            <div className="text-6xl mb-4">🍿</div>
            <p className="text-lg">Search for a movie to get started.</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {results.map((m) => (
                <button
                  key={m.imdbID}
                  onClick={() => openDetails(m.imdbID)}
                  className="group relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-all"
                >
                  <img
                    src={m.Poster && m.Poster !== "N/A" ? m.Poster : "https://via.placeholder.com/300x450?text=No+Poster"}
                    alt={m.Title}
                    className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-sm font-semibold truncate">{m.Title}</p>
                    <p className="text-xs text-gray-400">{m.Year} • {m.Type?.toUpperCase()}</p>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500/5" />
                </button>
              ))}
            </div>

            {results.length < totalResults && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-5 py-3 rounded-xl border border-gray-800 bg-gray-900 hover:bg-gray-800 font-semibold transition-all disabled:opacity-60"
                >
                  {isLoadingMore ? "Loading..." : `Load more (${results.length}/${totalResults})`}
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal */}
        {selectedMovie && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeDetails} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="relative w-full max-w-3xl bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <button
                  onClick={closeDetails}
                  className="absolute right-3 top-3 z-10 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-3 py-1 text-sm"
                >
                  ✕
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
                  <div className="sm:col-span-1 bg-gray-950 p-4 border-r border-gray-800">
                    <img
                      src={selectedMovie.Poster && selectedMovie.Poster !== "N/A" ? selectedMovie.Poster : "https://via.placeholder.com/300x450?text=No+Poster"}
                      alt={selectedMovie.Title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2 p-5 sm:p-6">
                    {isDetailsLoading ? (
                      <DetailsSkeleton />
                    ) : (
                      <>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-1">{selectedMovie.Title}</h2>
                        <p className="text-gray-400 mb-3">
                          {nice(selectedMovie.Year)} • {nice(selectedMovie.Rated)} • {nice(selectedMovie.Runtime)}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {selectedMovie.Genre?.split(",").map((g) => (
                            <span key={g.trim()} className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                              {g.trim()}
                            </span>
                          ))}
                        </div>

                        <p className="text-gray-200 leading-relaxed mb-4">{nice(selectedMovie.Plot)}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <Info label="Director" value={nice(selectedMovie.Director)} />
                          <Info label="Writer" value={nice(selectedMovie.Writer)} />
                          <Info label="Actors" value={nice(selectedMovie.Actors)} />
                          <Info label="Language" value={nice(selectedMovie.Language)} />
                          <Info label="Released" value={nice(selectedMovie.Released)} />
                          <Info label="Box Office" value={nice(selectedMovie.BoxOffice)} />
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <a
                            href={`https://www.imdb.com/title/${selectedMovie.imdbID}`}
                            target="_blank" rel="noreferrer"
                            className="px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30 transition"
                          >
                            View on IMDb ★ {nice(selectedMovie.imdbRating)}
                          </a>
                          <span className="text-xs text-gray-500">Votes: {nice(selectedMovie.imdbVotes)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ---------- Small UI pieces ---------- */

function Info({ label, value }) {
  return (
    <div className="bg-gray-800/60 border border-gray-800 rounded-xl p-3">
      <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-gray-100 mt-1">{value}</p>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-900 border border-gray-800 rounded-xl h-72" />
      ))}
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-2/3 bg-gray-800 rounded mb-2" />
      <div className="h-4 w-1/3 bg-gray-800 rounded mb-4" />
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-6 w-16 bg-gray-800 rounded-full" />
        ))}
      </div>
      <div className="h-20 bg-gray-800 rounded mb-4" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-800 rounded" />
        ))}
      </div>
    </div>
  );
}

export default SearchPage;
