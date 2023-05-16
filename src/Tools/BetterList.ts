/* global localStorage */

import $ from 'jquery'
import { on, handleResponse, handleError } from '../commonLib'
import Choices, { Choice } from 'choices.js'
import Columns from '../Columns'
import Tool from '../Interfaces/Tool'
import Filters from '../Filters'
import { Api } from 'datatables.net'
import { ConfigColumnDefsSingle } from 'datatables.net'
import ActivityLister from '../ActivityLister'
import Settings from 'Settings'

class BetterList implements Tool {
  private Settings: Settings
  private Filters: Filters
  private Columns: Columns
  private ActivityLister: ActivityLister
  private userNameField: HTMLInputElement = document?.querySelector('#al-user')
  private mediaTypeSelect: HTMLSelectElement = document?.querySelector('.media-type')
  private listSelect: HTMLSelectElement = document?.querySelector('#list')
  private listChoice: Choices
  private lists: Array<Choice> = []
  private table: Api<HTMLTableElement>
  private currentPageData: Array<Media> = []
  private copyLinkHandler: EventListener
  private copyCodeHandler: EventListener
  private activityButtonHandler: EventListener

  constructor (settings: Settings, filters: Filters, columns: Columns) {
    this.Settings = settings
    this.Filters = filters
    this.Columns = columns
    this.ActivityLister = new ActivityLister()
  }

  updateSelect = () => {
    // Reindex array and filter out empty lists
    this.lists = [...this.lists].sort().filter(a => a)

    this.listChoice.setChoices(this.lists)
    this.listChoice.setValue([this.lists[0]])

    this.listChoice.containerOuter.element.classList.remove('d-none')
  }

  colVisibilityHandler: EventListener = (ev) => {
    if (! this.table) {
      return
    }
    const col = this.table.column(ev.target.dataset.column + ':name')
    col.visible(!col.visible())
  }

  request = () => {
    this.lists = []
    document.querySelector('#load').innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
  
    localStorage.setItem('userName', this.userNameField.value)
    // Define the config we'll need for our Api request
    const url = import.meta.env.VITE_API_URL + '/userLists?user_name=' + this.userNameField.value + '&media_type=' + this.mediaTypeSelect.value
  
    // Make the HTTP Api request
    fetch(url).then(handleResponse).then(this.handleData).catch(handleError).finally(() => {
      document.querySelector('#load').innerHTML = 'Reload'
    })
  }

  load = () => {
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
  
    this.listSelect.addEventListener('change', this.updateTable)

    this.listChoice = new Choices(this.listSelect, {
      shouldSort: false,
      allowHTML: true,
      classNames: {
        containerOuter: 'choices list-select d-none'
      },
      callbackOnCreateTemplates: function (template) {
        return {
          choice: ({ classNames }, data) => {
            return template(`<div class="${classNames.item} ${classNames.itemChoice}
              ${data.disabled ? classNames.itemDisabled : classNames.itemSelectable}" 
              data-select-text="${this.config.itemSelectText}" 
              data-choice ${data.disabled ? 'data-choice-disabled aria-disabled="true"' : 'data-choice-selectable'}
              data-id="${data.id}" 
              data-value="${data.value}" 
              ${data.groupId > 0 ? 'role="treeitem"' : 'role="option"'}>
                  <div class="ch-label">${data.label}</div>
                  <div class="ch-completion">${data.customProperties.completion}</div>
              </div>`)
          }
        }
      }
    })

    if (Object.keys(this.Filters.getFilters()).length === 0) {
      this.Filters.insertFilters(this.listChoice)
    }
    this.Filters.updateFilters()
  
    // Setup Copy-Links
    this.copyLinkHandler = on('#table', 'click', '.copy-me', (e) => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(e.target.innerText)
      }
    })
  
    this.copyCodeHandler = on('#table', 'click', '.copy-code', (e) => {
      const media = this.currentPageData.filter((m) => m.id === parseInt(e.target.dataset.id))[0]
      if (navigator.clipboard) {
        let firstLine = 'https://anilist.co/' + this.mediaTypeSelect.value.toLowerCase() + '/' + media.id
        if (!this.Settings.shouldUseEmbedsForCodeCopy) {
          firstLine = '[' + media.title + '](' + firstLine + ')'
        }
        navigator.clipboard.writeText(firstLine + '\r\nStart: ' + (media.started ?? 'YYYY-MM-DD') + ' Finish: ' + (media.completed ?? 'YYYY-MM-DD'))
      }
    })

    this.activityButtonHandler = on('#table', 'click', '.show-activity', (e) => {
      const userId = this.lists[0].value.split('-')[0]
      this.ActivityLister.getActivities(userId, e.target.dataset.id)
    })
  
    // Column filters
    this.Filters.addEventListener('filter-changed', () => {
      if (this.table) {
        this.table.draw()
      }
    })
  
    document.querySelector('#load').addEventListener('click', this.request)
    console.log('Module BetterList loaded.')
  }
  
  unload = () => {
    if (this.table) {
      this.table.destroy()
      this.table = null
    }
    document.querySelector('#table').removeEventListener('click', this.copyLinkHandler)
    document.querySelector('#table').removeEventListener('click', this.copyCodeHandler)
    document.querySelector('#table').removeEventListener('click', this.activityButtonHandler)
    document.querySelector('#table').remove()
  
    // Column filters
    this.Filters.removeEventListener('filter-changed', () => {
      this.table.draw()
    })
    document.querySelector('#filters').innerHTML = ''
  
    this.listSelect.removeEventListener('change', this.updateTable)
    this.listSelect.classList.add('d-none')
  
    document.querySelector('#load').removeEventListener('click', this.request)
  
    // Toggle visibility of columns via click
    document.querySelectorAll('.toggle-column').forEach((b) => {
      b.removeEventListener('click', this.colVisibilityHandler)
    })

    console.log('Module BetterList unloaded.')
  }
  
  handleData = (data: Array<UserList>) => {
    data.forEach(function (list) {
      this.lists.push({
        label: list.name,
        value: list.id,
        customProperties: {
          completion: Object.hasOwn(list, 'amount_completed')
            ? ' (' + list.amount_completed + '/' + list.amount_total + ') ' + Math.floor(list.amount_completed / list.amount_total * 100) + '%'
            : ' (' + list.amount_total + ')'
        }
      })
    }, this)
    this.updateSelect()
    this.updateTable()
  }
  
  // Function responsible for showing the total amount of chapters/minutes of the current selection and the user's completion in %
  statsHandler = (_ev, _settings, json: MediaSearchResult) => {
    let data: string
    if (this.mediaTypeSelect.value === 'ANIME') {
      data = json.filtered_runtime + ' minutes'
      if (json.total_runtime > json.filtered_runtime) {
        data += ' (filtered from ' + json.total_runtime + ' minutes)'
      }
    } else if (this.mediaTypeSelect.value === 'MANGA') {
      data = json.filtered_episodes + ' chapters, ' + json.filtered_volumes + ' volumes'
      if (json.total_episodes > json.filtered_episodes) {
        data += ' (filtered from ' + json.total_episodes + ' chapters, ' + json.total_volumes + ' volumes)'
      }
    }
  
    const completion = (Math.floor(json.total_completed) / json.recordsTotal * 100).toFixed(2)
  
    document.querySelector('#stats').innerHTML = completion + '% Completed, ' + data
  }
  
  // Function that adds the filter values to the data that will get sent to the API
  getParams = (params, settings) => {
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
  updateTable = () => {
    if (this.table) {
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
        'code',
        'externalLinks'
      ])
    })
  
    // Let DataTables update the completion and total count info on top of the table
    this.table.on('xhr.dt', this.statsHandler)
  }
}

export default BetterList
