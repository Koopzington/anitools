/* global localStorage */

class Columns {
  private readonly mediaTypeSelect: HTMLSelectElement = document?.querySelector('.media-type')
  private readonly anilistBaseLink: string = 'https://anilist.co/'
  warning: HTMLElement = document.createElement('i')

  // Reinitialize Button states on reload, enable default columns on first load
  private readonly defaultCols = [
    'title',
    'id',
    'seasonYear',
    'score',
    'format'
  ]

  constructor () {
    this.warning.classList.add('fa', 'fa-triangle-exclamation', 'text-danger')
    this.warning.title = 'Start date is after Completion date!'
  }

  public initToggles = (): void => {
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

  public getColumns = (cols): any[] => {
    const columnDefs = this.getColumnDefs()
    // Add 'visible' property to all column configs
    Object.keys(columnDefs).forEach((c) => {
      const btn = document.querySelector('.toggle-column[data-column="' + c + '"]')
      if (btn != null) {
        columnDefs[c].visible = btn.classList.contains('btn-primary')
      }
    })

    const columns = []
    cols.forEach((k) => {
      if (Object.hasOwn(columnDefs, k)) {
        columns.push(columnDefs[k])
      }
    })

    return columns
  }

  private readonly getColumnDefs = (): any => {
    return {
      title: {
        name: 'title',
        title: 'Title',
        data: 'title',
        render: (data: string, _type, row: Media) => {
          return '<a target="_blank" href="' + this.anilistBaseLink + this.mediaTypeSelect.value.toLowerCase() + '/' + row.id.toString() + '" >' + data + '</a>'
        }
      },
      titleEng: {
        name: 'titleEng',
        title: 'English Title',
        data: 'titleEng',
        render: (data: string, _type, row: Media) => {
          return '<a target="_blank" href="' + this.anilistBaseLink + this.mediaTypeSelect.value.toLowerCase() + '/' + row.id.toString() + '" >' + (data ?? row.title) + '</a>'
        }
      },
      titleNat: {
        name: 'titleNat',
        title: 'Native Title',
        data: 'titleNat',
        render: (data: string, _type, row: Media) => {
          return '<a target="_blank" href="' + this.anilistBaseLink + this.mediaTypeSelect.value.toLowerCase() + '/' + row.id.toString() + '" >' + data + '</a>'
        }
      },
      id: {
        name: 'id',
        title: 'ID',
        data: 'id',
        render: (data: number) => '<span title="Click to copy" class="copy-me">' + data.toString() + '</span>'
      },
      seasonYear: {
        name: 'seasonYear',
        title: 'Season',
        data: 'seasonYear'
      },
      season: {
        name: 'season',
        data: 'season',
        title: 'Season'
      },
      year: {
        name: 'year',
        data: 'year',
        title: 'Year'
      },
      airStart: {
        name: 'airStart',
        data: 'airStart',
        title: 'Started airing'
      },
      airEnd: {
        name: 'airEnd',
        data: 'airEnd',
        title: 'Ended airing'
      },
      airStatus: {
        name: 'airStatus',
        data: 'airStatus',
        title: 'Airing Status'
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
        render: data => data.join(', '),
        sortable: false
      },
      tags: {
        name: 'tags',
        title: 'Tags',
        data: 'tags',
        render: data => data.join(', '),
        sortable: false
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
      repeat: {
        name: 'repeat',
        title: 'Rewatched',
        data: 'repeat'
      },
      started: {
        name: 'started',
        title: 'Started',
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
        title: 'Completed',
        data: 'completed',
        render: (data: string | null) => data === null ? null : '<span title="Click to copy" class="copy-me">' + data + '</span>'
      },
      episodes: {
        name: 'episodes',
        title: this.mediaTypeSelect.value === 'ANIME' ? 'Episodes' : 'Chapters',
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
        render: data => data.join(', '),
        sortable: false
      },
      producers: {
        name: 'producers',
        title: 'Producers',
        data: 'producers',
        render: data => data.join(', '),
        sortable: false
      },
      statusCurrent: {
        name: 'statusCurrent',
        title: '# Current',
        data: 'statusCurrent',
        render: data => data ?? 0
      },
      statusPlanning: {
        name: 'statusPlanning',
        title: '# Planning',
        data: 'statusPlanning',
        render: data => data ?? 0
      },
      statusCompleted: {
        name: 'statusCompleted',
        title: '# Completed',
        data: 'statusCompleted',
        render: data => data ?? 0
      },
      statusDropped: {
        name: 'statusDropped',
        title: '# Dropped',
        data: 'statusDropped',
        render: data => data ?? 0
      },
      statusPaused: {
        name: 'statusPaused',
        title: '# Paused',
        data: 'statusPaused',
        render: data => data ?? 0
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
        data: 'notes'
      },
      isAdult: {
        name: 'isAdult',
        title: 'R18',
        data: 'isAdult',
        render: (data: number) => data === 1 ? '✓' : '✗'
      },
      references: {
        name: 'references',
        title: '# References',
        data: 'references',
        render: (data: string[]) => '<span class="custom-tooltip" data-title="' + data.join(', ') + '">' + data.length.toString() + '</span>'
      },
      activity: {
        name: 'activity',
        title: 'Activities',
        render: (_data, _type, row: Media) => '<a role="button" href="#activity-modal" data-id="' + row.id.toString() + '" class="btn btn-sm show-activity">Show Activity</button>'
      },
      code: {
        name: 'code',
        title: 'Challenge Code',
        render: (_data, _type, row: Media) => '<button data-id="' + row.id.toString() + '" class="btn btn-sm copy-code">Copy Code</button>'
      },
      externalLinks: {
        name: 'externalLinks',
        title: '',
        data: 'externalLinks',
        visible: false,
        render: data => data.join(', '),
        sortable: false
      }
    }
  }
}

export default Columns
