<template>
  <section class="space-y-6 max-w-4xl mx-auto">
    <div class="toolbar flex items-center justify-between">
      <h2 class="title">Bienvenue, {{ traineeName }}</h2>
      <button class="text-blue-600 hover:underline font-medium" @click="logout">
        Déconnexion
      </button>
    </div>

    <div class="flex items-center justify-center mb-6 space-x-2">
      <img src="/src/assets/image.png" alt="Quiz Logo" class="h-12" />
      <span class="text-2xl font-bold">QUIZ</span>
    </div>

    <div class="max-w-sm mx-auto">
      <UiInput
          v-model="searchTerm"
          type="text"
          placeholder="Rechercher un quiz..."
      />
    </div>

    <div v-if="isLoading" class="text-center text-gray-500 py-10">
      Loading quizzes...
    </div>
    <div v-else-if="error" class="text-center text-red-500 py-10">
      Failed to load quizzes: {{ error.message }}
    </div>

    <div v-else>
      <div v-if="quizzes.length === 0 && !isLoading" class="text-center text-gray-500 py-10">
        Aucun quiz trouvé pour "{{ searchTerm }}".
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
            v-for="quiz in quizzes"
            :key="quiz.id"
            class="card p-8 rounded-xl shadow-md flex flex-col justify-between hover:shadow-lg transition"
        >
          <div>
            <h3 class="font-semibold text-lg mb-3">{{ quiz.title }}</h3>
            <p class="text-sm text-gray-600">{{ quiz.duration }} min</p>
          </div>

          <div class="mt-6">
            <UiButton
                v-if="!quiz.dejaRealise"
                class="w-full px-3 py-1.5 text-sm"
                variant="primary"
                @click="startQuiz(quiz.id)"
            >
              Start
            </UiButton>

            <div v-else class="flex items-center justify-between space-x-2">
              <UiButton
                  variant="secondary"
                  class="px-3 py-1.5 text-sm"
                  :disabled="true"
              >
                Déjà réalisé
              </UiButton>
              <UiButton
                  variant="outline"
                  class="px-3 py-1.5 text-sm"
                  :disabled="checkingParcoursId === quiz.id"
                  @click="viewResults(quiz)"
              >
                {{ checkingParcoursId === quiz.id ? '...' : 'Voir résultats' }}
              </UiButton>
            </div>
          </div>
        </div>
      </div>


      <div v-if="count > 0 && (next || previous)" class="flex justify-between items-center mt-8">
        <UiButton
            variant="outline"
            @click="goToPage(currentPage - 1)"
            :disabled="!previous"
        >
          Précédent
        </UiButton>

        <span class="text-sm text-gray-500">
          Page {{ currentPage }}
        </span>

        <UiButton
            variant="outline"
            @click="goToPage(currentPage + 1)"
            :disabled="!next"
        >
          Suivant
        </UiButton>
      </div>

      <div v-if="parcoursError" class="text-center text-red-500 text-sm mt-4">
        {{ parcoursError }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import UiButton from '../components/UiButton.vue'
import UiInput from '../components/UiInput.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed, watch, type Ref } from 'vue'
import { useQuizzes, type Quiz } from '../composables/useQuizzes'

interface UserProfile {
  id: number;
  nom: string;
  prenom: string;
  login: string;
  email: string;
  role: string;
}
interface ParcoursItem {
  id: number;
  questionnaire_nom: string;
  statut: "EN_COURS" | "TERMINE" | "ABANDONNE";
}
interface ParcoursListResponse {
  results: ParcoursItem[];
}

const router = useRouter()

const user: Ref<UserProfile | null> = ref(null)
const traineeName = computed(() => {
  if (user.value) {
    return user.value.prenom || user.value.login || 'Stagiaire'
  }
  return 'Stagiaire'
})

const searchTerm = ref('');
const currentPage = ref(1);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const {
  quizzes, isLoading, error, fetchQuizzes,
  count, next, previous
} = useQuizzes()

const checkingParcoursId = ref<number | null>(null);
const parcoursError = ref<string | null>(null);

watch(searchTerm, (newSearchTerm) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchQuizzes(newSearchTerm, 1);
  }, 500);
});

onMounted(() => {
  fetchQuizzes('', 1);

  try {
    const userString = localStorage.getItem('user')
    if (userString) {
      user.value = JSON.parse(userString) as UserProfile
    }
  } catch (e) {
    console.error("Impossible de lire les données utilisateur du localStorage", e)
  }
})

function goToPage(page: number) {
  if (page < 1) return;
  currentPage.value = page;
  fetchQuizzes(searchTerm.value, page);
}

function logout(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
  localStorage.removeItem('refresh_token')
  router.push('/')
}

function startQuiz(id: number): void {
  router.push(`/trainee/quiz/${id}`)
}

async function viewResults(quiz: Quiz): Promise<void> {
  checkingParcoursId.value = quiz.id;
  parcoursError.value = null;

  try {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error("Token manquant.");

    const response = await fetch('http://localhost:8000/api/parcours/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("Impossible de lister les parcours.");

    const data: ParcoursListResponse = await response.json();

    const completedParcours = data.results.find(
        p => p.questionnaire_nom === quiz.title && p.statut === "TERMINE"
    );

    if (completedParcours) {
      router.push(`/trainee/parcours/${completedParcours.id}/results`);
    } else {
      parcoursError.value = `Votre parcours "${quiz.title}" est "En Cours" ou n'a pas été trouvé.`;
    }

  } catch (e) {
    if (e instanceof Error) parcoursError.value = e.message;
  } finally {
    checkingParcoursId.value = null;
  }
}
</script>