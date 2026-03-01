<template>
  <section class="min-h-[70vh] flex items-center justify-center">
    <div class="w-full max-w-md h-full">
      <div class="card text-center h-full flex flex-col justify-between">

        <img src="/src/assets/image.png" class="mx-auto h-12 w-12 mb-4" alt="logo" />

        <div v-if="!successMessage">
          <h2 class="text-2xl font-bold mb-1">Set New Password</h2>
          <p class="text-sm text-gray-500 mb-6">
            Veuillez entrer votre nouveau mot de passe.
          </p>

          <form @submit.prevent="confirmReset" class="space-y-8 text-left">
            <UiInput
                label="Nouveau mot de passe"
                v-model="newPassword"
                type="password"
                placeholder="••••••••"
            />
            <UiInput
                label="Confirmer le mot de passe"
                v-model="confirmPassword"
                type="password"
                placeholder="••••••••"
            />

            <p v-if="errorMessage" class="text-red-500 text-sm text-center -my-3">
              {{ errorMessage }}
            </p>

            <div class="space-y-2">
              <UiButton
                  class="w-full"
                  type="submit"
                  :disabled="isLoading"
              >
                {{ isLoading ? 'Saving...' : 'Save New Password' }}
              </UiButton>
            </div>
          </form>
        </div>

        <div v-else>
          <h2 class="text-2xl font-bold mb-4">Password Reset</h2>
          <p class="text-gray-600 mb-6">
            {{ successMessage }}
          </p>
          <UiButton class="w-full" variant="primary" @click="backToLogin">
            Back to Sign In
          </UiButton>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import UiInput from '../components/UiInput.vue'
import UiButton from '../components/UiButton.vue'

const router = useRouter()
const route = useRoute()

const newPassword = ref('')
const confirmPassword = ref('')

const uidb64 = ref<string | null>(null)
const token = ref<string | null>(null)

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

onMounted(() => {
  uidb64.value = route.params.uidb64 as string
  token.value = route.params.token as string

  if (!uidb64.value || !token.value) {
    errorMessage.value = "Lien de réinitialisation invalide ou incomplet."
  }
})

async function confirmReset(): Promise<void> {
  isLoading.value = true
  errorMessage.value = null
  successMessage.value = null

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas.'
    isLoading.value = false
    return
  }

  if (!uidb64.value || !token.value) {
    errorMessage.value = "Lien invalide. Impossible d'envoyer la requête."
    isLoading.value = false
    return
  }

  try {
    const response = await fetch('http://localhost:8000/api/auth/reset-password-confirm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uidb64: uidb64.value,
        token: token.value,
        new_password: newPassword.value,
        confirm_password: confirmPassword.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Une erreur est survenue.')
    }

    successMessage.value = data.message || 'Votre mot de passe a été réinitialisé avec succès.'

  } catch (err) {
    if (err instanceof Error) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = 'Une erreur inconnue est survenue.'
    }
  } finally {
    isLoading.value = false
  }
}

function backToLogin(): void {
  router.push('/')
}
</script>