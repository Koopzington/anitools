/* global localStorage */

import { on } from '../commonLib'
import Columns from '../Columns'
import Tool from '../Interfaces/Tool'
import Filters from '../Filters'
import { Api, ConfigColumnDefsSingle } from 'datatables.net'
import ActivityLister from '../ActivityLister'
import Settings from 'Settings'
import AniList from 'AniList'
import DataTable from 'datatables.net-dt'
import AniTools from 'AniTools'
import { mediaTypeSelect, userNameField, loadButton } from '../GlobalElements'

class BetterList implements Tool {
  private readonly Settings: Settings
  private readonly Filters: Filters
  private readonly Columns: Columns
  private readonly ActivityLister: ActivityLister
  private readonly AniList: AniList
  private readonly AniTools: AniTools
  private table: Api<HTMLTableElement> | undefined
  private currentPageData: Media[] = []
  private copyLinkHandler: EventListener | undefined
  private copyCodeHandler: EventListener | undefined
  private activityButtonHandler: EventListener | undefined
  private spoilerHandler: EventListener | undefined
  private debouncer: number
  private curUserInfo: ALUserInfo | undefined
  private abortController: AbortController

  constructor (aniTools: AniTools, settings: Settings, filters: Filters, columns: Columns, aniList: AniList) {
    this.AniTools = aniTools
    this.Settings = settings
    this.Filters = filters
    this.Columns = columns
    this.AniList = aniList
    this.ActivityLister = new ActivityLister()
  }

  private readonly colVisibilityHandler: EventListener = (ev): void => {
    if (this.table === undefined) {
      return
    }
    const col = this.table.column(ev.target!.dataset.column.toString() + ':name')
    col.visible(!col.visible())
    // We need to reload the page because previously invisible data might not be present now
    this.updateTable()
  }

  private readonly spoilerEventListener: EventListener = (ev): void => {
    ev.target!.classList.remove('spoiler')
  }

  private readonly request = async (): Promise<void> => {
    loadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'

    localStorage.setItem('userName', userNameField.value)
    if (userNameField.value.length > 0) {
      this.curUserInfo = await this.AniList.getUserInfo(userNameField.value)
    } else {
      this.curUserInfo = undefined
    }
    await this.Filters.updateFilters(mediaTypeSelect.value)
    loadButton.innerHTML = 'Reload'
    this.updateTable()
  }

  public readonly load = async () => {
    // Create <table>
    const t: HTMLTableElement = document.createElement('table')
    t.id = 'table'
    t.classList.add('table-inner-bordered', 'table-striped')
    t.style.width = '100%'
    document.querySelector('#page-content')!.insertAdjacentElement('beforeend', t)

    // Toggle visibility of columns via click
    document.querySelectorAll('.toggle-column').forEach((b) => {
      b.addEventListener('click', this.colVisibilityHandler)
    })

    mediaTypeSelect.value = localStorage.getItem('mediaType') ?? 'ANIME'
    mediaTypeSelect.addEventListener('change', this.mediaTypeChangeHandler)

    // Setup Copy-Links
    this.copyLinkHandler = on('#table', 'click', '.copy-me', this.copyLinkEventListener)

    this.copyCodeHandler = on('#table', 'click', '.copy-code', this.copyCodeEventListener)

    this.activityButtonHandler = on('#table', 'click', '.show-activity', this.activityButtonEventListener)

    this.spoilerHandler = on('#table', 'click', '.spoiler', this.spoilerEventListener)

    // Column filters
    this.Filters.addEventListener('filter-changed', this.filterChangeHandler)

    loadButton.addEventListener('click', this.request)

    await this.request()

    console.log('Module BetterList loaded.')
  }

  public readonly unload = (): void => {
    mediaTypeSelect.removeEventListener('change', this.mediaTypeChangeHandler)
    document.querySelector('#table')!.removeEventListener('click', this.copyLinkHandler!)
    delete this.copyLinkHandler
    document.querySelector('#table')!.removeEventListener('click', this.copyCodeHandler!)
    delete this.copyCodeHandler
    document.querySelector('#table')!.removeEventListener('click', this.activityButtonHandler!)
    delete this.activityButtonHandler
    document.querySelector('#table')!.removeEventListener('click', this.spoilerEventListener!)
    delete this.spoilerHandler
    if (this.table !== undefined) {
      this.table.destroy()
      this.table = undefined
    }
    document.querySelector('#table')!.remove()

    this.currentPageData = []

    // Column filters
    this.Filters.removeEventListener('filter-changed', this.filterChangeHandler)
    this.Filters.abort()
    this.Filters.removeFilters()
    
    loadButton.removeEventListener('click', this.request)

    // Toggle visibility of columns via click
    document.querySelectorAll('.toggle-column').forEach((b) => {
      b.removeEventListener('click', this.colVisibilityHandler)
    })

    console.log('Module BetterList unloaded.')
  }

  private readonly filterChangeHandler = (): void => {
    clearTimeout(this.debouncer)
    this.debouncer = setTimeout(() => {
      this.table!.draw()
    }, 500);
  }

  // Function responsible for showing the total amount of chapters/minutes of the current selection and the user's completion in %
  private readonly statsHandler = (_ev, _settings, json: MediaSearchResult): void => {
    let data: string = ''
    if (mediaTypeSelect.value === 'ANIME' && Object.hasOwn(json, 'total_runtime')) {
      data = json.filtered_runtime.toString() + ' minutes'
      if (json.total_runtime > json.filtered_runtime) {
        data += ' (filtered from ' + json.total_runtime.toString() + ' minutes)'
      }
    } else if (mediaTypeSelect.value === 'MANGA' && Object.hasOwn(json, 'total_episodes')) {
      data = json.filtered_episodes.toString() + ' chapters, ' + json.filtered_volumes.toString() + ' volumes'
      if (json.total_episodes > json.filtered_episodes) {
        data += ' (filtered from ' + json.total_episodes.toString() + ' chapters, ' + json.total_volumes.toString() + ' volumes)'
      }
    }

    let completion = ''
    if (userNameField.value.length > 0 && Object.hasOwn(json, 'total_completed')) {
      completion = (Math.floor(json.total_completed) / json.recordsTotal * 100).toFixed(2) + '% Completed, '
    }

    document.querySelector('#stats')!.innerHTML = completion  + data
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

    params.userName = userNameField.value
    params.mediaType = mediaTypeSelect.value

    // Get the values of the filters
    const filterValues = this.Filters.getFilterParams()
    if (JSON.stringify(filterValues) !== '{"and":{}}') {
      params.filter = filterValues
    }

    delete params.search

    return params
  }

  // Function that updates or creates the DataTables instance
  private readonly updateTable = async (): Promise<void> => {
    if (this.table !== undefined) {
      this.table.ajax.reload()

      return
    }

    const colDefs = this.Columns.getColumns(mediaTypeSelect.value.toLowerCase())
    const options = {
      serverSide: true,
      ajax: async (data, callback, settings) => {
        this.abortController && this.abortController.abort()
        this.abortController = new AbortController()

        const params = this.getParams(data, settings)
        let response: Response
        try {
          response = await this.AniTools.fetch('/', {
            method: 'POST',
            body: JSON.stringify(params),
            signal: this.abortController.signal
          })
        } catch (error) {
          callback({
            data: [],
            recordsTotal: 0,
            recordsFiltered: 0
          })
          return
        }

        const json = await response?.json()
        this.currentPageData = json.data
        callback(json)
      },
      processing: true,
      paging: true,
      pageLength: 100,
      pagingType: 'simple_numbers',
      fixedHeader: true,
      autoWidth: true,
      info: true,
      colReorder: true,
      search: {
        regex: true
      },
      dom: "<'row'i<'#stats'>>" +
           '<tr>' +
           "<'row'lp>",
      initComplete: function () {
        document.querySelector('.dt-length')!.classList.add('form-inline')
        document.querySelector('.dt-length .dt-input')!.classList.add('form-control')
      },
      columns: colDefs,
    }

    /* The column rowNum can't be sorted by, manually tell DataTables to sort by the column after that */
    if (colDefs[0].name === 'rowNum') {
      options.order = [1, 'asc']
    }

    this.table = new DataTable('#table', options)

    // Let DataTables update the completion and total count info on top of the table
    this.table.on('xhr.dt', this.statsHandler)
  }

  private readonly mediaTypeChangeHandler = async (): Promise<void> => {
    if (this.table !== undefined) {
      this.table.destroy()
      this.table = undefined
    }
    localStorage.setItem('mediaType', mediaTypeSelect.value)
    document.querySelector('#table')!.innerHTML = ''
    await this.request()
  }

  private readonly activityButtonEventListener: EventListener = async (e): Promise<void> => {
    if (this.curUserInfo !== undefined) {
      await this.ActivityLister.getActivities(this.curUserInfo.id, e.target.dataset.id)
    }
  }

  private readonly copyLinkEventListener: EventListener = async (e) => {
    if (navigator.clipboard !== undefined) {
      await navigator.clipboard.writeText(e.target.innerText)
    }
  }

  private readonly copyCodeEventListener: EventListener = async (e) => {
    const media = this.currentPageData.filter((m) => m.id === parseInt(e.target.dataset.id))[0]
    if (navigator.clipboard !== undefined) {
      let firstLine = 'https://anilist.co/' + mediaTypeSelect.value.toLowerCase() + '/' + media.id.toString()
      if (!this.Settings.shouldUseEmbedsForCodeCopy()) {
        firstLine = '[' + media.title + '](' + firstLine + ')'
      }
      await navigator.clipboard.writeText(firstLine + '\r\nStart: ' + (media.started ?? 'YYYY-MM-DD') + ' Finish: ' + (media.completed ?? 'YYYY-MM-DD'))
    }
  }
}

export default BetterList
