<template>
  <main class="login-shell">
    <VaCard class="content-panel">
      <VaCardContent class="content-panel__body">
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
      </VaCardContent>
    </VaCard>
  </main>
</template>
