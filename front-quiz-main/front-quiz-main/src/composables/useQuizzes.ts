import { ref, type Ref } from 'vue'


interface ApiQuiz {
    id: number;
    nom: string;
    description: string;
    duree_minutes: number;
    nombre_questions: number;
    deja_realise: boolean;
}

interface ApiResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ApiQuiz[];
}

export interface Quiz {
    id: number;
    title: string;
    duration: number;
    dejaRealise: boolean;
    description: string;
}


const quizzes: Ref<Quiz[]> = ref([]);
const isLoading: Ref<boolean> = ref(false);
const error: Ref<Error | null> = ref(null);
const count: Ref<number> = ref(0);
const next: Ref<string | null> = ref(null);
const previous: Ref<string | null> = ref(null);


export function useQuizzes() {


    const fetchQuizzes = async (search: string = '', page: number = 1): Promise<void> => {

        isLoading.value = true;
        error.value = null;

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('Authentication token is missing.');
            }


            const url = new URL('http://localhost:8000/api/parcours/questionnaires-disponibles/');
            if (search) {
                url.searchParams.append('search', search);
            }
            if (page > 1) {
                url.searchParams.append('page', String(page));
            }


            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();


            quizzes.value = data.results.map((q: ApiQuiz): Quiz => ({
                id: q.id,
                title: q.nom,
                duration: q.duree_minutes,
                dejaRealise: q.deja_realise,
                description: q.description
            }));
            count.value = data.count;
            next.value = data.next;
            previous.value = data.previous;

        } catch (e) {
            if (e instanceof Error) {
                console.error('Failed to fetch quizzes:', e);
                error.value = e;
            } else {
                console.error('An unknown error occurred:', e);
                error.value = new Error('An unknown error occurred');
            }
        } finally {
            isLoading.value = false;
        }
    }


    const findQuizById = (id: number): Quiz | undefined => {
        return quizzes.value.find(q => q.id === id);
    }


    return {
        quizzes,
        isLoading,
        error,
        count,
        next,
        previous,
        fetchQuizzes,
        findQuizById
    }
}