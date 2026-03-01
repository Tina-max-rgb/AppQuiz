import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import QuizCreation from '../views/QuizCreation.vue'
import QuestionCreation from '../views/QuestionCreation.vue'
import AnswerManagement from '../views/AnswerManagement.vue'
import UserManagement from '../views/UserManagement.vue'
import QuizPlay from '../views/QuizPlay.vue'
import Admin from '../views/Admin.vue'
import ResetPassword from "../views/ResetPassword.vue";
import NewPassword from "../views/NewPassword.vue";

// 👉 ajoute tes vues
import QuestionsList from '../views/QuestionsList.vue'
import EditQuestion from '../views/EditQuestion.vue'

const routes = [
  { path: '/', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/quiz/new', component: QuizCreation },
  { path: '/quiz/:id/questions', component: QuestionCreation, props: true },
  { path: '/quiz/:id/answers', component: AnswerManagement, props: true },
  { path: '/admin/users', component: UserManagement },
  { path: '/admin', component: Admin },
  {
    path: '/trainee/home',
    name: 'TraineeHome',
    component: () => import('../views/TraineeHome.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/trainee/quiz/:id',
    name: 'QuizStart',
    component: () => import('../views/QuizStart.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/trainee/parcours/:id/play',
    name: 'QuizPlay',
    component: () => import('../views/QuizPlay.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/trainee/parcours/:id/results',
    name: 'QuizResult',
    component: () => import('../views/QuizResult.vue'),
    meta: { requiresAuth: true }
  },
  // Gestion des questions
     { path: '/admin/quiz/:id/questions', name: 'QuestionsList', component: QuestionsList, props: true },

  { path: '/admin/questions/edit/:id', name: 'EditQuestion', component: EditQuestion, props: true },

  { path: '/play', component: QuizPlay },
  { path: '/reset-password', component: ResetPassword },
  { path: '/reset-password/:uidb64/:token', component: NewPassword }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router


