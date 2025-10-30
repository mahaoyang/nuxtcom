<template>
  <div class="min-h-screen bg-background text-foreground">
    <div class="container mx-auto p-8">
      <h1 class="text-4xl font-bold mb-4">Welcome to Nuxt with Tailwind CSS & shadcn-vue</h1>
      <p class="text-muted-foreground mb-8">
        Tailwind CSS and shadcn-vue have been successfully installed!
      </p>

      <div class="flex gap-4">
        <button class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          Primary Button
        </button>
        <button class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
          Secondary Button
        </button>
      </div>
    </div>
  </div>
</template>
