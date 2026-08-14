<template>
  <section class="page-section utility-page">
    <VaCard class="utility-card">
      <VaCardContent class="utility-card__body">
        <p class="page-eyebrow">
          Seguranca
        </p>
        <h1>Acesso negado</h1>
        <p class="muted">
          Seu usuario nao possui permissao para acessar esta area.
        </p>
        <RouterLink
          class="utility-card__link"
          :to="{ name: 'dashboard' }"
        >
          Voltar ao dashboard
        </RouterLink>
      </VaCardContent>
    </VaCard>
  </section>
</template>
