<template>
  <section class="max-w-4xl mx-auto space-y-6">
    <div class="flex flex-col items-center">
      <img src="/src/assets/image.png" alt="Logo Quiz" class="w-16 h-16 mb-2" />
      <h1 class="text-4xl font-bold">QUIZ</h1>
    </div>

    <h2 class="title">Gestion des questions</h2>

    <div>
      <router-link to="/admin" class="text-blue-600 hover:underline text-sm">
        Retour à l’accueil
      </router-link>
    </div>

    <div v-if="successMessage" class="bg-green-100 text-green-700 border border-green-300 px-4 py-2 rounded text-center">
      {{ successMessage }}
    </div>

    <table class="w-full border-collapse border rounded-lg overflow-hidden">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-3 text-left">Intitulé de la question</th>
          <th class="p-3 text-left">Réponses</th>
          <th class="p-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="questions.length === 0">
          <td colspan="3" class="text-center p-3">Aucune question disponible</td>
        </tr>
        <tr v-for="(q, idx) in questions" :key="q.id" class="border-t">
          <td class="p-3">{{ q.intitule }}</td>
          <td class="p-3">{{ q.reponses.length }} réponses</td>
          <td class="p-3 flex gap-2">
            <a href="#" class="text-blue-600" @click.prevent="editQuestion(q)">Modifier</a>
            <a href="#" class="text-red-600" @click.prevent="confirmDelete(idx)">Supprimer</a>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showForm" class="mt-6 space-y-2">
      <input
        v-model="newQuestion.intitule"
        type="text"
        placeholder="Intitulé de la question"
        class="border p-2 w-full mb-2"
      />

      <div v-for="(rep, i) in newQuestion.reponses" :key="i" class="flex gap-2 mb-2 items-center">
        <input v-model="rep.texte" type="text" placeholder="Réponse" class="border p-2 flex-1" />
        <label class="flex items-center gap-1">
          <input type="checkbox" v-model="rep.est_correcte" /> Bonne
        </label>
        <UiButton variant="danger" @click="removeOption(i)">X</UiButton>
      </div>

      <UiButton variant="secondary" @click="addOption">+ Ajouter une réponse</UiButton>

      <div class="mt-4 flex gap-2">
        <UiButton variant="primary" @click="save">Enregistrer</UiButton>
        <UiButton variant="secondary" @click="confirmCancel">Annuler</UiButton>
      </div>
    </div>

    <!-- Modals -->
    <div v-if="showConfirm" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full space-y-4">
        <h3 class="text-lg font-semibold">Voulez-vous vraiment supprimer cette question ?</h3>
        <div class="flex justify-end gap-3">
          <button class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" @click="cancelDelete">Non</button>
          <button class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" @click="deleteConfirmed">Oui</button>
        </div>
      </div>
    </div>

    <div v-if="showCancelConfirm" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full space-y-4">
        <h3 class="text-lg font-semibold">Voulez-vous vraiment annuler ?</h3>
        <div class="flex justify-end gap-3">
          <button class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" @click="cancelCancel">Non</button>
          <button class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" @click="cancelForm">Oui</button>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import UiButton from '../components/UiButton.vue'

const route = useRoute()
const router = useRouter()

// 🔹 Récupérer l'ID du quiz depuis le param correct
const currentQuizId = Number(route.params.id || (Array.isArray(route.params.id) ? route.params.id[0] : 0))
if (!currentQuizId || isNaN(currentQuizId)) {
  alert('⚠️ ID du quiz manquant ou invalide !')
  router.push('/admin')
}

const API_BASE = 'http://127.0.0.1:8000/api/quizzes/'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
    'Content-Type': 'application/json'
  }
})

const questions = ref([])
const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const successMessage = ref('')
const showConfirm = ref(false)
const showCancelConfirm = ref(false)
const questionToDelete = ref(null)

const newQuestion = reactive({
  intitule: '',
  reponses: [
    { texte: '', est_correcte: false },
    { texte: '', est_correcte: false }
  ]
})

// --- Charger uniquement les questions du quiz courant ---
async function loadQuestions() {
  if (!currentQuizId) return
  try {
    const res = await api.get(`questionnaires/${currentQuizId}/questions/`)
    questions.value = res.data.results || res.data
  } catch (err) {
    console.error('Erreur chargement questions', err.response?.data || err)
    questions.value = []
  }
}

// --- Initialisation ---
onMounted(() => {
  loadQuestions()
})

// --- Formulaire ---
function addOption() {
  if (newQuestion.reponses.length < 5)
    newQuestion.reponses.push({ texte: '', est_correcte: false })
}

function removeOption(i) {
  if (newQuestion.reponses.length > 2)
    newQuestion.reponses.splice(i, 1)
}

function resetForm() {
  newQuestion.intitule = ''
  newQuestion.reponses.splice(
    0,
    newQuestion.reponses.length,
    { texte: '', est_correcte: false },
    { texte: '', est_correcte: false }
  )
  isEditing.value = false
  editingId.value = null
  showForm.value = false
}

function confirmCancel() { showCancelConfirm.value = true }
function cancelCancel() { showCancelConfirm.value = false }
function cancelForm() { showCancelConfirm.value = false; resetForm() }

// --- Sauvegarde d'une question ---
async function save() {
  if (!newQuestion.intitule.trim()) return alert("Veuillez saisir l’intitulé de la question.")

  const validReponses = newQuestion.reponses
    .filter(r => r.texte.trim())
    .map(r => ({ texte: r.texte.trim(), est_correcte: r.est_correcte }))

  if (validReponses.length < 2) return alert("Veuillez saisir au moins 2 réponses valides.")
  if (!validReponses.some(r => r.est_correcte)) return alert("Veuillez cocher au moins une bonne réponse.")

  // Convertir questionnaire_id en entier
  const quizId = Array.isArray(currentQuizId) ? Number(currentQuizId[0]) : Number(currentQuizId)

  const payload = {
    questionnaire_id: quizId,
    intitule: newQuestion.intitule.trim(),
    reponses: validReponses
  }

  try {
    if (isEditing.value && editingId.value) {
      await api.put(`questions/${editingId.value}/`, payload)
    } else {
      await api.post('questions/', payload)
    }
    await loadQuestions()
    resetForm()
  } catch (err) {
    console.error('Erreur sauvegarde :', err.response?.data || err)
    alert('Erreur lors de la sauvegarde.')
  }
}

// --- Edition d'une question existante ---
function editQuestion(question) {
  showForm.value = true
  isEditing.value = true
  editingId.value = question.id
  newQuestion.intitule = question.intitule
  newQuestion.reponses = question.reponses.map(r => ({ texte: r.texte, est_correcte: r.est_correcte }))
}

// --- Suppression ---
function confirmDelete(i) {
  questionToDelete.value = i
  showConfirm.value = true
}
function cancelDelete() {
  showConfirm.value = false
  questionToDelete.value = null
}

async function deleteConfirmed() {
  if (questionToDelete.value === null) return
  const id = questions.value[questionToDelete.value].id
  try {
    await api.delete(`questions/${id}/`)
    await loadQuestions()
    successMessage.value = '✅ Question supprimée avec succès !'
    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err) {
    console.error('Erreur suppression :', err.response?.data || err)
  }
  showConfirm.value = false
  questionToDelete.value = null
}
</script>