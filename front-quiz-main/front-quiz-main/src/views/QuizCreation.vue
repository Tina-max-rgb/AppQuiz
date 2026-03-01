<template>
  <section class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow space-y-6">
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

    <!-- Message erreur -->
    <div v-if="errorMessage" class="bg-red-100 text-red-700 px-4 py-2 rounded text-center">
      {{ errorMessage }}
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
            <td class="border border-gray-300 px-4 py-2">{{ q.titre }}</td>
            <td class="border border-gray-300 px-4 py-2">{{ q.duree_minutes }} min</td>
            <td class="border border-gray-300 px-4 py-2">{{ formatDate(q.created_at) }}</td>
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
            <td class="border border-gray-300 px-4 py-2">{{ q.titre }}</td>
            <td class="border border-gray-300 px-4 py-2 space-x-2">
              <button class="px-3 py-1 bg-blue-500 text-white rounded" @click="openEditModal(q)">
                Modifier
              </button>
              <button class="px-3 py-1 bg-green-500 text-white rounded" @click="goToQuestions(q.id)">
                Questions
              </button>
              <button class="px-3 py-1 bg-red-500 text-white rounded" @click="openDeleteModal(q)">
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bouton créer -->
    <div class="text-center">
      <button class="px-6 py-2 bg-blue-600 text-white font-medium rounded" @click="openCreateModal">
        Créer un questionnaire
      </button>
    </div>

    <!-- Modal création -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Créer un questionnaire</h3>
        <form @submit.prevent="saveCreate" class="space-y-3">
          <label class="block">
            <span class="text-sm">Nom</span>
            <input v-model="created.titre" class="w-full border rounded px-3 py-2" required />
          </label>
          <label class="block">
            <span class="text-sm">Description</span>
            <textarea v-model="created.description" class="w-full border rounded px-3 py-2"></textarea>
          </label>
          <label class="block">
            <span class="text-sm">Durée (minutes)</span>
            <input v-model.number="created.duree_minutes" type="number" class="w-full border rounded px-3 py-2" />
          </label>
          <label class="block">
            <span class="text-sm">Nombre de questions affichées</span>
            <input v-model.number="created.nombre_questions_affichees" type="number" class="w-full border rounded px-3 py-2" />
          </label>
          <label class="block">
            <span class="text-sm">Seuil de réussite (%)</span>
            <input v-model.number="created.seuil_reussite" type="number" class="w-full border rounded px-3 py-2" />
          </label>
          <label class="flex items-center space-x-2">
            <input v-model="created.actif" type="checkbox" />
            <span class="text-sm">Actif</span>
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
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const quizzes = ref([]);
const errorMessage = ref("");

// Axios instance avec gestion du token
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

// Interceptor request pour ajouter le token
api.interceptors.request.use(config => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    errorMessage.value = "❌ Aucun token trouvé. Connectez-vous.";
    router.push("/login");
  } else {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor response pour gérer 401 et refresh
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const res = await axios.post("http://localhost:8000/api/auth/token/refresh/", { refresh });
          localStorage.setItem("access_token", res.data.access);
          error.config.headers.Authorization = `Bearer ${res.data.access}`;
          return api.request(error.config);
        } catch {
          errorMessage.value = "❌ Votre session a expiré. Connectez-vous à nouveau.";
          router.push("/login");
        }
      } else {
        errorMessage.value = "❌ Votre session a expiré. Connectez-vous à nouveau.";
        router.push("/login");
      }
    }
    return Promise.reject(error);
  }
);

// Fetch quizzes
async function fetchQuizzes() {
  try {
    const res = await api.get("/questionnaires/");
    quizzes.value = Array.isArray(res.data) ? res.data : res.data.results || [];
  } catch (err) {
    console.error(err);
    errorMessage.value = err.response?.data?.detail || "❌ Impossible de charger les questionnaires";
  }
}
onMounted(fetchQuizzes);

// Création
const showCreateModal = ref(false);
const created = reactive({
  titre: "",
  description: "",
  duree_minutes: 30,
  nombre_questions_affichees: 10,
  seuil_reussite: 50,
  actif: true
});

function openCreateModal() { showCreateModal.value = true; }
function closeCreateModal() {
  showCreateModal.value = false;
  Object.assign(created, { titre: "", description: "", duree_minutes: 30, nombre_questions_affichees: 10, seuil_reussite: 50, actif: true });
}

async function saveCreate() {
  try {
    const res = await api.post("/questionnaires/", created);
    quizzes.value.push(res.data);
    closeCreateModal();
    router.push(`/quiz/${res.data.id}/questions`);
  } catch (err) {
    console.error(err);
    errorMessage.value = err.response?.data?.detail || "❌ Impossible de créer le questionnaire";
  }
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString();
}

// Navigation
function goToQuestions(quizId) {
  router.push(`/quiz/${quizId}/questions`);
}
</script>
