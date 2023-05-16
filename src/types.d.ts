type Media = {
  title: string,
  titleEng: string,
  titleNat: string,
  seasonYear: string,
  season: string,
  year: number,
  airStart: string,
  airEnd: string,
  airStatus: string,
  score: string,
  format: string,
  country: string,
  status: string,
  progress: number,
  progressVolumes: number,
  repeat: number,
  started: string,
  completed: string,
  episodes: number,
  volumes: number,
  duration: number,
  totalDuration: number,
  source: string,
  avgScore: number,
  meanScore: number,
  popularity: number,
  statusCurrent: number,
  statusPlanning: number,
  statusCompleted: number,
  statusDropped: number,
  statusPaused: number,
  hasReview: boolean,
  notes: string,
  isAdult: number,
  id: number,
  genres: Array<string>,
  tags: Array<string>,
  studios: Array<string>,
  producers: Array<string>,
  references: Array<string>,
  externalLinks: Array<string>
}

type UserList = {
  id: string,
  amount_completed: number,
  amount_total: number,
  is_custom_list: boolean,
  name: string
}

type MediaSearchResult = {
  data: Array<Media>,
  draw: number, // variable from DataTables
  recordsFiltered: number, // variable from DataTables
  recordsTotal: number, // variable from DataTables
  total_completed: number,
  total_episodes: number,
  filtered_episodes: number,
  total_runtime: number,
  filtered_runtime: number,
  total_volumes: number,
  filtered_volumes: number
}

type ALActivity = {
  id: number,
  status: string,
  progress: string,
  createdAt: number,
  media: {
    title: {
      english: string,
      romaji: string,
      native: string
    }
  }
}