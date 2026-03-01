<template>
  <section class="flex justify-center min-h-screen pt-10">

    <div v-if="isLoadingQuiz" class="text-center text-gray-500">
      Chargement des données du quiz...
    </div>

    <div v-else-if="quizError" class="text-center text-red-500">
      <p>Impossible de charger la liste des quiz :</p>
      <p class="text-sm">{{ quizError.message }}</p>
      <UiButton class="mt-4" @click="cancel">Retour à l'accueil</UiButton>
    </div>

    <div v-else-if="!quiz" class="text-center text-red-500">
      <p>Quiz non trouvé (ID : {{ quizId }}).</p>
      <UiButton class="mt-4" @click="cancel">Retour à l'accueil</UiButton>
    </div>

    <div v-else class="card p-6 max-w-md text-center">
      <div class="flex justify-center mb-4">
        <img src="/src/assets/image.png" alt="Quiz Logo" class="h-12" />
      </div>

      <h2 class="text-2xl font-semibold mb-4">{{ quiz.title }}</h2>

      <p class="text-gray-600 mb-2">
        {{ quiz.description }}
      </p>

      <p class="text-gray-500 mb-6">
        Durée : {{ quiz.duration }} minutes
      </p>

      <div class="space-y-3">
        <UiButton
            class="w-full"
            variant="primary"
            @click="start"
            :disabled="isStarting"
        >
          {{ isStarting ? 'Démarrage...' : (quiz.dejaRealise ? 'Recommencer' : 'Commencer') }}
        </UiButton>
        <button
            class="w-full text-blue-600 hover:underline font-medium"
            @click="cancel"
            :disabled="isStarting"
        >
          Annuler
        </button>
      </div>

      <p v-if="startError" class="text-red-500 text-sm mt-4">
        {{ startError }}
      </p>
    </div>

  </section>
</template>

<script setup lang="ts">
import UiButton from '../components/UiButton.vue'
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted, type Ref } from 'vue'
import { useQuizzes, type Quiz } from '../composables/useQuizzes'

interface ParcoursItem {
  id: number;
  questionnaire_nom: string;
  statut: "EN_COURS" | "TERMINE" | "ABANDONNE";
}

interface ParcoursListResponse {
  results: ParcoursItem[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface ParcoursStartResponse {
  id: number;
}

const router = useRouter()
const route = useRoute()

const { findQuizById, fetchQuizzes, isLoading: isLoadingQuiz, error: quizError } = useQuizzes()

const quiz: Ref<Quiz | undefined> = ref()
const quizId = ref<number | null>(null)

const isStarting = ref(false)
const startError = ref<string | null>(null)

onMounted(async () => {
  const idFromRoute = Number(route.params.id as string)
  quizId.value = idFromRoute

  await fetchQuizzes()

  if (!quizError.value) {
    quiz.value = findQuizById(idFromRoute)
  }
})

async function start() {
  if (!quiz.value) {
    startError.value = "Les détails du quiz ne sont pas encore chargés."
    return;
  }

  isStarting.value = true;
  startError.value = null;

  try {
    let parcoursId = await findExistingParcoursByName(quiz.value.title);

    if (!parcoursId) {
      parcoursId = await createNewParcours(quiz.value.id);
    }

    router.push(`/trainee/parcours/${parcoursId}/play?duration=${quiz.value.duration}`);

  } catch (e) {
    if (e instanceof Error) startError.value = e.message;
  } finally {
    isStarting.value = false;
  }
}

async function findExistingParcoursByName(quizTitle: string): Promise<number | null> {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:8000/api/parcours/', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) throw new Error("Impossible de lister les parcours existants.");

  const data: ParcoursListResponse = await response.json();

  const existingParcours = data.results.find(
      p => p.questionnaire_nom === quizTitle && p.statut === "EN_COURS"
  );

  return existingParcours ? existingParcours.id : null;
}

async function createNewParcours(questionnaireId: number): Promise<number> {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:8000/api/parcours/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ questionnaire_id: questionnaireId })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(`Impossible de créer le parcours: ${JSON.stringify(errData)}`);
  }

  const data: ParcoursStartResponse = await response.json();
  return data.id;
}

function cancel() {
  router.push('/trainee/home');
}
</script>