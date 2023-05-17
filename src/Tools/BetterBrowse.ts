import $ from 'jquery'
import Columns from '../Columns'
import Tool from '../Interfaces/Tool'
import Filters from 'Filters'
import { Api, ConfigColumnDefsSingle } from 'datatables.net'

class BetterBrowse implements Tool {
  private readonly Filters: Filters
  private readonly Columns: Columns
  private readonly mediaTypeSelect: HTMLSelectElement = document?.querySelector('.media-type')
  private table: Api<HTMLTableElement> | undefined

  constructor (filters: Filters, columns: Columns) {
    this.Filters = filters
    this.Columns = columns
  }

  colVisibilityHandler = (ev: Event): void => {
    if (this.table !== undefined) {
      const col = this.table.column(ev.target.dataset.column + ':name')
      col.visible(!col.visible())
    }
  }

  private readonly mediaTypeChangeHandler = (): void => {
    if (this.table !== undefined) {
      this.table.draw()
    }
  }

  // Function that adds the filter values to the data that will get sent to the API
  private readonly getParams = (params, settings): any => {
    for (let i = 0; i < params.columns.length; ++i) {
      // Get rid of unneeded default params
      delete params.columns[i].orderable
      delete params.columns[i].searchable
      delete params.columns[i].data
      delete params.columns[i].search
      // Set visibility for the backend
      params.columns[i].visible = settings.aoColumns.filter((c: ConfigColumnDefsSingle) => c.name === params.columns[i].name)[0].bVisible
    }

    // Translate column number into name so we don't have to do it in the backend
    if (Object.hasOwn(params, 'order')) {
      params.order.forEach((o, i) => {
        params.order[i].column = params.columns[o.column].name
      })
    }

    // Get the values of the filters
    params.filter = this.Filters.getFilterParams()

    // Add the search text when filled out
    if (params.search.value.length > 0) {
      params.filter.and.title_like = params.search.value
    }
    delete params.search

    return params
  }

  private readonly statsHandler = (_ev, _settings, json: MediaSearchResult): void => {
    let data: string
    if (this.mediaTypeSelect.value === 'ANIME') {
      data = json.total_runtime.toString() + ' minutes'
    } else if (this.mediaTypeSelect.value === 'MANGA') {
      data = json.total_episodes.toString() + ' chapters, ' + json.total_volumes.toString() + ' volumes'
    }

    document.querySelector('#stats').innerHTML = data + ' in total'
  }

  updateTable = (): void => {
    if (this.table !== undefined) {
      this.table.ajax.reload()

      return
    }
    this.table = $('#table').DataTable({
      serverSide: true,
      ajax: {
        url: import.meta.env.VITE_API_URL,
        data: this.getParams
      },
      paging: true,
      pageLength: 100,
      pagingType: 'halfmoon',
      fixedHeader: true,
      autoWidth: true,
      info: true,
      colReorder: true,
      search: {
        regex: true
      },
      dom: "<'row'il<'#stats.dataTables_info'>f>" +
              "<'row dt-table'<'col-sm-12'tr>>" +
              "<'row'p>",
      initComplete: function () {
        document.querySelector('.dataTables_length').classList.add('form-inline')
        document.querySelector('.dataTables_length select').classList.add('form-control')
        document.querySelector('#table_filter input').classList.add('form-control')
        const tableSearchInput: HTMLInputElement = document.querySelector('#table_filter input')
        tableSearchInput.classList.add('form-control')
        // Replace label with Placeholder
        document.querySelector('#table_filter label').childNodes[0].remove()
        tableSearchInput.placeholder = 'Search'
      },
      columns: this.Columns.getColumns([
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
        'format',
        'country',
        'genres',
        'tags',
        'episodes',
        'volumes',
        'duration',
        'totalDuration',
        'source',
        'avgScore',
        'meanScore',
        'popularity',
        'studios',
        'statusCurrent',
        'statusPlanning',
        'statusCompleted',
        'statusDropped',
        'statusPaused',
        'hasReview',
        'isAdult',
        'externalLinks'
      ])
    })
    this.table.on('xhr.dt', this.statsHandler)
  }

  private readonly filterChangeHandler = (): void => {
    this.table.draw()
  }

  public load = async (): Promise<void> => {
    // Create <table>
    const t: HTMLTableElement = document.createElement('table')
    t.id = 'table'
    t.classList.add('table-inner-bordered', 'table-striped')
    t.style.width = '100%'
    document.querySelector('#page-content').insertAdjacentElement('beforeend', t)

    // Toggle visibility of columns via click
    document.querySelectorAll('.toggle-column').forEach((b) => {
      b.addEventListener('click', this.colVisibilityHandler)
    })

    this.mediaTypeSelect.addEventListener('change', this.mediaTypeChangeHandler)

    if (Object.keys(this.Filters.getFilters()).length === 0) {
      this.Filters.insertFilters()
    }
    await this.Filters.updateFilters()

    // Column filters
    this.Filters.addEventListener('filter-changed', this.filterChangeHandler)

    this.updateTable()
    console.log('Module BetterBrowse loaded.')
  }

  public unload = (): void => {
    if (this.table !== undefined) {
      this.table.destroy()
      this.table = undefined
    }
    document.querySelector('#table').remove()

    // Toggle visibility of columns via click
    document.querySelectorAll('.toggle-column').forEach((b) => {
      b.removeEventListener('click', this.colVisibilityHandler)
    })

    // Column filters
    this.Filters.removeEventListener('filter-changed', this.filterChangeHandler)

    this.mediaTypeSelect.removeEventListener('change', this.mediaTypeChangeHandler)

    console.log('Module BetterBrowse unloaded.')
  }
}

export default BetterBrowse
