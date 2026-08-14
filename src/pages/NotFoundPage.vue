<template>
  <main class="login-shell">
    <VaCard class="content-panel">
      <VaCardContent class="content-panel__body">
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
      </VaCardContent>
    </VaCard>
  </main>
</template>
