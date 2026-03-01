<template>
  <section class="max-w-4xl mx-auto space-y-6">
    <div class="flex flex-col items-center">
      <img src="/src/assets/image.png" alt="Logo Quiz" class="w-16 h-16 mb-2" />
      <h1 class="text-4xl font-bold">QUIZ</h1>
    </div>

    <div>
      <router-link to="/admin" class="text-blue-600 hover:underline text-sm">
        Retour à l’accueil
      </router-link>
    </div>

    <h2 class="title">Gestion des questions</h2>

    <!-- Tableau des questions -->
    <table class="w-full border-collapse border rounded-lg overflow-hidden">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-3 text-left">Intitulé de la question</th>
          <th class="p-3 text-left">Réponses</th>
          <th class="p-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(q, idx) in (questions || [])" :key="q?.id" class="border-t">
          <td class="p-3">{{ q?.intitule || "Sans intitulé" }}</td>
          <td class="p-3">{{ q?.reponses?.length || 0 }} réponses</td>
          <td class="p-3 flex gap-2">
            <a v-if="q?.id" href="#" class="text-blue-600" @click.prevent="$router.push(`/admin/questions/edit/${q.id}`)">Modifier</a>
            <a v-if="q?.id" href="#" class="text-red-600" @click.prevent="askDelete(idx)">Supprimer</a>
          </td>
        </tr>
        <tr v-if="!questions || questions.length === 0">
          <td colspan="3" class="text-center p-4 text-gray-500">
            Aucune question disponible
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Bouton pour ouvrir le formulaire -->
    <div class="text-center">
      <button class="bg-blue-500 text-white px-4 py-2 rounded" @click="showForm = true">
        Ajouter une question
      </button>
    </div>

    <!-- Formulaire -->
    <div v-if="showForm" class="p-4 border rounded-lg mt-4 bg-gray-50">
      <input
        v-model="newQuestion.intitule"
        type="text"
        placeholder="Intitulé de la question"
        class="border p-2 w-full mb-2"
      />
      <div v-for="(rep, i) in newQuestion.reponses" :key="i" class="flex gap-2 mb-2 items-center">
        <input v-model="rep.texte" type="text" placeholder="Réponse" class="border p-2 flex-1" />
        <label class="flex items-center gap-1">
          <input type="checkbox" v-model="rep.est_correcte" />
          Bonne
        </label>
        <UiButton variant="danger" @click="removeOption(i)">X</UiButton>
      </div>

      <UiButton variant="secondary" @click="addOption">+ Ajouter une réponse</UiButton>

      <div class="mt-4 flex gap-2">
        <UiButton variant="primary" @click="save">Enregistrer</UiButton>
        <UiButton variant="secondary" @click="cancel">Annuler</UiButton>
      </div>
    </div>

    <!-- Modal de confirmation suppression -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      aria-modal="true"
      role="dialog"
    >
      <div class="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
        <h4 class="text-lg font-semibold mb-2">Confirmer la suppression</h4>
        <p class="text-sm text-gray-600 mb-4">
          Voulez-vous vraiment supprimer
          <strong>{{ questions[toDelete]?.intitule }}</strong> ?
        </p>

        <div class="flex justify-end gap-3">
          <button @click="cancelDelete" class="px-4 py-2 border rounded">Annuler</button>
          <button @click="confirmDelete" class="px-4 py-2 bg-red-600 text-white rounded">Supprimer</button>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue"
import { useRoute } from "vue-router"
import axios from "axios"
import UiButton from "../components/UiButton.vue"

const route = useRoute()
const quizId = Number(route.params.id)

const questions = ref([])
const showForm = ref(false)
const showDeleteModal = ref(false)
const toDelete = ref(-1)

// Formulaire pour créer ou éditer
const newQuestion = reactive({
  id: null,
  intitule: "",
  questionnaire_id: quizId,
  reponses: [
    { texte: "", est_correcte: false },
    { texte: "", est_correcte: false }
  ]
})

// 🔹 Charger uniquement les questions du quiz courant
async function loadQuestions() {
  try {
    const res = await axios.get(`http://127.0.0.1:8000/api/quizzes/questions/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    })

    // 🔹 Vérifie si c’est un tableau ou un objet paginé
    const allQuestions = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data.results)
      ? res.data.results
      : []

    // 🔹 Filtrer uniquement les questions du quiz courant
    questions.value = allQuestions.filter(q => q.questionnaire_id === quizId)
  } catch (e) {
    console.error("Erreur de chargement", e.response?.data || e)
    questions.value = []
  }
}


onMounted(loadQuestions)

// --- Suppression ---
function askDelete(idx) {
  toDelete.value = idx
  showDeleteModal.value = true
}
function cancelDelete() {
  showDeleteModal.value = false
  toDelete.value = -1
}
async function confirmDelete() {
  if (toDelete.value < 0) return
  const q = questions.value[toDelete.value]
  try {
    await axios.delete(`http://127.0.0.1:8000/api/quizzes/questions/${q.id}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
    })
    questions.value.splice(toDelete.value, 1)
    alert("✅ Question supprimée avec succès")
  } catch (e) {
    console.error(e.response?.data || e)
    alert("❌ Erreur lors de la suppression")
  }
  cancelDelete()
}

// --- Gestion des réponses ---
function addOption() {
  if (newQuestion.reponses.length < 5) newQuestion.reponses.push({ texte: "", est_correcte: false })
}
function removeOption(i) {
  if (newQuestion.reponses.length > 2) newQuestion.reponses.splice(i, 1)
}

// --- Edition d’une question existante ---
function editQuestion(q) {
  newQuestion.id = q.id
  newQuestion.intitule = q.intitule
  newQuestion.reponses = q.reponses.map(r => ({ ...r }))
  showForm.value = true
}

// --- Sauvegarde (POST ou PUT) ---
async function save() {
  if (!newQuestion.intitule.trim()) return alert("Veuillez saisir l’intitulé.")
  const validReponses = newQuestion.reponses.filter(r => r.texte.trim())
  if (validReponses.length < 2) return alert("Veuillez ajouter au moins deux réponses.")
  if (!validReponses.some(r => r.est_correcte)) return alert("Cochez au moins une réponse correcte.")

  try {
    const payload = {
      questionnaire_id: quizId,
      intitule: newQuestion.intitule.trim(),
      reponses: validReponses.map(r => ({ texte: r.texte.trim(), est_correcte: !!r.est_correcte }))
    }

    if (newQuestion.id) {
      // Édition
      const res = await axios.put(`http://127.0.0.1:8000/api/quizzes/questions/${newQuestion.id}/`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
      })
      const idx = questions.value.findIndex(q => q.id === newQuestion.id)
      if (idx !== -1) questions.value.splice(idx, 1, res.data)
      alert("✅ Question modifiée avec succès !")
    } else {
      // Création
      const res = await axios.post(`http://127.0.0.1:8000/api/quizzes/questions/`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
      })
      questions.value.push(res.data)
      alert("✅ Question enregistrée avec succès !")
    }

    cancel()
  } catch (e) {
    console.error("Erreur sauvegarde", e.response?.data || e)
    alert("❌ Erreur lors de la sauvegarde : " + (JSON.stringify(e.response?.data) || "inconnue"))
  }
}

// --- Annuler / réinitialiser ---
function cancel() {
  newQuestion.id = null
  newQuestion.intitule = ""
  newQuestion.reponses = [
    { texte: "", est_correcte: false },
    { texte: "", est_correcte: false }
  ]
  showForm.value = false
}
</script>