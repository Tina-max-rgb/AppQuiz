<template>
  <section class="space-y-6 max-w-4xl mx-auto">
    <div class="toolbar flex items-center justify-between">
      <h2 class="title">Accueil administrateur</h2>
      <!-- Bouton de déconnexion en primary -->
     <button class="text-blue-600 hover:underline font-medium" @click="logout">
  Déconnexion
</button>

    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Carte : Gestion des comptes stagiaires -->
      <div class="card p-6 flex flex-col justify-between">
        <div>
          <div class="text-4xl mb-3">👥</div>
          <h3 class="font-semibold mb-2">Gestion des comptes stagiaires</h3>
          <p class="text-sm text-muted">Créer, modifier et gérer les rôles des stagiaires.</p>
        </div>
        <div class="mt-4">
          <UiButton class="w-full" variant="primary" @click="router.push('/admin/users')">
            Voir les comptes
          </UiButton>
        </div>
      </div>

      <!-- Carte : Gestion des questionnaires -->
      <div class="card p-6 flex flex-col justify-between">
        <div>
          <div class="text-4xl mb-3">📝</div>
          <h3 class="font-semibold mb-2">Gestion des questionnaires</h3>
          <p class="text-sm text-muted">Ajouter, modifier ou supprimer des questions.</p>
        </div>
        <div class="mt-4">
          <UiButton class="w-full" variant="primary" @click="router.push('/dashboard')">
            Voir les questionnaires
          </UiButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import UiButton from '../components/UiButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  // Supprimer le token si tu l’utilises
  localStorage.removeItem('authToken')

  // Redirection vers la page de Login (chemin "/")
  router.push('/')
}
</script>

