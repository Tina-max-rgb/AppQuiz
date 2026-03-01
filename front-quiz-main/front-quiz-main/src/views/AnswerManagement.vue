<template>
  <section class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow space-y-6 text-center">
    <!-- Logo + Titre -->
    <div class="flex flex-col items-center">
      <img src="/src/assets/image.png" alt="Logo Quiz" class="w-16 h-16 mb-2" />
      <h1 class="text-4xl font-bold">QUIZ</h1>
    </div>

    <!-- Sous-titre -->
    <h2 class="text-2xl font-semibold">Modifier la question</h2>

    <!-- Formulaire -->
    <div class="space-y-4 text-left">
      <div>
        <label class="block font-medium mb-1">Intitulé de la question</label>
        <input
          type="text"
          v-model="question"
          class="w-full border rounded p-2"
          placeholder="Quelle est la capitale de l’Allemagne ?"
        />
      </div>

      <div>
        <label class="block font-medium mb-2">Options:</label>
        <div class="space-y-2">
          <label class="flex items-center space-x-2" v-for="option in allOptions" :key="option">
            <input type="checkbox" v-model="answers" :value="option" class="w-5 h-5" />
            <span>{{ option }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Boutons -->
    <div class="flex flex-col items-center gap-3">
      <button
        @click="$router.push('/questions')"
        class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded w-full"
      >
        Retour à la gestion des questions
      </button>
      <button
        @click="save"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded w-40"
      >
        Sauvegarder
      </button>
    </div>
  </section>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const question = ref("Quelle est la capitale de l’Allemagne ?")
const answers = ref(["Berlin"])
const allOptions = ref(["Berlin", "Vienne", "Bruxelles", "Amsterdam"])
const questionId = ref(null) // null = création, sinon modification

// Récupérer toutes les questions
const fetchQuestions = async () => {
  try {
    const { data } = await axios.get('/api/quizzes/questions/')
    console.log('Liste des questions:', data)
  } catch (error) {
    console.error('Erreur fetch questions:', error)
  }
}

// Sauvegarder (créer ou modifier) une question
const save = async () => {
  const payload = {
    question: question.value,
    answers: answers.value
  }

  try {
    let res
    if (questionId.value) {
      // Modifier une question existante
      res = await axios.put(`/api/quizzes/questions/${questionId.value}/`, payload)
    } else {
      // Créer une nouvelle question
      res = await axios.post('/api/quizzes/questions/', payload)
    }

    alert('Question sauvegardée ✅')
    console.log('Réponse API:', res.data)
  } catch (error) {
    console.error('Erreur sauvegarde:', error)
    alert('Erreur lors de la sauvegarde ❌')
  }
}

// Récupérer les questions au montage
onMounted(() => {
  fetchQuestions()
})
</script>
