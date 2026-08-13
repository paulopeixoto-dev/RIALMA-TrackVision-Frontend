<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseAlert from '@/components/base/BaseAlert.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseTable from '@/components/base/BaseTable.vue'
import { mediaAssetsService } from '@/services/mediaAssetsService'
import { tripsService } from '@/services/tripsService'
import { useAuthStore } from '@/stores/authStore'
import type { LoadStatus, Trip, TripEvent, TripFilters } from '@/types/admin'

const authStore = useAuthStore()
const columns = [
  { key: 'plate', label: 'Placa' },
  { key: 'location', label: 'Local' },
  { key: 'status', label: 'Status' },
  { key: 'opened_at', label: 'Abertura' },
  { key: 'closed_at', label: 'Fechamento' },
  { key: 'load_status', label: 'Carga' },
  { key: 'actions', label: 'Acoes' },
]
const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'Aberta', value: 'open' },
  { label: 'Fechada', value: 'closed' },
  { label: 'Revisao', value: 'needs_review' },
]
const loadOptions = [
  { label: 'Todas', value: '' },
  { label: 'Nao revisada', value: 'unknown' },
  { label: 'Carregado', value: 'loaded' },
  { label: 'Vazio', value: 'empty' },
  { label: 'Precisa revisao', value: 'needs_review' },
]
const trips = ref<Trip[]>([])
const selectedTrip = ref<Trip | null>(null)
const loading = ref(true)
const detailLoading = ref(false)
const savingEventId = ref<number | null>(null)
const error = ref('')
const success = ref('')
const filters = ref<Required<TripFilters>>({
  status: '',
  plate: '',
  load_status: '',
  date_from: '',
  date_to: '',
  vehicle_id: '',
  location_id: '',
  direction: '',
})
const imageUrls = ref<Record<number, string>>({})
const currentPage = ref(1)
const lastPage = ref(1)
const canManageTrips = computed(() => authStore.can('trips.manage'))
let selectionRequestId = 0
let isPageActive = true

function tripFrom(row: unknown): Trip {
  return row as Trip
}

function statusLabel(status: string): string {
  return ({ open: 'Aberta', closed: 'Fechada', needs_review: 'Revisao' } as Record<string, string>)[status] ?? status
}

function loadLabel(loadStatus: string): string {
  return ({ unknown: 'Nao revisada', loaded: 'Carregado', empty: 'Vazio', needs_review: 'Precisa revisao' } as Record<string, string>)[loadStatus] ?? loadStatus
}

function directionLabel(direction: string): string {
  return ({ outbound: 'Ida', inbound: 'Volta', unknown: 'Indefinida' } as Record<string, string>)[direction] ?? direction
}

function formatDate(value: string | null | undefined): string {
  return value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '-'
}

function revokeImages(): void {
  Object.values(imageUrls.value).forEach((url) => mediaAssetsService.revokeObjectUrl(url))
  imageUrls.value = {}
}

function isCurrentSelection(requestId: number): boolean {
  return isPageActive && requestId === selectionRequestId
}

function paginationValue(meta: Record<string, unknown> | undefined, key: string, fallback: number): number {
  const value = meta?.[key]
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback
}

async function loadTrips(page = currentPage.value): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const response = await tripsService.list(filters.value, page)
    trips.value = response.data
    currentPage.value = paginationValue(response.meta, 'current_page', page)
    lastPage.value = paginationValue(response.meta, 'last_page', 1)
  } catch {
    error.value = 'Nao foi possivel carregar viagens.'
  } finally {
    loading.value = false
  }
}

function applyFilters(): void {
  void loadTrips(1)
}

function previousPage(): void {
  if (currentPage.value > 1) {
    void loadTrips(currentPage.value - 1)
  }
}

function nextPage(): void {
  if (currentPage.value < lastPage.value) {
    void loadTrips(currentPage.value + 1)
  }
}

async function selectTrip(trip: Trip): Promise<void> {
  const requestId = ++selectionRequestId
  detailLoading.value = true
  error.value = ''
  revokeImages()
  selectedTrip.value = null

  try {
    const loadedTrip = await tripsService.show(trip)

    if (!isCurrentSelection(requestId)) {
      return
    }

    selectedTrip.value = loadedTrip
    await loadImages(loadedTrip.events ?? [], requestId)
  } catch {
    if (isCurrentSelection(requestId)) {
      error.value = 'Nao foi possivel carregar detalhes da viagem.'
    }
  } finally {
    if (isCurrentSelection(requestId)) {
      detailLoading.value = false
    }
  }
}

async function loadImages(events: TripEvent[], requestId: number): Promise<void> {
  const pairs = events.flatMap((event) => [event.media.lpr_image, event.media.support_image].filter(Boolean))

  for (const media of pairs) {
    if (media) {
      let url: string

      try {
        url = await mediaAssetsService.fetchObjectUrl(media.content_endpoint)
      } catch {
        continue
      }

      if (!isCurrentSelection(requestId)) {
        mediaAssetsService.revokeObjectUrl(url)
        return
      }

      imageUrls.value[media.id] = url
    }
  }
}

function mediaUrl(event: TripEvent, kind: 'lpr_image' | 'support_image'): string | undefined {
  const media = event.media[kind]
  return media ? imageUrls.value[media.id] : undefined
}

async function updateLoadStatus(event: TripEvent, loadStatus: LoadStatus): Promise<void> {
  savingEventId.value = event.id
  success.value = ''
  error.value = ''

  try {
    const updated = await tripsService.updateLoadStatus(event, loadStatus)
    event.load_status = updated.load_status
    success.value = 'Carga atualizada.'
    await loadTrips()
  } catch {
    error.value = 'Nao foi possivel atualizar a carga.'
  } finally {
    savingEventId.value = null
  }
}

onMounted(loadTrips)
onBeforeUnmount(() => {
  isPageActive = false
  selectionRequestId += 1
  revokeImages()
})
</script>

<template>
  <section class="page-section">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">
          Operacao
        </p>
        <h1>Viagens</h1>
      </div>
      <BaseButton
        type="button"
        variant="secondary"
        @click="loadTrips"
      >
        Atualizar
      </BaseButton>
    </header>

    <div class="filters-row">
      <BaseSelect
        v-model="filters.status"
        label="Status"
        :options="statusOptions"
      />
      <BaseInput
        v-model="filters.plate"
        label="Placa"
        placeholder="ABC-1D23"
      />
      <BaseSelect
        v-model="filters.load_status"
        label="Carga"
        :options="loadOptions"
      />
      <BaseButton
        type="button"
        @click="applyFilters"
      >
        Filtrar
      </BaseButton>
    </div>

    <BaseAlert
      v-if="error"
      variant="error"
    >
      {{ error }}
    </BaseAlert>
    <BaseAlert
      v-if="success"
      variant="success"
    >
      {{ success }}
    </BaseAlert>

    <div class="trips-layout">
      <BaseTable
        :columns="columns"
        empty-text="Nenhuma viagem encontrada."
        :loading="loading"
        :rows="trips"
      >
        <template #row="{ row }">
          <td>{{ tripFrom(row).vehicle?.plate ?? '-' }}</td>
          <td>{{ tripFrom(row).location?.name ?? '-' }}</td>
          <td>{{ statusLabel(tripFrom(row).status) }}</td>
          <td>{{ formatDate(tripFrom(row).opened_at) }}</td>
          <td>{{ formatDate(tripFrom(row).closed_at) }}</td>
          <td>{{ loadLabel(tripFrom(row).current_load_status) }}</td>
          <td>
            <BaseButton
              data-test="select-trip"
              type="button"
              variant="secondary"
              @click="selectTrip(tripFrom(row))"
            >
              Revisar
            </BaseButton>
          </td>
        </template>
      </BaseTable>

      <div
        v-if="lastPage > 1"
        class="pagination-row"
      >
        <BaseButton
          data-test="previous-page"
          type="button"
          variant="secondary"
          :disabled="loading || currentPage === 1"
          @click="previousPage"
        >
          Anterior
        </BaseButton>
        <span class="muted">Pagina {{ currentPage }} de {{ lastPage }}</span>
        <BaseButton
          data-test="next-page"
          type="button"
          variant="secondary"
          :disabled="loading || currentPage === lastPage"
          @click="nextPage"
        >
          Proxima
        </BaseButton>
      </div>

      <aside class="trip-detail">
        <p
          v-if="detailLoading"
          class="muted"
        >
          Carregando detalhes...
        </p>
        <p
          v-else-if="!selectedTrip"
          class="muted"
        >
          Selecione uma viagem para revisar imagens e carga.
        </p>
        <template v-else>
          <h2>{{ selectedTrip.vehicle?.plate ?? 'Sem placa' }}</h2>
          <p class="muted">
            {{ selectedTrip.location?.name ?? '-' }} &middot; {{ statusLabel(selectedTrip.status) }}
          </p>
          <p
            v-if="selectedTrip.review_required_reason"
            class="review-reason"
          >
            {{ selectedTrip.review_required_reason }}
          </p>

          <article
            v-for="event in selectedTrip.events ?? []"
            :key="event.id"
            class="trip-event"
          >
            <header>
              <strong>{{ directionLabel(event.direction) }}</strong>
              <span>{{ formatDate(event.occurred_at) }}</span>
            </header>
            <p>{{ event.capture.camera_pair?.name ?? '-' }} &middot; {{ loadLabel(event.load_status) }}</p>

            <div class="media-grid">
              <figure>
                <figcaption>LPR</figcaption>
                <img
                  v-if="mediaUrl(event, 'lpr_image')"
                  alt="Imagem LPR da viagem"
                  :src="mediaUrl(event, 'lpr_image')"
                >
                <span v-else>Sem imagem LPR</span>
              </figure>
              <figure>
                <figcaption>Apoio</figcaption>
                <img
                  v-if="mediaUrl(event, 'support_image')"
                  alt="Imagem de apoio da viagem"
                  :src="mediaUrl(event, 'support_image')"
                >
                <span v-else>Sem imagem de apoio</span>
              </figure>
            </div>

            <div
              v-if="canManageTrips"
              class="row-actions"
            >
              <BaseButton
                type="button"
                :disabled="savingEventId === event.id"
                @click="updateLoadStatus(event, 'loaded')"
              >
                Carregado
              </BaseButton>
              <BaseButton
                type="button"
                variant="secondary"
                :disabled="savingEventId === event.id"
                @click="updateLoadStatus(event, 'empty')"
              >
                Vazio
              </BaseButton>
              <BaseButton
                type="button"
                variant="secondary"
                :disabled="savingEventId === event.id"
                @click="updateLoadStatus(event, 'needs_review')"
              >
                Precisa revisao
              </BaseButton>
            </div>
          </article>
        </template>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.filters-row {
  align-items: end;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  margin-bottom: 16px;
}

.trips-layout {
  align-items: start;
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.7fr);
}

.pagination-row {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: end;
  margin-top: 12px;
}

.trip-detail {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
}

.muted {
  color: var(--color-muted);
}

.review-reason {
  color: var(--color-danger);
  font-weight: 600;
}

.trip-event {
  border-top: 1px solid var(--color-border);
  padding: 16px 0;
}

.trip-event header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.media-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.media-grid figure {
  margin: 0;
}

.media-grid img {
  aspect-ratio: 4 / 3;
  border-radius: 6px;
  display: block;
  object-fit: cover;
  width: 100%;
}

@media (max-width: 980px) {
  .filters-row,
  .trips-layout {
    grid-template-columns: 1fr;
  }
}
</style>
