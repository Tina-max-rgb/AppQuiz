<template>
  <section class="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow space-y-6">
    <!-- Logo + Titre -->
    <div class="flex flex-col items-center">
      <img src="/src/assets/image.png" alt="Logo Quiz" class="w-16 h-16 mb-2" />
      <h1 class="text-4xl font-bold">QUIZ</h1>
    </div>

    <!-- Lien retour -->
    <div>
      <router-link to="/admin" class="text-blue-600 hover:underline text-sm">
        Retour à l’accueil
      </router-link>
    </div>

    <!-- Titre -->
    <h2 class="text-2xl font-semibold text-center">Gestion des questionnaires</h2>

    <!-- Message erreur / succès -->
    <div v-if="errorMessage" class="bg-red-100 text-red-700 px-4 py-2 rounded text-center">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="bg-green-100 text-green-700 px-4 py-2 rounded text-center">
      {{ successMessage }}
    </div>

    <!-- Tableau des questionnaires -->
    <div class="overflow-x-auto">
      <table class="w-full border-collapse border border-gray-300 text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="border border-gray-300 px-4 py-2 text-left">Nom</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Durée</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Date de création</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in quizzes" :key="q.id" class="hover:bg-gray-50">
            <td class="border border-gray-300 px-4 py-2">{{ q.nom }}</td>
            <td class="border border-gray-300 px-4 py-2">{{ q.duree_minutes }} min</td>
            <td class="border border-gray-300 px-4 py-2">
              {{ formatDate(q.created_at || q.date_creation || q.createdAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Actions -->
    <div class="overflow-x-auto">
      <table class="w-full border-collapse border border-gray-300 text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="border border-gray-300 px-4 py-2 text-left">Nom</th>
            <th class="border border-gray-300 px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in quizzes" :key="q.id" class="hover:bg-gray-50">
            <td class="border border-gray-300 px-4 py-2">{{ q.nom }}</td>
            <td class="border border-gray-300 px-4 py-2 flex gap-2">
              <button class="flex-1 px-3 py-1 bg-blue-500 text-white rounded" @click="openEditModal(q)">
                Modifier
              </button>
              <button class="flex-1 px-3 py-1 bg-green-500 text-white rounded" @click="goToQuestions(q.id)">
                Questions
              </button>
              <button class="flex-1 px-3 py-1 bg-red-500 text-white rounded" @click="openDeleteModal(q)">
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bouton créer -->
    <div class="text-center">
      <button class="px-6 py-2 bg-blue-600 text-white font-medium rounded" @click="showCreateModal = true">
        Créer un questionnaire
      </button>
    </div>

    <!-- Modal création questionnaire -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Créer un questionnaire</h3>
        <form @submit.prevent="createQuiz" class="space-y-3">
          <label class="block">
            <span class="text-sm">Nom</span>
            <input v-model="newQuiz.nom" class="w-full border rounded px-3 py-2" required />
          </label>
          <label class="block">
            <span class="text-sm">Durée (minutes)</span>
            <input v-model.number="newQuiz.duree_minutes" type="number" class="w-full border rounded px-3 py-2" required />
          </label>
          <label class="block">
            <span class="text-sm">Description</span>
            <textarea v-model="newQuiz.description" class="w-full border rounded px-3 py-2"></textarea>
          </label>
          <div class="flex justify-end gap-3 mt-3">
            <button type="button" @click="closeCreateModal" class="px-4 py-2 border rounded">
              Annuler
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Créer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal d'édition -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Modifier le questionnaire</h3>
        <form @submit.prevent="saveEdit" class="space-y-3">
          <label class="block">
            <span class="text-sm">Nom</span>
            <input v-model="edited.nom" class="w-full border rounded px-3 py-2" required />
          </label>
          <label class="block">
            <span class="text-sm">Durée (minutes)</span>
            <input v-model.number="edited.duree_minutes" type="number" class="w-full border rounded px-3 py-2" />
          </label>
          <div class="flex justify-end gap-3 mt-3">
            <button type="button" @click="closeEditModal" class="px-4 py-2 border rounded">
              Annuler
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal confirmation suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-sm shadow">
        <h3 class="text-lg font-semibold mb-2">Confirmer la suppression</h3>
        <p class="text-sm text-gray-600 mb-4">
          Voulez-vous vraiment supprimer le questionnaire <strong>{{ quizToDelete?.nom }}</strong> ?
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
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const quizzes = ref([]);
const errorMessage = ref("");
const successMessage = ref("");

// Modals
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);

// Nouvel objet questionnaire
const newQuiz = reactive({
  nom: "",
  description: "",
  duree_minutes: 30,
  nombre_questions_affichees: 10,
  seuil_reussite: 50,
  actif: true
});

// Axios avec token
const api = axios.create({
  baseURL: "http://localhost:8000/api/quizzes",
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    errorMessage.value = "❌ Aucun token trouvé. Connectez-vous.";
    router.push("/login");
    return config;
  }
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      errorMessage.value = "❌ Votre session a expiré. Connectez-vous à nouveau.";
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

// FORMAT DATE
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

// FETCH QUIZZES
async function fetchQuizzes() {
  try {
    const res = await api.get("/questionnaires/");
    const data = Array.isArray(res.data) ? res.data : res.data.results || [];
    quizzes.value = data.filter(q => q && q.id != null);
  } catch (err) {
    console.error("Erreur API:", err.response?.data || err.message);
    errorMessage.value = err.response?.data?.detail || "❌ Impossible de charger les questionnaires";
  }
}

onMounted(() => {
  fetchQuizzes();
});

// CREATE
async function createQuiz() {
  try {
    const res = await api.post("/questionnaires/", newQuiz);
    quizzes.value.push(res.data);
    closeCreateModal();
    successMessage.value = "✅ Questionnaire créé avec succès !";
    setTimeout(() => (successMessage.value = ""), 3000); // Supprime la notif après 3s
  } catch (err) {
    console.error("Erreur création quiz:", err.response?.data || err.message);
    errorMessage.value =
      err.response?.data?.nom?.[0] ||
      err.response?.data?.detail ||
      "❌ Impossible de créer le questionnaire";
  }
}

function closeCreateModal() {
  showCreateModal.value = false;
  Object.assign(newQuiz, {
    nom: "",
    description: "",
    duree_minutes: 30,
    nombre_questions_affichees: 10,
    seuil_reussite: 50,
    actif: true
  });
}

// EDIT
const edited = reactive({ id: null, nom: "", duree_minutes: 0 });
let editIndex = -1;

function openEditModal(q) {
  editIndex = quizzes.value.findIndex(x => x.id === q.id);
  if (editIndex === -1) return;
  Object.assign(edited, quizzes.value[editIndex]);
  showEditModal.value = true;
}
function closeEditModal() {
  showEditModal.value = false;
  Object.assign(edited, { id: null, nom: "", duree_minutes: 0 });
}
async function saveEdit() {
  try {
    const res = await api.put(`/questionnaires/${edited.id}/`, edited);
    quizzes.value[editIndex] = { ...res.data };
    closeEditModal();
    successMessage.value = "✅ Questionnaire mis à jour avec succès !";
    setTimeout(() => (successMessage.value = ""), 3000);
  } catch (err) {
    console.error("Erreur mise à jour:", err.response?.data || err.message);
    errorMessage.value = err.response?.data?.nom?.[0] || err.response?.data?.detail || "❌ Impossible de mettre à jour le questionnaire";
  }
}

// DELETE
const quizToDelete = ref(null);
function openDeleteModal(q) {
  quizToDelete.value = q;
  showDeleteModal.value = true;
}
function cancelDelete() {
  quizToDelete.value = null;
  showDeleteModal.value = false;
}
async function confirmDelete() {
  try {
    await api.delete(`/questionnaires/${quizToDelete.value.id}/`);
    quizzes.value = quizzes.value.filter(x => x.id !== quizToDelete.value.id);
    cancelDelete();
    successMessage.value = "✅ Questionnaire supprimé avec succès !";
    setTimeout(() => (successMessage.value = ""), 3000);
  } catch (err) {
    console.error("Erreur suppression:", err.response?.data || err.message);
    errorMessage.value = err.response?.data?.detail || "❌ Impossible de supprimer le questionnaire";
  }
}

// NAVIGATION QUESTIONS
function goToQuestions(quizId) {
  router.push(`/quiz/${quizId}/questions`);
}
</script>
