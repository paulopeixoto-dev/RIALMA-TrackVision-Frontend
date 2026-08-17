<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ApiError } from '@/services/apiClient'
import { mediaAssetsService } from '@/services/mediaAssetsService'
import { reportsService } from '@/services/reportsService'
import { tripsService } from '@/services/tripsService'
import { useAuthStore } from '@/stores/authStore'
import type { LoadStatus, MediaRecoveryStatus, Trip, TripEvent, TripEventLoadStatusAudit, TripFilters } from '@/types/admin'

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
const directionOptions = [
  { label: 'Todas', value: '' },
  { label: 'Ida', value: 'outbound' },
  { label: 'Volta', value: 'inbound' },
  { label: 'Indefinida', value: 'unknown' },
]
const trips = ref<Trip[]>([])
const selectedTrip = ref<Trip | null>(null)
const loading = ref(true)
const detailLoading = ref(false)
const savingEventId = ref<number | null>(null)
const recoveringEventId = ref<number | null>(null)
const error = ref('')
const success = ref('')
const filters = ref<Required<Pick<TripFilters, 'status' | 'plate' | 'load_status' | 'date_from' | 'date_to' | 'direction'>>>({
  status: '',
  plate: '',
  load_status: '',
  date_from: initialDateFrom(),
  date_to: dateInputValue(new Date()),
  direction: '',
})
const imageUrls = ref<Record<number, string>>({})
const currentPage = ref(1)
const lastPage = ref(1)
const canManageTrips = computed(() => authStore.can('trips.manage'))
const canViewReports = computed(() => authStore.can('reports.view'))
const exporting = ref<'csv' | 'pdf' | null>(null)
let selectionRequestId = 0
let isPageActive = true
const recoveryPollTimers = new Map<number, number>()
const recoveryPollIntervalMs = 2000
const recoveryPollAttempts = 4

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

function recoveryLabel(status: MediaRecoveryStatus): string {
  return ({
    pending_configuration: 'NVR nao configurado',
    pending: 'Recuperacao pendente',
    running: 'Recuperando imagem',
    recovered: 'Imagem recuperada',
    not_found: 'Imagem nao encontrada no NVR',
    failed: 'Falha na recuperacao',
  } as Record<MediaRecoveryStatus, string>)[status]
}

function recoveryColor(status: MediaRecoveryStatus): 'secondary' | 'info' | 'success' | 'warning' | 'danger' {
  return ({
    pending_configuration: 'warning',
    pending: 'secondary',
    running: 'info',
    recovered: 'success',
    not_found: 'warning',
    failed: 'danger',
  } as Record<MediaRecoveryStatus, 'secondary' | 'info' | 'success' | 'warning' | 'danger'>)[status]
}

function dateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function initialDateFrom(): string {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  return dateInputValue(date)
}

function formatDate(value: string | null | undefined): string {
  return value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '-'
}

function auditLabel(audit: TripEventLoadStatusAudit): string {
  const actor = audit.user.name ?? audit.user.email ?? 'Usuario'
  return `${actor}: ${loadLabel(audit.old_load_status)} para ${loadLabel(audit.new_load_status)}`
}

function revokeImages(): void {
  Object.values(imageUrls.value).forEach((url) => mediaAssetsService.revokeObjectUrl(url))
  imageUrls.value = {}
}

function clearRecoveryPolls(): void {
  recoveryPollTimers.forEach((timer) => window.clearTimeout(timer))
  recoveryPollTimers.clear()
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

async function exportReport(format: 'csv' | 'pdf'): Promise<void> {
  exporting.value = format
  error.value = ''
  success.value = ''

  try {
    if (format === 'csv') {
      await reportsService.downloadCsv(filters.value)
    } else {
      await reportsService.downloadPdf(filters.value)
    }

    success.value = 'Relatorio solicitado.'
  } catch {
    error.value = 'Nao foi possivel baixar o relatorio.'
  } finally {
    exporting.value = null
  }
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
  clearRecoveryPolls()
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
      if (imageUrls.value[media.id]) {
        continue
      }

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

function scheduleRecoveryRefresh(eventId: number, remainingAttempts: number): void {
  const currentTimer = recoveryPollTimers.get(eventId)
  if (currentTimer !== undefined) {
    window.clearTimeout(currentTimer)
  }

  const timer = window.setTimeout(() => {
    recoveryPollTimers.delete(eventId)
    void refreshRecoveryState(eventId, remainingAttempts)
  }, recoveryPollIntervalMs)
  recoveryPollTimers.set(eventId, timer)
}

async function refreshRecoveryState(eventId: number, remainingAttempts: number): Promise<void> {
  const trip = selectedTrip.value
  const requestId = selectionRequestId

  if (!trip || !isCurrentSelection(requestId)) {
    return
  }

  try {
    const loadedTrip = await tripsService.show(trip)

    if (!isCurrentSelection(requestId) || selectedTrip.value?.id !== trip.id) {
      return
    }

    selectedTrip.value = loadedTrip
    await loadImages(loadedTrip.events ?? [], requestId)

    const updatedEvent = loadedTrip.events?.find((item) => item.id === eventId)
    const status = updatedEvent?.support_image_recovery?.status
    const stillRecovering = updatedEvent !== undefined
      && !updatedEvent.media.support_image
      && (status === undefined || status === 'pending' || status === 'running')

    if (stillRecovering && remainingAttempts > 0) {
      scheduleRecoveryRefresh(eventId, remainingAttempts - 1)
    }
  } catch {
    if (isCurrentSelection(requestId) && remainingAttempts > 0) {
      scheduleRecoveryRefresh(eventId, remainingAttempts - 1)
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

async function requestSupportRecovery(event: TripEvent): Promise<void> {
  const requestId = selectionRequestId
  recoveringEventId.value = event.id
  success.value = ''
  error.value = ''

  try {
    event.support_image_recovery = await tripsService.requestSupportImageRecovery(event)

    if (!isCurrentSelection(requestId)) {
      return
    }

    success.value = 'Recuperacao solicitada.'
    await refreshRecoveryState(event.id, recoveryPollAttempts)
  } catch (apiError) {
    error.value = apiError instanceof ApiError
      ? apiError.message
      : 'Nao foi possivel solicitar recuperacao.'

    if (apiError instanceof ApiError && apiError.status === 409) {
      await refreshRecoveryState(event.id, 0)
    }
  } finally {
    recoveringEventId.value = null
  }
}

onMounted(loadTrips)
onBeforeUnmount(() => {
  isPageActive = false
  selectionRequestId += 1
  clearRecoveryPolls()
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
      <div class="header-actions">
        <VaButton
          class="base-button"
          color="secondary"
          type="button"
          @click="loadTrips"
        >
          Atualizar
        </VaButton>
        <VaButton
          v-if="canViewReports"
          class="base-button"
          color="secondary"
          data-test="export-csv"
          type="button"
          :loading="exporting === 'csv'"
          @click="exportReport('csv')"
        >
          CSV
        </VaButton>
        <VaButton
          v-if="canViewReports"
          class="base-button"
          data-test="export-pdf"
          type="button"
          :loading="exporting === 'pdf'"
          @click="exportReport('pdf')"
        >
          PDF
        </VaButton>
      </div>
    </header>

    <VaCard class="content-panel">
      <VaCardContent>
        <div
          class="filters-row"
          data-test="trip-filters"
        >
          <VaSelect
            v-model="filters.status"
            class="base-field"
            label="Status"
            :options="statusOptions"
            placeholder="Selecione"
            text-by="label"
            track-by="value"
            value-by="value"
          />
          <VaInput
            v-model="filters.plate"
            class="base-field"
            label="Placa"
            placeholder="ABC-1D23"
          />
          <VaSelect
            v-model="filters.load_status"
            class="base-field"
            label="Carga"
            :options="loadOptions"
            placeholder="Selecione"
            text-by="label"
            track-by="value"
            value-by="value"
          />
          <VaInput
            v-model="filters.date_from"
            class="base-field"
            label="De"
            type="date"
          />
          <VaInput
            v-model="filters.date_to"
            class="base-field"
            label="Ate"
            type="date"
          />
          <VaSelect
            v-model="filters.direction"
            class="base-field"
            label="Direcao"
            :options="directionOptions"
            placeholder="Selecione"
            text-by="label"
            track-by="value"
            value-by="value"
          />
          <VaButton
            class="base-button"
            type="button"
            @click="applyFilters"
          >
            Filtrar
          </VaButton>
        </div>
      </VaCardContent>
    </VaCard>

    <VaAlert
      v-if="error"
      color="danger"
      role="status"
    >
      {{ error }}
    </VaAlert>
    <VaAlert
      v-if="success"
      color="success"
      role="status"
    >
      {{ success }}
    </VaAlert>

    <div class="trips-layout">
      <VaCard class="content-panel">
        <VaCardContent class="content-panel__body">
          <VaDataTable
            class="base-table"
            :columns="columns"
            hoverable
            :items="trips"
            items-track-by="id"
            :loading="loading"
            no-data-html="Nenhuma viagem encontrada."
          >
            <template #cell(plate)="{ rowData }">
              {{ tripFrom(rowData).vehicle?.plate ?? '-' }}
            </template>
            <template #cell(location)="{ rowData }">
              {{ tripFrom(rowData).location?.name ?? '-' }}
            </template>
            <template #cell(status)="{ rowData }">
              {{ statusLabel(tripFrom(rowData).status) }}
            </template>
            <template #cell(opened_at)="{ rowData }">
              {{ formatDate(tripFrom(rowData).opened_at) }}
            </template>
            <template #cell(closed_at)="{ rowData }">
              {{ formatDate(tripFrom(rowData).closed_at) }}
            </template>
            <template #cell(load_status)="{ rowData }">
              {{ loadLabel(tripFrom(rowData).current_load_status) }}
            </template>
            <template #cell(actions)="{ rowData }">
              <VaButton
                class="base-button"
                color="secondary"
                data-test="select-trip"
                type="button"
                @click="selectTrip(tripFrom(rowData))"
              >
                Revisar
              </VaButton>
            </template>
          </VaDataTable>

          <div
            v-if="lastPage > 1"
            class="pagination-row"
          >
            <VaButton
              class="base-button"
              color="secondary"
              data-test="previous-page"
              type="button"
              :disabled="loading || currentPage === 1"
              @click="previousPage"
            >
              Anterior
            </VaButton>
            <span class="muted">Pagina {{ currentPage }} de {{ lastPage }}</span>
            <VaButton
              class="base-button"
              color="secondary"
              data-test="next-page"
              type="button"
              :disabled="loading || currentPage === lastPage"
              @click="nextPage"
            >
              Proxima
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="trip-detail">
        <VaCardContent class="trip-detail__body">
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

              <VaAlert
                v-if="!event.media.support_image && event.support_image_recovery"
                class="recovery-alert"
                :color="recoveryColor(event.support_image_recovery.status)"
              >
                {{ recoveryLabel(event.support_image_recovery.status) }}
                <span v-if="event.support_image_recovery.last_error">
                  {{ event.support_image_recovery.last_error }}
                </span>
              </VaAlert>

              <VaButton
                v-if="canManageTrips && event.capture.has_support_camera && !event.media.support_image"
                class="base-button"
                color="secondary"
                data-test="request-support-recovery"
                type="button"
                :loading="recoveringEventId === event.id"
                @click="requestSupportRecovery(event)"
              >
                Recuperar apoio
              </VaButton>

              <div
                v-if="canManageTrips"
                class="row-actions"
              >
                <VaButton
                  class="base-button"
                  type="button"
                  :disabled="savingEventId === event.id"
                  @click="updateLoadStatus(event, 'loaded')"
                >
                  Carregado
                </VaButton>
                <VaButton
                  class="base-button"
                  color="secondary"
                  type="button"
                  :disabled="savingEventId === event.id"
                  @click="updateLoadStatus(event, 'empty')"
                >
                  Vazio
                </VaButton>
                <VaButton
                  class="base-button"
                  color="secondary"
                  type="button"
                  :disabled="savingEventId === event.id"
                  @click="updateLoadStatus(event, 'needs_review')"
                >
                  Precisa revisao
                </VaButton>
              </div>

              <section
                v-if="event.load_status_audits?.length"
                class="audit-timeline"
              >
                <h3>Historico de carga</h3>
                <ol>
                  <li
                    v-for="audit in event.load_status_audits"
                    :key="audit.id"
                  >
                    <span>{{ auditLabel(audit) }}</span>
                    <small>{{ formatDate(audit.changed_at) }}</small>
                  </li>
                </ol>
              </section>
            </article>
          </template>
        </VaCardContent>
      </VaCard>
    </div>
  </section>
</template>

<style scoped>
.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.filters-row {
  align-items: end;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr));
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

.muted {
  color: var(--va-text-secondary);
}

.review-reason {
  color: var(--va-danger);
  font-weight: 600;
}

.trip-event {
  border-top: 1px solid var(--va-background-border);
  padding: 16px 0;
}

.trip-event header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.audit-timeline {
  margin-top: 14px;
}

.audit-timeline h3 {
  font-size: 0.95rem;
  margin: 0 0 8px;
}

.audit-timeline ol {
  display: grid;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.audit-timeline li {
  border-left: 3px solid var(--va-background-border);
  display: grid;
  gap: 2px;
  padding-left: 8px;
}

.audit-timeline small {
  color: var(--va-text-secondary);
}

.media-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.media-grid figure {
  margin: 0;
}

.recovery-alert {
  margin-top: 12px;
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
