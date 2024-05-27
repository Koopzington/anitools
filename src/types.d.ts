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

interface ALUserInfo {
  id: number
  name: string
}

interface MangaUpdatesAuthor {
  name: string
  type: string
  author_id: number
}

interface MangaUpdatesPublisher {
  type: string
  notes: string
  publisher_id: number
  publisher_name: string
}

interface MangaUpdatesPublication {
  publisher_id: number
  publisher_name: string
  publication_name: string
}

interface MapperSuggestion {
  last_updated: string
  titles: string[]
  description: string
  type: string
  year: string
  cover: string
  genres: string[]
  categories: string[]
  latest_chapter: number
  original_status: string
  licensed: boolean
  scanlation_completed: boolean
  authors: MangaUpdatesAuthor[]
  publishers: MangaUpdatesPublisher[]
  publications: MangaUpdatesPublication[]
  id: number
  voted: boolean
  score: number
  voters: string[]
  stats: {
    total_unmapped: number
    total_mapped: number
    total_unvoted: number
    total_unvoted_filtered: number
  }
}
