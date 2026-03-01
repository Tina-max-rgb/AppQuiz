<template>
  <section class="min-h-[70vh] flex items-center justify-center">
    <div class="w-full max-w-md h-full">
      <div class="card text-center h-full flex flex-col justify-between">

        <img src="/src/assets/image.png" class="mx-auto h-12 w-12 mb-4" alt="logo" />

        <div v-if="!successMessage">
          <h2 class="text-2xl font-bold mb-1">Reset Password</h2>
          <p class="text-sm text-gray-500 mb-6">
            Enter your email to receive a password reset link.
          </p>

          <form @submit.prevent="sendResetLink" class="space-y-8 text-left">
            <UiInput
                label="Email"
                v-model="email"
                type="email"
                placeholder="ex: user@domaine.com"
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
                {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
              </UiButton>
              <span
                  class="text-sm text-blue-600 text-center block cursor-pointer"
                  @click="backToLogin"
              >
                Back to Sign In
              </span>
            </div>
          </form>
        </div>

        <div v-else>
          <h2 class="text-2xl font-bold mb-4">Check your email</h2>
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
import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import UiInput from '../components/UiInput.vue'
import UiButton from '../components/UiButton.vue'

const router = useRouter()
const email: Ref<string> = ref('')

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

/**
 * Appelle l'API pour envoyer le lien de réinitialisation.
 */
async function sendResetLink(): Promise<void> {
  isLoading.value = true
  errorMessage.value = null
  successMessage.value = null

  if (!email.value) {
    errorMessage.value = 'Veuillez entrer votre email.'
    isLoading.value = false
    return
  }

  try {
    const response = await fetch('http://localhost:8000/api/auth/reset-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value
      })
    })

    const data = await response.json()


    if (!response.ok) {
      throw new Error(data.email ? data.email[0] : 'Une erreur est survenue.')
    }


    successMessage.value = data.message || 'Un lien de réinitialisation a été envoyé.'
    email.value = ''

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

/**
 * Retourne à la page de connexion.
 */
function backToLogin(): void {
  router.push('/')
}
</script>