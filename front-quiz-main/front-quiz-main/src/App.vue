<template>
  <div class="min-h-screen bg-panel">
    <header class="bg-white/80 backdrop-blur border-b border-gray-100">
      <div class="mx-auto max-w-6xl px-6 py-3 flex items-center gap-4">
        <img src="/src/assets/image.png" alt="Q+" class="h-9 w-9" />
        
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-6 py-10">
      <RouterView />
    </main>
  </div>
</template>

<script setup></script>
