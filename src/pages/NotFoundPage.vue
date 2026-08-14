<template>
  <section class="page-section utility-page">
    <VaCard class="utility-card">
      <VaCardContent class="utility-card__body">
        <p class="page-eyebrow">
          Navegacao
        </p>
        <h1>Pagina nao encontrada</h1>
        <p class="muted">
          O endereco informado nao existe no TrackVision.
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
