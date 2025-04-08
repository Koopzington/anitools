/* global localStorage */

import { mediaTypeSelect } from "./GlobalElements"

class Columns {
  private readonly anilistBaseLink: string = 'https://anilist.co/'
  private readonly warning: HTMLElement = document.createElement('i')

  private readonly colMap = {
    anime: [
      'rowNum',
      'title',
      'titleEng',
      'titleNat',
      'id',
      'seasonYear',
      'season',
      'year',
      'airStart',
      'airEnd',
      'airStatus',
      'score',
      'format',
      'country',
      'genres',
      'genreCount',
      'tags',
      'tagCount',
      'status',
      'progress',
      'remaining',
      'repeat',
      'started',
      'completed',
      'daysSpent',
      'episodes',
      'duration',
      'totalDuration',
      'source',
      'avgScore',
      'meanScore',
      'popularity',
      'favourites',
      'studios',
      'producers',
      'statusCurrent',
      'statusPlanning',
      'statusCompleted',
      'statusDropped',
      'statusPaused',
      'hasReview',
      'notes',
      'isAdult',
      'references',
      'activity',
      'code',
    ],
    manga: [
      'rowNum',
      'title',
      'titleEng',
      'titleNat',
      'id',
      'seasonYear',
      'season',
      'year',
      'airStart',
      'airEnd',
      'airStatus',
      'score',
      'format',
      'country',
      'genres',
      'genreCount',
      'tags',
      'tagCount',
      'status',
      'progress',
      'remaining',
      'progressVolumes',
      'repeat',
      'started',
      'completed',
      'daysSpent',
      'episodes',
      'volumes',
      'source',
      'avgScore',
      'meanScore',
      'popularity',
      'favourites',
      'statusCurrent',
      'statusPlanning',
      'statusCompleted',
      'statusDropped',
      'statusPaused',
      'hasReview',
      'notes',
      'isAdult',
      'references',
      'activity',
      'code',
    ],
    character: [
      'rowNum',
      'nameFirst',
      'nameMiddle',
      'nameLast',
      'nameFull',
      'nameNative',
      'nameAlternatives',
      'nameAlternativesSpoiler',
      'id',
      //'description',
      'gender',
      'age',
      'dateOfBirth',
      'bloodType',
      'favourites',
      'appearances',
    ],
    staff: [
      'rowNum',
      'nameFirst',
      'nameMiddle',
      'nameLast',
      'nameFull',
      'nameNative',
      'nameAlternatives',
      'id',
      //'description',
      'homeTown',
      'yearsActiveFrom',
      'yearsActiveUntil',
      'gender',
      'dateOfBirth',
      'dateOfDeath',
      'bloodType',
      'primaryOccupations',
      'favourites',
      'appearances',
    ]
  }

  private readonly colGroups = {
    'General columns': {
      description: 'These columns are available for all data types',
      cols: [
        'rowNum',
        'id',
        'favourites'
      ]
    },
    'Media columns': {
      description: 'These columns are available for both anime/manga',
      cols: [
        'title',
        'titleEng',
        'titleNat',
        'year',
        'airStart',
        'airEnd',
        'airStatus',
        'format',
        'country',
        'genres',
        'genreCount',
        'tags',
        'tagCount',
        'episodes',
        'source',
        'avgScore',
        'meanScore',
        'popularity',
        'statusCurrent',
        'statusPlanning',
        'statusCompleted',
        'statusDropped',
        'statusPaused',
        'hasReview',
        'isAdult'
      ]
    },
    'Anime columns': {
      description: '',
      cols: [
        'seasonYear',
        'season',
        'duration',
        'totalDuration',
        'studios',
        'producers'
      ]
    },
    'Manga columns': {
      description: '',
      cols: [
        'volumes',
      ]
    },
    'Character/Staff columns': {
      description: '',
      cols: [
        'nameFirst',
        'nameMiddle',
        'nameLast',
        'nameFull',
        'nameNative',
        'nameAlternatives',
        'nameAlternativesSpoiler',
        'description',
        'gender',
        'dateOfBirth',
        'bloodType',
        'appearances'
      ]
    },
    'Character columns': {
      description: '',
      cols: [
        'age'
      ]
    },
    'Staff columns': {
      description: '',
      cols: [
        'dateOfDeath',
        'homeTown',
        'yearsActiveFrom',
        'yearsActiveUntil',
        'primaryOccupations',
      ]
    },
    'User related columns': {
      description: 'These columns do not work for BetterBrowse since they are based on a user\'s data',
      cols: [
        'status',
        'progress',
        'remaining',
        'progressVolumes',
        'repeat',
        'started',
        'completed',
        'daysSpent',
        'score',
        'notes',
        'references',
        'activity',
        'code',
      ]
    }
  }

  // Reinitialize Button states on reload, enable default columns on first load
  private readonly defaultCols = [
    'title',
    'id',
    'seasonYear',
    'score',
    'format'
  ]

  private readonly columnDefs = {
    title: {
      name: 'title',
      title: 'Romaji Title',
      data: 'title',
      render: (data: string, _type, row: Media) => {
        const coverData = row.coverImage ? 'style="--cover: url(\'' + row.coverImage + '\')"' : ''
        return '<a target="_blank" href="' + this.anilistBaseLink + mediaTypeSelect.value.toLowerCase() + '/' + row.id.toString() + '"' + coverData + ' >' + data + '</a>'
      }
    },
    titleEng: {
      name: 'titleEng',
      title: 'English Title',
      data: 'titleEng',
      render: (data: string, _type, row: Media) => {
        const coverData = row.coverImage ? 'style="--cover: url(\'' + row.coverImage + '\')"' : ''
        return '<a target="_blank" href="' + this.anilistBaseLink + mediaTypeSelect.value.toLowerCase() + '/' + row.id.toString() + '"' + coverData + ' >' + (data ?? row.title) + '</a>'
      }
    },
    titleNat: {
      name: 'titleNat',
      title: 'Native Title',
      data: 'titleNat',
      render: (data: string, _type, row: Media) => {
        const coverData = row.coverImage ? 'style="--cover: url(\'' + row.coverImage + '\')"' : ''
        return '<a target="_blank" href="' + this.anilistBaseLink + mediaTypeSelect.value.toLowerCase() + '/' + row.id.toString() + '"' + coverData + ' >' + data + '</a>'
      }
    },
    rowNum: {
      name: 'rowNum',
      title: '#',
      data: 'rowNum',
      description: 'Shows the row number',
      orderable: false
    },
    id: {
      name: 'id',
      title: 'ID',
      data: 'id',
      className: 'copy-me'
    },
    seasonYear: {
      name: 'seasonYear',
      title: 'Season/Year',
      data: 'seasonYear'
    },
    season: {
      name: 'season',
      title: 'Season',
      data: 'season'
    },
    year: {
      name: 'year',
      title: 'Year',
      data: 'year'
    },
    airStart: {
      name: 'airStart',
      title: 'Started Airing',
      data: 'airStart',
    },
    airEnd: {
      name: 'airEnd',
      title: 'Ended Airing',
      data: 'airEnd',
    },
    airStatus: {
      name: 'airStatus',
      title: 'Airing Status',
      data: 'airStatus',
    },
    score: {
      name: 'score',
      title: 'Score',
      data: 'score'
    },
    format: {
      name: 'format',
      title: 'Format',
      data: 'format',
      render: (data: string | null) => data !== null ? data.charAt(0).toUpperCase() + data.slice(1) : null
    },
    country: {
      name: 'country',
      title: 'Country',
      data: 'country'
    },
    genres: {
      name: 'genres',
      title: 'Genres',
      data: 'genres',
      render: (data: string[] | null) => data !== null ? data.join(', ') : null,
      sortable: false
    },
    genreCount: {
      name: 'genreCount',
      title: '# Genres',
      data: 'genreCount',
      render: data => data ?? 0,
    },
    tags: {
      name: 'tags',
      title: 'Tags',
      data: 'tags',
      render: (data: MediaTag[]) => {
        if (data === null) {
          return data
        }
        const tags: string[] = []
        data.forEach(t => tags.push(t.tag))
        return tags.join(', ')
      },
      sortable: false
    },
    tagCount: {
      name: 'tagCount',
      title: '# Tags',
      data: 'tagCount',
      render: data => data ?? 0,
    },
    status: {
      name: 'status',
      title: 'Status',
      data: 'status'
    },
    progress: {
      name: 'progress',
      title: 'Progress',
      data: 'progress'
    },
    progressVolumes: {
      name: 'progressVolumes',
      title: 'Progress (Volumes)',
      data: 'progressVolumes'
    },
    remaining: {
      name: 'remaining',
      title: 'Remaining',
      data: 'remaining',
      description: 'Remaining episodes/chapters'
    },
    repeat: {
      name: 'repeat',
      title: 'Rewatches',
      data: 'repeat'
    },
    started: {
      name: 'started',
      title: 'Started on',
      data: 'started',
      render: (data: string | null, _type, row: Media) => {
        if (data === null) {
          return null
        } else {
          let output = '<span title="Click to copy" class="copy-me">' + data + '</span>'
          if (data > row.completed) {
            output = this.warning.outerHTML + output
          }
          return output
        }
      }
    },
    completed: {
      name: 'completed',
      title: 'Completed on',
      data: 'completed',
      render: (data: string | null) => data === null ? null : '<span title="Click to copy" class="copy-me">' + data + '</span>'
    },
    daysSpent: {
      name: 'daysSpent',
      title: 'Days spent',
      data: 'daysSpent',
      description: 'Displays difference between start and completion date in days'
    },
    episodes: {
      name: 'episodes',
      title: 'Episodes',
      buttonLabel: 'Episodes/Chapters',
      data: 'episodes'
    },
    volumes: {
      name: 'volumes',
      title: 'Volumes',
      data: 'volumes'
    },
    duration: {
      name: 'duration',
      title: 'Episode Length',
      data: 'duration'
    },
    totalDuration: {
      name: 'totalDuration',
      title: 'Total Length',
      data: 'totalDuration'
    },
    source: {
      name: 'source',
      title: 'Source',
      data: 'source'
    },
    avgScore: {
      name: 'avgScore',
      title: 'Average Score',
      data: 'avgScore'
    },
    meanScore: {
      name: 'meanScore',
      title: 'Mean Score',
      data: 'meanScore'
    },
    popularity: {
      name: 'popularity',
      title: 'Popularity',
      data: 'popularity'
    },
    favourites: {
      name: 'favourites',
      title: 'Favourites',
      data: 'favourites'
    },
    studios: {
      name: 'studios',
      title: 'Studios',
      data: 'studios',
      render: (data: string[] | null) => data !== null ? data.join(', ') : null,
      sortable: false
    },
    producers: {
      name: 'producers',
      title: 'Producers',
      data: 'producers',
      render: (data: string[] | null) => data !== null ? data.join(', ') : null,
      sortable: false
    },
    statusCurrent: {
      name: 'statusCurrent',
      title: '# Current',
      data: 'statusCurrent',
      render: data => data ?? 0,
      description: 'Displays how many people currently watch/read the media'
    },
    statusPlanning: {
      name: 'statusPlanning',
      title: '# Planning',
      data: 'statusPlanning',
      render: data => data ?? 0,
      description: 'Displays how many people are planning to watch/read the media'
    },
    statusCompleted: {
      name: 'statusCompleted',
      title: '# Completed',
      data: 'statusCompleted',
      render: data => data ?? 0,
      description: 'Displays how many people completed watching/reading the media'
    },
    statusDropped: {
      name: 'statusDropped',
      title: '# Dropped',
      data: 'statusDropped',
      render: data => data ?? 0,
      description: 'Displays how many people dropped the media'
    },
    statusPaused: {
      name: 'statusPaused',
      title: '# Paused',
      data: 'statusPaused',
      render: data => data ?? 0,
      description: 'Displays how many people paused watching/reading the media'
    },
    hasReview: {
      name: 'hasReview',
      title: 'Has review',
      data: 'hasReview',
      render: (data: number) => data === 1 ? '✓' : '✗'
    },
    notes: {
      name: 'notes',
      title: 'Notes',
      data: 'notes',
      description: 'Displays the user\'s notes on the media'
    },
    isAdult: {
      name: 'isAdult',
      title: 'R18',
      description: 'Displays whether the media contains adult content or not',
      data: 'isAdult',
      render: (data: number) => data === 1 ? '✓' : '✗'
    },
    references: {
      name: 'references',
      title: '# References',
      description: 'Displays how many references to the media exist in other lists of the user',
      data: 'references',
      render: (data: string[] | null) => data === null ? null : '<span class="custom-tooltip" data-title="' + data.join(', ') + '">' + data.length.toString() + '</span>'
    },
    activity: {
      name: 'activity',
      title: 'Activities',
      description: 'Displays a button that shows a popup containing the user\'s activities for the media',
      render: (_data, _type, row: Media) => '<a role="button" href="#activity-modal" data-id="' + row.id.toString() + '" class="btn btn-sm show-activity">Show Activity</button>'
    },
    code: {
      name: 'code',
      title: 'Challenge Code',
      description: 'Displays a button that copies the link title, start and finish date for the media formatted for AWC challenges',
      render: (_data, _type, row: Media) => '<button data-id="' + row.id.toString() + '" class="btn btn-sm copy-code">Copy Code</button>'
    },
    nameFirst: {
      name: 'nameFirst',
      title: 'First Name',
      data: 'nameFirst',
      render: (data: string, _type, row: CharacterStaff) => {
        const coverData = row.coverImage ? 'style="--cover: url(\'' + row.coverImage + '\')"' : ''
        return '<a target="_blank" href="' + this.anilistBaseLink + mediaTypeSelect.value.toLowerCase() + '/' + row.id.toString() + '"' + coverData + ' >' + data + '</a>'
      }
    },
    nameMiddle: {
      name: 'nameMiddle',
      title: 'Middle Name',
      data: 'nameMiddle',
    },
    nameLast: {
      name: 'nameLast',
      title: 'Last Name',
      data: 'nameLast',
    },
    nameFull: {
      name: 'nameFull',
      title: 'Full Name',
      data: 'nameFull',
      render: (data: string, _type, row: CharacterStaff) => {
        const coverData = row.coverImage ? 'style="--cover: url(\'' + row.coverImage + '\')"' : ''
        return '<a target="_blank" href="' + this.anilistBaseLink + mediaTypeSelect.value.toLowerCase() + '/' + row.id.toString() + '"' + coverData + ' >' + data + '</a>'
      }
    },
    nameNative: {
      name: 'nameNative',
      title: 'Native Name',
      data: 'nameNative',
      render: (data: string, _type, row: CharacterStaff) => {
        const coverData = row.coverImage ? 'style="--cover: url(\'' + row.coverImage + '\')"' : ''
        return '<a target="_blank" href="' + this.anilistBaseLink + mediaTypeSelect.value.toLowerCase() + '/' + row.id.toString() + '"' + coverData + ' >' + data + '</a>'
      }
    },
    nameAlternatives: {
      name: 'nameAlternatives',
      title: 'Alternative Names',
      data: 'nameAlternatives',
      render: (data: string[] | null) => data !== null ? data.join(', ') : null,
      sortable: false
    },
    nameAlternativesSpoiler: {
      name: 'nameAlternativesSpoiler',
      title: 'Alternative Spoiler Names',
      data: 'nameAlternativesSpoiler',
      render: (data: string[] | null) => data !== null ? '<span class="spoiler">' + data.join('</span>, <span class="spoiler">') + '</span>' : null,
      sortable: false
    },
    description: {
      name: 'description',
      title: 'Description',
      data: 'description',
    },
    gender: {
      name: 'gender',
      title: 'Gender',
      data: 'gender',
    },
    dateOfBirth: {
      name: 'dateOfBirth',
      title: 'Birthday',
      data: 'dateOfBirth',
    },
    dateOfDeath: {
      name: 'dateOfDeath',
      title: 'Deathday',
      data: 'dateOfDeath',
    },
    bloodType: {
      name: 'bloodType',
      title: 'Blood Type',
      data: 'bloodType',
    },
    age: {
      name: 'age',
      title: 'Age',
      data: 'age',
    },
    primaryOccupations: {
      name: 'primaryOccupations',
      title: 'Primary Occupations',
      data: 'primaryOccupations',
      render: (data: string[] | null) => data !== null ? data.join(', ') : null,
    },
    homeTown: {
      name: 'homeTown',
      title: 'Home Town',
      data: 'homeTown',
    },
    yearsActiveFrom: {
      name: 'yearsActiveFrom',
      title: 'Active From',
      data: 'yearsActiveFrom'
    },
    yearsActiveUntil: {
      name: 'yearsActiveUntil',
      title: 'Active Until',
      data: 'yearsActiveUntil'
    },
    appearances: {
      name: 'appearances',
      title: 'Appearances',
      description: 'Displays the amount of appearances of this character in media',
      data: 'appearances',
    },
  }

  constructor () {
    this.warning.classList.add('fa', 'fa-triangle-exclamation', 'text-danger')
    this.warning.title = 'Start date is after Completion date!'
  }

  public initToggles = (): void => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.classList.add('btn', 'btn-sm', 'toggle-column')

    const container = document.querySelector('#column-toggles')

    Object.entries(this.colGroups).forEach((group) => {
      const groupContainer = document.createElement('div')
      groupContainer.classList.add('d-flex', 'flex-wrap')
      groupContainer.style.gap = '0.5rem'

      const colDefs = this.columnDefs

      group[1].cols.forEach((col) => {
        const b: HTMLButtonElement = btn.cloneNode(true)
        b.dataset.column = col
        b.innerText = Object.hasOwn(colDefs[col], 'buttonLabel') ? colDefs[col].buttonLabel : colDefs[col].title
        if (Object.hasOwn(colDefs[col], 'description')) {
          b.title = colDefs[col].description
        }
        groupContainer.insertAdjacentElement('beforeend', b)
      })

      let content = '<div><h5>' + group[0] +'</h5>'

      if (group[1].description !== '') {
        content += '<span>' + group[1].description +'</span>'
      }
      content += groupContainer.outerHTML
      container?.insertAdjacentHTML('beforeend', content + '</div>')
    });

    document.querySelectorAll('.toggle-column').forEach((b: HTMLButtonElement) => {
      const check = localStorage.getItem('col-' + b.dataset.column)
      if (check !== null) {
        b.classList.toggle('btn-primary', check === 'true')
      } else {
        if (this.defaultCols.includes(b.dataset.column)) {
          b.classList.add('btn-primary')
        }
      }

      // Toggle visuals and store state in localStorage
      b.addEventListener('click', () => {
        b.classList.toggle('btn-primary')
        localStorage.setItem('col-' + b.dataset.column, b.classList.contains('btn-primary').toString())
      })
    })
  }

  public readonly getColumns = (mediaType): any[] => {
    const cols = this.colMap[mediaType]
    const columnDefs = this.columnDefs
    // Add 'visible' property to all column configs
    Object.keys(columnDefs).forEach((c) => {
      const btn = document.querySelector('.toggle-column[data-column="' + c + '"]')
      if (btn != null) {
        columnDefs[c].visible = btn.classList.contains('btn-primary')
      }
    })

    if (cols.indexOf('episodes') > -1 && mediaTypeSelect.value === 'MANGA') {
      columnDefs['episodes'].title = 'Chapters'
    }

    const columns = []
    cols.forEach((k) => {
      if (Object.hasOwn(columnDefs, k)) {
        columns.push(columnDefs[k])
      }
    })

    return columns
  }
}

export default Columns
