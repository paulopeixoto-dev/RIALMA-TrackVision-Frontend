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
