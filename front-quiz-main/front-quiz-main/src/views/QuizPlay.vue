<template>
  <section class="flex justify-center min-h-screen pt-10">
    <div class="card p-6 max-w-xl w-full">

      <div class="text-2xl font-bold text-blue-600 text-center mb-4">
        {{ timerDisplay }}
      </div>
      <div v-if="isLoading" class="text-center py-20">
        <p class="text-gray-500">{{ loadingMessage }}</p>
      </div>

      <div v-else-if="error" class="text-center py-20">
        <p class="text-red-500 font-semibold">Une erreur est survenue :</p>
        <p class="text-red-400 text-sm mb-4">{{ error.message }}</p>
        <UiButton @click="goHome" variant="secondary">Retour à l'accueil</UiButton>
      </div>

      <div v-else-if="currentQuestion" class="space-y-6">
        <div class="text-center text-sm text-gray-500 mb-2">
          Question {{ currentQuestion.numero_question }} / {{ currentQuestion.total_questions }}
        </div>

        <h2 class="text-xl font-semibold text-center mb-4">
          {{ currentQuestion.intitule }}
        </h2>

        <div class="space-y-3">
          <label
              v-for="reponse in currentQuestion.reponses"
              :key="reponse.id"
              class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
              :class="{ 'bg-blue-50 border-blue-500': selectedAnswers.includes(reponse.id) }"
          >
            <input
                type="checkbox"
                :value="reponse.id"
                v-model="selectedAnswers"
                class="h-5 w-5 text-blue-600 rounded"
            />
            <span class="ml-3 text-gray-700">{{ reponse.texte }}</span>
          </label>
        </div>

        <UiButton
            class="w-full"
            @click="submitAnswer"
            :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Soumission...' : 'Valider la réponse' }}
        </UiButton>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import UiButton from '../components/UiButton.vue'
import { ref, onMounted, onUnmounted, computed, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'


interface ReponseStagiaire {
  id: number;
  texte: string;
}
interface QuestionStagiaire {
  id: number;
  intitule: string;
  reponses: ReponseStagiaire[];
  numero_question: number;
  total_questions: number;
}
interface QuizFinishedError {
  error: string;
}


const router = useRouter()
const route = useRoute()

const parcoursId = ref<number | null>(null)
const currentQuestion: Ref<QuestionStagiaire | null> = ref(null)
const selectedAnswers: Ref<number[]> = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const error = ref<Error | null>(null)
const loadingMessage = ref("Chargement de la question...")


const timerSeconds = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;


const timerDisplay = computed(() => {
  const minutes = Math.floor(timerSeconds.value / 60);
  const seconds = timerSeconds.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});


function startTimer(durationInMinutes: number) {
  if (timerInterval) clearInterval(timerInterval);

  timerSeconds.value = durationInMinutes * 60;

  timerInterval = setInterval(() => {
    timerSeconds.value--;

    if (timerSeconds.value <= 0) {
      clearInterval(timerInterval!);
      timerInterval = null;
      alert("Le temps est écoulé ! Votre quiz va être finalisé.");
      finishParcours();
    }
  }, 1000);
}

/**
 * NOUVEAU: Arrête le timer
 */
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

/**
 * Au montage : Lire l'ID du parcours ET la durée, puis démarrer
 */
onMounted(() => {
  const idFromRoute = Number(route.params.id as string);
  const durationFromQuery = Number(route.query.duration as string);

  if (isNaN(idFromRoute)) {
    error.value = new Error("ID du parcours invalide dans l'URL.");
    isLoading.value = false;
    return;
  }

  parcoursId.value = idFromRoute;

  if (!isNaN(durationFromQuery) && durationFromQuery > 0) {
    startTimer(durationFromQuery);
  } else {
    startTimer(60);
  }

  fetchCurrentQuestion();
});

/**
 * NOUVEAU: Nettoyer le timer en quittant la page
 */
onUnmounted(() => {
  stopTimer();
});


/**
 * Récupère la question courante.
 */
async function fetchCurrentQuestion(): Promise<void> {
  if (!parcoursId.value) return;
  isLoading.value = true;
  error.value = null;
  loadingMessage.value = "Chargement de la question...";
  let response;

  try {
    const token = localStorage.getItem('access_token');
    response = await fetch(
        `http://localhost:8000/api/parcours/${parcoursId.value}/question-courante/`,
        { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (response.status === 400) {
      const errorData: QuizFinishedError = await response.json();
      if (errorData.error && errorData.error.includes("Toutes les questions ont été répondues")) {
        // C'est la fin, on arrête le timer et on finalise
        stopTimer();
        await finishParcours();
        return;
      } else {
        throw new Error(`Erreur 400: ${JSON.stringify(errorData)}`);
      }
    }

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement de la question (status: ${response.status})`);
    }

    const data: QuestionStagiaire = await response.json();
    currentQuestion.value = data;
    selectedAnswers.value = [];

  } catch (e) {
    if (e instanceof Error) error.value = e;
  } finally {
    if (response && response.ok) {
      isLoading.value = false;
    }
  }
}

/**
 * Soumet la réponse.
 */
async function submitAnswer(): Promise<void> {
  if (selectedAnswers.value.length === 0) {
    alert('Veuillez sélectionner au moins une réponse.');
    return;
  }
  isSubmitting.value = true;
  error.value = null;
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(
        `http://localhost:8000/api/parcours/${parcoursId.value}/repondre/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            question_id: currentQuestion.value?.id,
            reponses_selectionnees_ids: selectedAnswers.value,
          })
        }
    );
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(`Erreur lors de la soumission: ${JSON.stringify(errData)}`);
    }
    await fetchCurrentQuestion();
  } catch (e) {
    if (e instanceof Error) error.value = e;
  } finally {
    isSubmitting.value = false;
  }
}

/**
 * Appelle l'endpoint pour finaliser le parcours.
 */
async function finishParcours(): Promise<void> {

  stopTimer();

  if (!parcoursId.value) return;
  isLoading.value = true;
  loadingMessage.value = "Finalisation du quiz...";
  error.value = null;

  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(
        `http://localhost:8000/api/parcours/${parcoursId.value}/terminer/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(`Impossible de finaliser le parcours: ${JSON.stringify(errData)}`);
    }

    router.push(`/trainee/parcours/${parcoursId.value}/results`);

  } catch (e) {
    if (e instanceof Error) {
      error.value = e;
    }
  } finally {
    isLoading.value = false;
  }
}

function goHome() {
  router.push('/trainee/home')
}
</script>