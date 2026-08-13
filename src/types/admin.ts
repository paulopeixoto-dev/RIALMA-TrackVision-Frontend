export interface Permission {
  id: number
  name: string
}

export interface Role {
  id: number
  name: string
  permissions?: string[]
}

export interface Vehicle {
  id: number
  uuid: string
  plate: string
  plate_normalized: string
  fleet_code: string | null
  description: string | null
  is_active: boolean
}

export type VehicleInput = Pick<Vehicle, 'plate' | 'fleet_code' | 'description' | 'is_active'>

export interface Location {
  id: number
  uuid: string
  name: string
  description: string | null
  is_active: boolean
}

export type LocationInput = Omit<Location, 'id' | 'uuid'>

export interface EdgeNode {
  id: number
  uuid: string
  name: string
  description: string | null
  status: 'online' | 'offline' | 'degraded'
  last_seen_at: string | null
  is_active: boolean
  location?: Location
}

export interface EdgeNodeInput {
  location_id: number
  name: string
  description: string | null
  is_active: boolean
}

export interface Camera {
  id: number
  uuid: string
  name: string
  type: 'lpr' | 'support'
  vendor: 'intelbras'
  host: string
  port: number
  channel: number | null
  username: string | null
  is_active: boolean
  location?: Location
  edge_node?: EdgeNode
}

export interface CameraInput {
  location_id: number
  edge_node_id: number
  name: string
  type: 'lpr' | 'support'
  vendor: 'intelbras'
  host: string
  port: number
  channel: number | null
  username: string | null
  password?: string
  is_active: boolean
}

export interface CameraPair {
  id: number
  uuid: string
  name: string
  direction: 'outbound' | 'inbound' | 'unknown'
  is_active: boolean
  location?: Location
  edge_node?: EdgeNode
  lpr_camera?: Camera
  support_camera?: Camera
}

export interface CameraPairInput {
  location_id: number
  edge_node_id: number
  name: string
  lpr_camera_id: number
  support_camera_id: number
  direction: 'outbound' | 'inbound' | 'unknown'
  is_active: boolean
}

export type TripStatus = 'open' | 'closed' | 'needs_review'
export type TripEventDirection = 'outbound' | 'inbound' | 'unknown'
export type LoadStatus = 'unknown' | 'loaded' | 'empty' | 'needs_review'

export interface TripMediaAsset {
  id: number
  uuid: string
  kind: 'lpr_image' | 'support_image'
  content_type: string
  byte_size: number
  content_endpoint: string
}

export interface TripEventLoadStatusAudit {
  id: number
  uuid: string
  old_load_status: LoadStatus
  new_load_status: LoadStatus
  changed_at: string | null
  user: {
    id: number | null
    uuid: string | null
    name: string | null
    email: string | null
  }
}

export interface TripEvent {
  id: number
  uuid: string
  direction: TripEventDirection
  load_status: LoadStatus
  occurred_at: string | null
  capture: {
    id: number
    uuid: string
    plate: string | null
    plate_normalized: string | null
    event_time: string | null
    camera_pair?: {
      id: number | null
      uuid: string | null
      name: string | null
    }
  }
  media: {
    lpr_image?: TripMediaAsset | null
    support_image?: TripMediaAsset | null
  }
  load_status_audits?: TripEventLoadStatusAudit[]
}

export interface Trip {
  id: number
  uuid: string
  status: TripStatus
  opened_at: string | null
  closed_at: string | null
  review_required_reason: string | null
  current_load_status: LoadStatus
  events_count?: number
  vehicle?: Pick<Vehicle, 'id' | 'uuid' | 'plate' | 'plate_normalized' | 'fleet_code'>
  location?: Pick<Location, 'id' | 'uuid' | 'name'>
  events?: TripEvent[]
}

export interface TripFilters {
  status?: TripStatus | ''
  plate?: string
  load_status?: LoadStatus | ''
  date_from?: string
  date_to?: string
  vehicle_id?: number | ''
  location_id?: number | ''
  direction?: TripEventDirection | ''
}
