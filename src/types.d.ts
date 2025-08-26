interface Media {
  title: string
  titleEng: string
  titleNat: string
  seasonYear: string
  season: string
  year: number
  airStart: string
  airEnd: string
  airStatus: string
  score: string
  format: string
  country: string
  status: string
  progress: number
  progressVolumes: number
  repeat: number
  started: string
  completed: string
  episodes: number
  volumes: number
  duration: number
  totalDuration: number
  source: string
  avgScore: number
  meanScore: number
  popularity: number
  statusCurrent: number
  statusPlanning: number
  statusCompleted: number
  statusDropped: number
  statusPaused: number
  hasReview: boolean
  notes: string
  isAdult: number
  id: number
  genres: string[]
  tags: MediaTag[]
  studios: string[]
  producers: string[]
  references: string[]
  externalLinks: string[]
  coverImage: string
}

interface MediaTag {
  tag: string
  rank: number
  is_spoiler: number
}

interface CharacterStaff {
  nameFirst: string
  nameMiddle: string
  nameLast: string
  nameFull: string
  nameNative: string
  id: number
  gender: string
  dateOfBirth: string
  bloodType: string
  coverImage: string
}

interface UserList {
  id: string
  amount_completed: number
  amount_total: number
  is_custom_list: boolean
  name: string
}

interface TagifyValue {
  label: string
  value: string
  customProperties: {
    completion: string
  }
}

interface MediaSearchResult {
  data: Media[]
  draw: number // variable from DataTables
  recordsFiltered: number // variable from DataTables
  recordsTotal: number // variable from DataTables
  total_completed: number
  total_episodes: number
  filtered_episodes: number
  total_runtime: number
  filtered_runtime: number
  total_volumes: number
  filtered_volumes: number
}

interface ALActivity {
  id: number
  status: string
  progress: string
  createdAt: number
  media: {
    title: {
      english: string
      romaji: string
      native: string
    }
  }
}

interface Staff {
  id: number
  name: string
  role: string
}

interface ALUserInfo {
  id: number
  name: string
}

interface FilterDefinition {
  type: string
  label: string
  logic: 'OR' | 'AND'
  regex: boolean
  urlOrData: string | TagifyValue[]
  mask: string
  experimental: boolean
  tooltip: string
}