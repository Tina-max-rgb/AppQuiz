<template>
  <section class="min-h-[70vh] flex items-center justify-center">
    <div class="w-full max-w-md h-full">
      <div class="card text-center h-full flex flex-col justify-between">
        <img src="/src/assets/image.png" class="mx-auto h-12 w-12 mb-4" alt="logo" />
        <h2 class="text-2xl font-bold mb-1">Sign In</h2>

        <form @submit.prevent="loginUser" class="space-y-8 text-left">
          <UiInput label="Login" v-model="login" type="text" placeholder="ex: admin" />
          <UiInput label="Password" v-model="password" type="password" placeholder="••••••••" />
          <div class="space-y-2">
            <UiButton class="w-full" type="submit">Sign In</UiButton>
            <span class="text-sm text-blue-600 text-center block cursor-pointer" @click="forgot">
              Forgot Password?
            </span>
          </div>
        </form>

        <p v-if="errorMessage" class="text-red-500 text-sm mt-2 text-center">{{ errorMessage }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import UiInput from '../components/UiInput.vue'
import UiButton from '../components/UiButton.vue'
import {ref} from 'vue'
import {useRouter} from 'vue-router'

const router = useRouter()
const login = ref('')
const password = ref('')
const errorMessage = ref('')

async function loginUser() {
  if (!login.value || !password.value) {
    errorMessage.value = 'Veuillez remplir les champs.'
    return
  }

  try {
    const response = await fetch('http://localhost:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        login: login.value,
        password: password.value
      }),
    })

    if (!response.ok) {
      throw new Error('Login ou mot de passe incorrect')
    }

    const data = await response.json()

    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('user', JSON.stringify(data.user))

    if (data.user.role === 'ADMIN') {
      router.push('/admin')
    } else {
      router.push('/trainee/home')
    }
  } catch (err) {
    errorMessage.value = err.message
  }
}

function forgot() {
  router.push('/reset-password')
}
</script>