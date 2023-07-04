/* global localStorage */

import $ from 'jquery'
import Tagify from '@yaireo/tagify'
import { on, handleResponse, handleError } from '../commonLib'
import Columns from '../Columns'
import Tool from '../Interfaces/Tool'
import Filters from '../Filters'
import { Api, ConfigColumnDefsSingle } from 'datatables.net'
import ActivityLister from '../ActivityLister'
import Settings from 'Settings'

class BetterList implements Tool {
  private readonly Settings: Settings
  private readonly Filters: Filters
  private readonly Columns: Columns
  private readonly ActivityLister: ActivityLister
  private readonly userNameField: HTMLInputElement = document?.querySelector('#al-user')
  private readonly mediaTypeSelect: HTMLSelectElement = document?.querySelector('.media-type')
  private readonly listInput: HTMLInputElement = document?.querySelector('#list')
  private listTagify: Tagify
  private lists = []
  private table: Api<HTMLTableElement> | undefined
  private currentPageData: Media[] = []
  private copyLinkHandler: EventListener
  private copyCodeHandler: EventListener
  private activityButtonHandler: EventListener

  constructor (settings: Settings, filters: Filters, columns: Columns) {
    this.Settings = settings
    this.Filters = filters
    this.Columns = columns
    this.ActivityLister = new ActivityLister()
  }

  private readonly updateSelect = async (): Promise<void> => {
    // Reindex array and filter out empty lists
    this.lists = [...this.lists].sort(undefined).filter(a => a)

    this.listTagify.whitelist = this.lists
    this.listTagify.addTags(this.lists[0].label)

    this.listTagify.DOM.scope.classList.remove('d-none')
  }

  private readonly colVisibilityHandler: EventListener = (ev): void => {
    if (this.table === undefined) {
      return
    }
    const col = this.table.column(ev.target.dataset.column.toString() + ':name')
    col.visible(!col.visible())
  }

  private readonly request = async (): void => {
    this.lists = []
    document.querySelector('#load').innerHTML = '<i class="fas fa-spinner fa-spin"></i>'

    localStorage.setItem('userName', this.userNameField.value)
    // Define the config we'll need for our Api request
    const url = import.meta.env.VITE_API_URL + '/userLists?user_name=' + this.userNameField.value + '&media_type=' + this.mediaTypeSelect.value

    // Make the HTTP Api request
    const response = await fetch(url);
    const data = await handleResponse(response);
    await this.handleData(data).catch(handleError)
    document.querySelector('#load').innerHTML = 'Reload'
  }

  public readonly load = async () => {
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

    this.listTagify = new Tagify(this.listInput, {
      enforceWhiteList: true,
      mode: 'select',
      tagTextProp: 'label',
      dropdown: {
        classname: 'list-select-dropdown',
        enabled: 0,
        searchKeys: ['label'],
        maxItems: Infinity
      },
      templates: {
        dropdownItem: function (item) {
          return `<div ${this.getAttributes(item)}
          class='${this.settings.classNames.dropdownItem} ${item.class ? item.class : ""}'
          tabindex="0"
          role="option">
            <div class="ch-label">${item.label}</div>
            <div class="ch-completion">${item.customProperties.completion}</div>
          </div>`
        },
      },
      transformTag: (tagData) => {
        tagData.exclude = false
      }
    })

    this.listTagify.on('change', this.updateTable)

    this.mediaTypeSelect.addEventListener('change', this.mediaTypeChangeHandler)

    // Setup Copy-Links
    this.copyLinkHandler = on('#table', 'click', '.copy-me', async (e) => {
      if (navigator.clipboard !== undefined) {
        await navigator.clipboard.writeText(e.target.innerText)
      }
    })

    this.copyCodeHandler = on('#table', 'click', '.copy-code', async (e) => {
      const media = this.currentPageData.filter((m) => m.id === parseInt(e.target.dataset.id))[0]
      if (navigator.clipboard !== undefined) {
        let firstLine = 'https://anilist.co/' + this.mediaTypeSelect.value.toLowerCase() + '/' + media.id.toString()
        if (!this.Settings.shouldUseEmbedsForCodeCopy()) {
          firstLine = '[' + media.title + '](' + firstLine + ')'
        }
        await navigator.clipboard.writeText(firstLine + '\r\nStart: ' + (media.started ?? 'YYYY-MM-DD') + ' Finish: ' + (media.completed ?? 'YYYY-MM-DD'))
      }
    })

    this.activityButtonHandler = on('#table', 'click', '.show-activity', this.activityButtonEventListener)

    // Column filters
    this.Filters.addEventListener('filter-changed', () => {
      if (this.table !== undefined) {
        this.table.draw()
      }
    })

    document.querySelector('#load').addEventListener('click', this.request)

    // Automatically load if the username is filled out
    if (this.userNameField.value.length > 0) {
      await this.request()
    }

    console.log('Module BetterList loaded.')
  }

  public readonly unload = (): void => {
    if (this.table !== undefined) {
      this.table.destroy()
      this.table = undefined
    }
    this.mediaTypeSelect.removeEventListener('change', this.mediaTypeChangeHandler)
    document.querySelector('#table').removeEventListener('click', this.copyLinkHandler)
    delete this.copyLinkHandler
    document.querySelector('#table').removeEventListener('click', this.copyCodeHandler)
    delete this.copyCodeHandler
    document.querySelector('#table').removeEventListener('click', this.activityButtonHandler)
    delete this.activityButtonHandler
    document.querySelector('#table').remove()

    this.currentPageData = []
    this.lists = []

    // Column filters
    this.Filters.removeEventListener('filter-changed', () => {
      this.table.draw()
    })

    this.listTagify.destroy()
    delete this.listTagify
    this.listInput.value = ''

    document.querySelector('#load').removeEventListener('click', this.request)

    // Toggle visibility of columns via click
    document.querySelectorAll('.toggle-column').forEach((b) => {
      b.removeEventListener('click', this.colVisibilityHandler)
    })

    console.log('Module BetterList unloaded.')
  }

  private readonly handleData = async (data: UserList[]): Promise<void> => {
    data.forEach(function (list) {
      this.lists.push({
        label: list.name,
        value: list.id,
        customProperties: {
          completion: Object.hasOwn(list, 'amount_completed')
            ? ' (' + list.amount_completed.toString() + '/' + list.amount_total.toString() + ') ' + Math.floor(list.amount_completed / list.amount_total * 100).toString() + '%'
            : ' (' + list.amount_total.toString() + ')'
        }
      })
    }, this)
    await this.Filters.updateFilters(this.listTagify)
    await this.updateSelect()
  }

  // Function responsible for showing the total amount of chapters/minutes of the current selection and the user's completion in %
  private readonly statsHandler = (_ev, _settings, json: MediaSearchResult): void => {
    let data: string
    if (this.mediaTypeSelect.value === 'ANIME') {
      data = json.filtered_runtime.toString() + ' minutes'
      if (json.total_runtime > json.filtered_runtime) {
        data += ' (filtered from ' + json.total_runtime.toString() + ' minutes)'
      }
    } else if (this.mediaTypeSelect.value === 'MANGA') {
      data = json.filtered_episodes.toString() + ' chapters, ' + json.filtered_volumes.toString() + ' volumes'
      if (json.total_episodes > json.filtered_episodes) {
        data += ' (filtered from ' + json.total_episodes.toString() + ' chapters, ' + json.total_volumes.toString() + ' volumes)'
      }
    }

    const completion = (Math.floor(json.total_completed) / json.recordsTotal * 100).toFixed(2)

    document.querySelector('#stats').innerHTML = completion + '% Completed, ' + data
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

    params.userName = this.userNameField.value

    // Get the values of the filters
    params.filter = this.Filters.getFilterParams()
    delete params.search

    return params
  }

  // Function that updates or creates the DataTables instance
  private readonly updateTable = async (): Promise<void> => {
    if (this.table !== undefined) {
      this.table.ajax.reload()

      return
    }
    this.table = $('#table').DataTable({
      serverSide: true,
      ajax: {
        url: import.meta.env.VITE_API_URL,
        data: this.getParams,
        // Keep a copy of the currently displayed page for the "Code copy" button
        dataSrc: (json) => {
          this.currentPageData = json.data
          return json.data
        }
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
      dom: "<'row'i<'#stats.dataTables_info'>>" +
           '<tr>' +
           "<'row'lp>",
      initComplete: function () {
        document.querySelector('.dataTables_length').classList.add('form-inline')
        document.querySelector('.dataTables_length select').classList.add('form-control')
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
        'score',
        'format',
        'country',
        'genres',
        'tags',
        'status',
        'progress',
        'progressVolumes',
        'repeat',
        'started',
        'completed',
        'episodes',
        'volumes',
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
        'code'
      ])
    })

    // Let DataTables update the completion and total count info on top of the table
    this.table.on('xhr.dt', this.statsHandler)
  }

  private readonly mediaTypeChangeHandler = async (): Promise<void> => {
    this.request()
  }

  private readonly activityButtonEventListener: EventListener = async (e): Promise<void> => {
    const userId = this.lists[0].value.split('-')[0]
    await this.ActivityLister.getActivities(userId, e.target.dataset.id)
  }
}

export default BetterList
