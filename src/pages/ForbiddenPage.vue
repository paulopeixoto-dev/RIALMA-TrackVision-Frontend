<template>
  <main class="login-shell">
    <section class="content-panel">
      <p class="page-eyebrow">
        Seguranca
      </p>
      <h1>Acesso negado</h1>
      <p class="muted">
        Seu usuario nao possui permissao para acessar esta area.
      </p>
      <RouterLink :to="{ name: 'dashboard' }">
        Voltar ao dashboard
      </RouterLink>
    </section>
  </main>
</template>
