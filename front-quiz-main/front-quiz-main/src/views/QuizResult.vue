<template>
  <section class="flex justify-center min-h-screen pt-10 pb-20">

    <div v-if="isLoading" class="text-center py-20">
      <p class="text-gray-500">Chargement de vos résultats...</p>
    </div>

    <div v-else-if="error" class="text-center py-20">
      <p class="text-red-500 font-semibold">Une erreur est survenue :</p>
      <p class="text-red-400 text-sm mb-4">{{ error.message }}</p>
      <UiButton @click="goHome" variant="secondary">Retour à l'accueil</UiButton>
    </div>

    <div v-else-if="results" class="card p-6 max-w-2xl w-full space-y-8">

      <div class="text-center">
        <h2 class="text-2xl font-bold text-blue-600 mb-2">Quiz Terminé !</h2>
        <h3 class="text-xl font-semibold">{{ results.questionnaire.nom }}</h3>
        <p class="text-sm text-gray-500">Résultats pour {{ results.stagiaire_prenom }} {{ results.stagiaire_nom }}</p>
      </div>

      <div class="bg-gray-50 p-6 rounded-lg text-center">
        <p class="text-sm text-gray-600">Votre score</p>
        <p class="text-5xl font-bold my-2">{{ results.note_sur_20 }} / 20</p>
        <p class="text-lg font-medium" :class="getPerformanceClass(results.niveau_performance)">
          {{ results.niveau_performance }}
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Statut" :value="results.statut" />
        <StatCard title="Temps passé" :value="`${results.temps_passe_minutes} min`" />
        <StatCard title="Bonnes réponses" :value="results.statistiques_detaillees.questions_correctes" />
        <StatCard title="Partielles" :value="results.statistiques_detaillees.questions_partiellement_correctes" />
        <StatCard title="Incorrectes" :value="results.statistiques_detaillees.questions_incorrectes" />
        <StatCard title="Taux de réussite" :value="`${results.statistiques_detaillees.taux_reussite} %`" />
      </div>

      <div v-if="results.recommandations && results.recommandations.length > 0">
        <h4 class="text-lg font-semibold mb-2">Recommandations</h4>
        <ul class="list-disc list-inside bg-gray-50 p-4 rounded-lg space-y-1">
          <li v-for="(reco, index) in results.recommandations" :key="index" class="text-gray-700">
            {{ reco }}
          </li>
        </ul>
      </div>

      <div v-if="results.reponses_utilisateur && results.reponses_utilisateur.length > 0">
        <h4 class="text-lg font-semibold mb-3">Détail de vos réponses</h4>
        <div class="space-y-4">
          <div
              v-for="reponse in results.reponses_utilisateur"
              :key="reponse.id"
              class="border p-4 rounded-lg"
              :class="getAnswerClass(reponse.est_correcte, reponse.est_partiellement_correcte)"
          >
            <p class="font-semibold mb-2">{{ reponse.question.intitule }}</p>
            <div class="text-sm">
              <p class="font-medium">Vos réponses :</p>
              <ul class="list-disc list-inside ml-4">
                <li v-for="selection in reponse.reponses_selectionnees" :key="selection.id">
                  {{ selection.texte }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center pt-4 border-t">
        <UiButton @click="goHome" variant="primary">Retour à l'accueil</UiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import UiButton from '../components/UiButton.vue'
import StatCard from '../components/StatCard.vue'
import { ref, onMounted, computed, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'



interface QuestionnaireBase {
  id: number;
  nom: string;
  description: string;
  duree_minutes: number;
}

interface ReponseSelectionnee {
  id: number;
  question_id: number;
  texte: string;
  est_correcte: boolean;
}

interface QuestionBase {
  id: number;
  questionnaire_id: number;
  intitule: string;
}

interface ReponseUtilisateur {
  id: number;
  question: QuestionBase;
  reponses_selectionnees: ReponseSelectionnee[];
  est_correcte: boolean;
  est_partiellement_correcte: boolean;
  score_obtenu: string | null;
  temps_reponse_sec: number;
}

interface StatistiquesDetaillees {
  questions_correctes: number;
  questions_partiellement_correctes: number;
  questions_incorrectes: number;
  taux_reussite: number;
}

interface ResultatsDetailles {
  id: number;
  questionnaire: QuestionnaireBase;
  stagiaire_nom: string;
  stagiaire_prenom: string;
  stagiaire_societe: string;
  date_realisation: string;
  statut: string;
  note_obtenue: string | null;
  note_sur_20: string;
  niveau_performance: string;
  temps_passe_minutes: string;
  statistiques_detaillees: StatistiquesDetaillees;
  recommandations: string[];
  reponses_utilisateur: ReponseUtilisateur[];
}

// --- Initialisation ---
const router = useRouter()
const route = useRoute()

// --- État Réactif ---
const parcoursId = ref<number | null>(null)
const results: Ref<ResultatsDetailles | null> = ref(null)
const isLoading = ref(true)
const error = ref<Error | null>(null)

/**
 * Charge les résultats détaillés depuis l'API.
 */
async function fetchResults(id: number): Promise<void> {
  isLoading.value = true
  error.value = null

  try {
    const token = localStorage.getItem('access_token')
    if (!token) {
      throw new Error("Token d'authentification manquant.")
    }

    const response = await fetch(
        `http://localhost:8000/api/parcours/${id}/resultats-detailles/`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
    )

    if (!response.ok) {
      throw new Error(`Impossible de charger les résultats (status: ${response.status})`)
    }

    const data: ResultatsDetailles = await response.json()
    results.value = data

  } catch (e) {
    if (e instanceof Error) error.value = e
  } finally {
    isLoading.value = false
  }
}

/**
 * Navigue vers la page d'accueil.
 */
function goHome() {
  router.push('/trainee/home')
}

/**
 * Fonctions utilitaires pour le template
 */
function getPerformanceClass(niveau: string): string {
  if (niveau === 'Insuffisant') return 'text-red-500'
  if (niveau === 'Moyen') return 'text-yellow-500'
  if (niveau === 'Bon' || niveau === 'Excellent') return 'text-green-500'
  return 'text-gray-700'
}

function getAnswerClass(estCorrecte: boolean, estPartiel: boolean): string {
  if (estCorrecte) return 'bg-green-50 border-green-300'
  if (estPartiel) return 'bg-yellow-50 border-yellow-300'
  return 'bg-red-50 border-red-300'
}

onMounted(() => {
  const idFromRoute = Number(route.params.id as string)

  if (isNaN(idFromRoute)) {
    error.value = new Error("ID de parcours invalide dans l'URL.")
    isLoading.value = false
    return
  }

  parcoursId.value = idFromRoute
  fetchResults(idFromRoute)
})
</script>