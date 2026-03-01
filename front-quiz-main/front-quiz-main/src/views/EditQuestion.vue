<template>
  <section class="max-w-md mx-auto p-6 space-y-6 bg-white rounded-lg shadow">
    <div class="flex flex-col items-center">
      <img src="/src/assets/image.png" alt="Logo Quiz" class="w-20 h-20 mb-2" />
      <h1 class="text-2xl font-bold">Modifier la question</h1>
    </div>

    <div>
      <label class="block mb-2 font-medium">Intitulé de la question</label>
      <input
        v-model="question.intitule"
        type="text"
        placeholder="Entrez votre question"
        class="border rounded p-2 w-full"
      />
    </div>

    <div>
      <label class="block mb-2 font-medium">Options :</label>
      <div
        v-for="(opt, i) in question.reponses"
        :key="i"
        class="flex items-center gap-2 mb-2"
      >
        <input
          type="checkbox"
          v-model="opt.est_correcte"
          class="w-4 h-4 text-blue-600 border-gray-300 rounded"
        />
        <input
          type="text"
          v-model="opt.texte"
          class="border p-2 flex-1 rounded"
          placeholder="Entrez une réponse"
        />
      </div>
      <button class="text-blue-500" @click="addOption">+ Ajouter une réponse</button>
    </div>

    <div class="flex flex-col gap-4">
      <button
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-center"
        @click="goBack"
      >
        Retour à la gestion des questions
      </button>
      <button
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        @click="save"
      >
        Sauvegarder
      </button>
    </div>
  </section>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

// API pour les questions
const API_URL = "http://127.0.0.1:8000/api/quizzes/questions/"
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
    "Content-Type": "application/json",
  },
})

const question = ref({
  intitule: '',
  reponses: [
    { texte: '', est_correcte: false },
    { texte: '', est_correcte: false },
  ],
  questionnaire_id: null
})

const questionId = route.params.id

onMounted(async () => {
  try {
    const res = await api.get(`${questionId}/`)
    const data = res.data

    question.value.intitule = data.intitule || ''
    question.value.reponses = Array.isArray(data.reponses) ? data.reponses : []

    // Récupérer l'ID du questionnaire
    question.value.questionnaire_id = data.questionnaire?.id || data.questionnaire_id || null

    // Minimum 2 réponses
    while (question.value.reponses.length < 2) {
      question.value.reponses.push({ texte: '', est_correcte: false })
    }
  } catch (err) {
    console.error('Erreur chargement question', err.response?.data || err)
    router.push({ name: 'QuestionsList', params: { id: question.value.questionnaire_id || 0 } })
  }
})

function addOption() {
  if (question.value.reponses.length < 5)
    question.value.reponses.push({ texte: '', est_correcte: false })
}

async function save() {
  const validReponses = question.value.reponses
    .filter(r => r.texte.trim() !== '')
    .map(r => ({ texte: r.texte.trim(), est_correcte: r.est_correcte }))

  if (!question.value.intitule.trim()) {
    alert("Veuillez saisir l’intitulé de la question.")
    return
  }
  if (validReponses.length < 2) {
    alert("Veuillez saisir au moins 2 réponses valides.")
    return
  }
  if (!validReponses.some(r => r.est_correcte)) {
    alert("Veuillez cocher au moins une bonne réponse.")
    return
  }

  try {
    const payload = {
      questionnaire_id: question.value.questionnaire_id,
      intitule: question.value.intitule.trim(),
      reponses: validReponses
    }

    await api.put(`${questionId}/`, payload)

    // Redirection vers la liste des questions du questionnaire
    if (question.value.questionnaire_id) {
      router.push({
        name: 'QuestionsList',
        params: { id: question.value.questionnaire_id } // correspond au param :id de la route
      })
    } else {
      alert('Impossible de retrouver l’ID du questionnaire pour revenir à la liste.')
    }
  } catch (err) {
    console.error('Erreur sauvegarde', err.response?.data || err)
    alert('Erreur lors de la sauvegarde.')
  }
}

function goBack() {
  if (question.value.questionnaire_id) {
    router.push({ name: 'QuestionsList', params: { id: question.value.questionnaire_id } })
  } else {
    router.push('/admin')
  }
}
</script>