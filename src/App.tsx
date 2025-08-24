import { useEffect, useState } from 'react';
import Search from './components/Search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';

const baseUrl = import.meta.env.VITE_API_BASE_URL!;
const apiKey = import.meta.env.VITE_TMDB_API_KEY!;

type Movie = {
    id: number;
    title: string;
    vote_average: number;
    poster_path: string;
    release_date: string;
    original_language: string;
};

export default function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [movies, setMovies] = useState<Movie[]>([]);
    const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [debounceSearchTerm, setDebounceSearchTerm] = useState('');

    useDebounce(() => setDebounceSearchTerm(searchTerm), 500, [searchTerm]);

    const fetchMovies = async (query: string) => {
        try {
            setIsLoading(true);

            const endPoint = query
                ? `${baseUrl}/search/movie?query=${encodeURIComponent(query)}`
                : `${baseUrl}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endPoint, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error();
            }

            const result = await response.json();

            if (result.Response === 'False') {
                setErrorMessage(result.Error);
                setMovies([]);
            }

            setMovies(result.results);
        } catch (error) {
            setErrorMessage('Failed fetching movies. Please try again!');
            console.log('Error fetching movies', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTrendingMovies = async (query: string) => {
        try {
            setIsLoading(true);

            const endPoint = query
                ? `${baseUrl}/search/movie?query=${encodeURIComponent(query)}`
                : `${baseUrl}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endPoint, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error();
            }

            const result = await response.json();

            if (result.Response === 'False') {
                setErrorMessage(result.Error);
                setMovies([]);
            }

            const slice = result.results.slice(0, 5);

            setTrendingMovies(slice);
        } catch (error) {
            console.log('Error fetching trending movies', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies(debounceSearchTerm);
        fetchTrendingMovies(debounceSearchTerm);
    }, [debounceSearchTerm]);
    console.log(trendingMovies);

    return (
        <main>
            <div className="pattern" />
            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero Banner " />
                    <h1>
                        Find <span className="text-gradient">Movies</span>{' '}
                        You'll Enjoy Without the Hassle
                    </h1>
                </header>

                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                <section className="trending">
                    <h2 className="mt-[40px]">Trending Movies</h2>
                    <ul>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-[40vh] w-full">
                                <Spinner />
                            </div>
                        ) : (
                            trendingMovies.map((tMovie, index) => (
                                <li key={index}>
                                    <p>{index + 1}</p>
                                    src=
                                    {tMovie.poster_path
                                        ? `https://image.tmdb.org/t/p/w500/${tMovie.poster_path}`
                                        : './no-movie.png'}
                                    alt={tMovie.title}
                                </li>
                            ))
                        )}
                    </ul>
                </section>

                <section className="all-movies">
                    <h2 className="mt-[40px]">All Movies</h2>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-[40vh] w-full">
                            <Spinner />
                        </div>
                    ) : errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <ul>
                            {movies.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
}
