<template>
  <main class="login-shell">
    <section class="content-panel">
      <p class="page-eyebrow">
        Navegacao
      </p>
      <h1>Pagina nao encontrada</h1>
      <p class="muted">
        O endereco informado nao existe no TrackVision.
      </p>
      <RouterLink :to="{ name: 'dashboard' }">
        Voltar ao dashboard
      </RouterLink>
    </section>
  </main>
</template>
