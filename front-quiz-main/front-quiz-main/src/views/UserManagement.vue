<template>
  <section class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow space-y-6">
    <!-- Logo + Titre -->
    <div class="flex flex-col items-center">
      <img src="/src/assets/image.png" alt="Logo Quiz" class="w-16 h-16 mb-2" />
      <h1 class="text-4xl font-bold">QUIZ</h1>
    </div>

    <!-- Bouton retour -->
    <div>
      <router-link to="/admin" class="text-blue-600 hover:underline text-sm">
        Retour à l’accueil
      </router-link>
    </div>

    <!-- Sous-titre -->
    <h2 class="text-2xl font-semibold text-center">
      {{ isEditing ? "Modifier un stagiaire" : "Ajouter un stagiaire" }}
    </h2>

    <!-- Formulaire -->
    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="block font-medium mb-1">Nom</label>
        <input v-model="form.nom" type="text" class="w-full border rounded p-2" />
      </div>

      <div>
        <label class="block font-medium mb-1">Prénom</label>
        <input v-model="form.prenom" type="text" class="w-full border rounded p-2" />
      </div>

      <div>
        <label class="block font-medium mb-1">Email</label>
        <input v-model="form.email" type="email" class="w-full border rounded p-2" />
      </div>

      <div>
        <label class="block font-medium mb-1">Société</label>
        <input v-model="form.societe" type="text" class="w-full border rounded p-2" />
      </div>

      <div>
        <label class="block font-medium mb-1">Promotion</label>
        <input v-model="form.promotion" type="text" class="w-full border rounded p-2" />
      </div>

      <div>
        <label class="block font-medium mb-1">Spécialité</label>
        <input v-model="form.specialite" type="text" class="w-full border rounded p-2" />
      </div>

      <div>
        <label class="block font-medium mb-1">Login</label>
        <input v-model="form.login" type="text" class="w-full border rounded p-2" />
      </div>

      <div>
        <label class="block font-medium mb-1">Mot de passe</label>
        <input v-model="form.password" type="password" class="w-full border rounded p-2" />
      </div>

      <div v-if="!isEditing">
        <label class="block font-medium mb-1">Confirmer le mot de passe</label>
        <input v-model="form.confirmPassword" type="password" class="w-full border rounded p-2" />
      </div>

      <div class="flex gap-3 items-center">
        <button
          type="submit"
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          {{ isEditing ? "Enregistrer" : "Créer" }}
        </button>

        <button
          v-if="isEditing"
          type="button"
          @click="cancelEdit"
          class="px-4 py-2 border border-gray-300 rounded text-gray-700"
        >
          Annuler
        </button>
      </div>
    </form>

    <!-- Liste des stagiaires -->
    <div class="space-y-3">
      <h3 class="text-lg font-semibold">Liste des stagiaires ({{ users.length }})</h3>

      <!-- Recherche -->
      <input
        v-model="search"
        @input="fetchUsers"
        type="text"
        placeholder="Rechercher..."
        class="w-full border rounded p-2 text-sm"
      />

      <ul class="space-y-2">
        <li
          v-for="(u, idx) in users"
          :key="u.id"
          class="p-3 border rounded-xl flex items-center justify-between"
        >
          <div>
            <p class="font-medium">{{ u.nom }} {{ u.prenom }}</p>
            <p class="text-xs text-gray-600">{{ u.email }} — {{ u.specialite }}</p>
          </div>

          <div class="flex gap-2">
            <button
              @click="startEdit(idx)"
              class="px-3 py-1 bg-blue-600 text-white rounded hover:opacity-95"
              title="Modifier"
            >
              Éditer
            </button>

            <button
              @click="askDelete(idx)"
              class="px-3 py-1 bg-red-500 text-white rounded hover:opacity-95"
              title="Supprimer"
            >
              Supprimer
            </button>
          </div>
        </li>

        <li v-if="users.length === 0" class="p-3 text-sm text-gray-500">
          Aucun stagiaire pour l'instant.
        </li>
      </ul>

      <!-- Pagination -->
      <div class="flex justify-between items-center mt-3" v-if="count > pageSize">
        <button
          :disabled="!prev"
          @click="changePage(prev)"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Précédent
        </button>
        <button
          :disabled="!next"
          @click="changePage(next)"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  </section>

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
        <strong>{{ users[toDelete]?.nom }} {{ users[toDelete]?.prenom }}</strong> ?
      </p>

      <div class="flex justify-end gap-3">
        <button @click="cancelDelete" class="px-4 py-2 border rounded">Annuler</button>
        <button @click="confirmDelete" class="px-4 py-2 bg-red-600 text-white rounded">
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue"
import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" }
})

// Ajouter le token automatiquement pour chaque requête
api.interceptors.request.use(config => {
  const token = localStorage.getItem("access_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const form = reactive({
  nom: "",
  prenom: "",
  email: "",
  societe: "",
  promotion: "",
  specialite: "",
  login: "",
  password: "",
  confirmPassword: ""
})

const users = ref([])
const isEditing = ref(false)
const editIndex = ref(-1)
const showDeleteModal = ref(false)
const toDelete = ref(-1)

// Pagination
const count = ref(0)
const next = ref(null)
const prev = ref(null)
const pageSize = 10
const search = ref("")

async function fetchUsers(url = `/stagiaires/?ordering=nom&page_size=${pageSize}&search=${search.value}`) {
  try {
    const res = await api.get(url)
    users.value = res.data.results || res.data
    count.value = res.data.count || users.value.length
    next.value = res.data.next
    prev.value = res.data.previous
  } catch (e) {
    console.error(e)
    alert("Erreur lors du chargement ❌")
  }
}

onMounted(fetchUsers)

function resetForm() {
  Object.assign(form, {
    nom: "",
    prenom: "",
    email: "",
    societe: "",
    promotion: "",
    specialite: "",
    login: "",
    password: "",
    confirmPassword: ""
  })
  isEditing.value = false
  editIndex.value = -1
}

async function submit() {
  if (!form.nom || !form.prenom || !form.email || !form.societe) {
    alert("Merci de renseigner le nom, prénom, email et société.")
    return
  }

  if (!isEditing.value && form.password !== form.confirmPassword) {
    alert("Les mots de passe ne correspondent pas ❌")
    return
  }

  try {
    if (isEditing.value && editIndex.value >= 0) {
      const u = users.value[editIndex.value]
      await api.put(`/stagiaires/${u.id}/`, {
        nom: form.nom,
        prenom: form.prenom,
        societe: form.societe,
        promotion: form.promotion,
        specialite: form.specialite,
        login: form.login,
        email: form.email
      })
      alert("Stagiaire mis à jour ✅")
    } else {
      await api.post("/stagiaires/", {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        login: form.login,
        societe: form.societe,
        promotion: form.promotion,
        specialite: form.specialite,
        password: form.password,
        confirm_password: form.confirmPassword // <-- correct pour le backend
      })
      alert("Stagiaire ajouté ✅")
    }
    await fetchUsers()
    resetForm()
  } catch (e) {
    console.error(e.response?.data || e)
    alert("Erreur lors de l’envoi ❌\n" + (e.response?.data ? JSON.stringify(e.response.data) : ""))
  }
}

function startEdit(index) {
  const u = users.value[index]
  form.nom = u.nom
  form.prenom = u.prenom
  form.email = u.email
  form.societe = u.societe
  form.promotion = u.promotion
  form.specialite = u.specialite
  form.login = u.login
  form.password = ""
  form.confirmPassword = ""
  isEditing.value = true
  editIndex.value = index
  window.scrollTo({ top: 0, behavior: "smooth" })
}

function cancelEdit() {
  resetForm()
}

function askDelete(index) {
  toDelete.value = index
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  toDelete.value = -1
}

async function confirmDelete() {
  if (toDelete.value >= 0 && toDelete.value < users.value.length) {
    const u = users.value[toDelete.value]
    try {
      await api.delete(`/stagiaires/${u.id}/`)
      alert("Stagiaire supprimé ✅")
      await fetchUsers()
    } catch (e) {
      console.error(e)
      alert("Erreur lors de la suppression ❌")
    }
  }
  cancelDelete()
}

function changePage(url) {
  if (url) fetchUsers(url)
}
</script>
