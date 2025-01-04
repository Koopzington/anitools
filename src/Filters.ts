import AniTools from "./AniTools"
import Tagify from '@yaireo/tagify'
import noUiSlider from 'nouislider'
import wNumb from 'wnumb'
import Inputmask from 'inputmask'
import Settings from './Settings'
import { handleResponse, htmlToNode } from './commonLib'
import { mediaTypeSelect, userNameField, loadButton } from './GlobalElements'

class Filters extends EventTarget {
  private readonly filterContainer: HTMLDivElement = document!.createElement('div')!
  private readonly AniTools: AniTools
  private readonly ATSettings: Settings
  private curFilterValues: any
  private readonly andOrSwitch: HTMLButtonElement = document.createElement('button')
  private readonly regexSwitch: HTMLButtonElement = document.createElement('button')
  private readonly dateMask = '^(\\d{4}|\\*)-([0]\\d|1[0-2]|\\*)-([0-2]\\d|3[01]|\\*)$'
  private readonly mangaUpdatesWarning = 'Experimental (Only a third of AL manga is currently covered with data for this)'
  private readonly tooltipElement: HTMLSpanElement = htmlToNode(
    `<span class="custom-tooltip" style="align-self: center;" data-title="">
      <i class="fa fa-info-circle"></i>
    </span>`
  )
  private readonly filterTemplate: HTMLDivElement = htmlToNode('<div class="d-flex"></div>')

  private readonly filterMap = {
    MAPPER: [
      'titleLike',
      'notesLike',
      'userList',
      'format',
      'source',
      'country',
      'airStatus',
      'genre',
      'tag',
      'tagPercentage',
      'year',
      'airingStart',
      'airingFinish',
      'userStartFrom',
      'userFinishUntil',
      'externalLink',
      'staff',
      'episodes',
      'volumes',
      'meanScore',
      'avgScore',
      'mcCount',
      'showAdult',
    ],
    MANGA: [
      'titleLike',
      'notesLike',
      'userList',
      'format',
      'source',
      'country',
      'airStatus',
      'genre',
      'tag',
      'tagPercentage',
      'year',
      'airingStart',
      'airingFinish',
      'userStartFrom',
      'userFinishUntil',
      'externalLink',
      'staff',
      'episodes',
      'volumes',
      'meanScore',
      'avgScore',
      'mcCount',
      'muPublisher',
      'muPublication',
      'onlyScanlated',
      'showAdult',
    ],
    ANIME: [
      'titleLike',
      'notesLike',
      'userList',
      'format',
      'source',
      'country',
      'airStatus',
      'genre',
      'tag',
      'tagPercentage',
      'season',
      'year',
      'airingStart',
      'airingFinish',
      'userStartFrom',
      'userFinishUntil',
      'externalLink',
      'voiceActor',
      'staff',
      'studio',
      'producer',
      'awcCommunityList',
      'episodes',
      'totalRuntime',
      'meanScore',
      'avgScore',
      'mcCount',
      'showAdult',
    ],
    CHARACTER: [
      'nameLike',
      'bloodType',
      'gender',
      'birthdayFrom',
      'birthdayUntil',
    ],
    STAFF: [
      'nameLike',
      'bloodType',
      'gender',
      'birthdayFrom',
      'birthdayUntil',
      'deathdayFrom',
      'deathdayUntil',
    ]
  }

  private filterDefs = {
    userList: {
      type: 'userList',
      logic: 'AND',
      label: 'List',
      urlOrData: [],
    },
    titleLike: {
      type: 'text',
      logic: 'AND',
      label: 'Title',
      urlOrData: [],
      regex: true,
    },
    notesLike: {
      type: 'text',
      logic: 'AND',
      label: 'Notes',
      urlOrData: [],
    },
    format: {
      type: 'tagify',
      logic: 'OR',
      label: 'Format',
      urlOrData: [],
    },
    source: {
      type: 'tagify',
      logic: 'OR',
      label: 'Source',
      urlOrData: [],
    },
    country: {
      type: 'tagify',
      logic: 'OR',
      label: 'Country',
      urlOrData: [],
    },
    airStatus: {
      type: 'tagify',
      logic: 'OR',
      label: 'Airing Status',
      urlOrData: [],
    },
    airingStart: {
      type: 'text',
      logic: 'AND',
      label: 'Started Airing',
      mask: this.dateMask,
      urlOrData: [],
      tooltip: 'You can use "*" instead of numbers as wildcards (1991-*-*, 199*-01-01 however won\'t work)',
    },
    airingFinish: {
      type: 'text',
      logic: 'AND',
      label: 'Finished Airing',
      mask: this.dateMask,
      urlOrData: [],
      tooltip: 'You can use "*" instead of numbers as wildcards (1991-*-*, 199*-01-01 however won\'t work)',
    },
    genre: {
      type: 'tagify',
      logic: 'AND',
      label: 'Genres',
      urlOrData: [],
    },
    tag: {
      type: 'tagify',
      logic: 'AND',
      label: 'Tags',
      urlOrData: [],
      tooltip: 'You can enable/disable grouping tags by their categories in the settings',
    },
    tagPercentage: {
      type: 'range',
      label: 'Tag Percentage'
    },
    season: {
      type: 'tagify',
      logic: 'OR',
      label: 'Season',
      urlOrData: [],
    },
    year: {
      type: 'tagify',
      logic: 'OR',
      label: 'Season Year',
      urlOrData: [],
      tooltip: 'For easy range selection you can enter them like "2010-2015"',
    },
    externalLink: {
      type: 'tagify',
      logic: 'AND',
      label: 'Available On',
      urlOrData: [],
    },
    voiceActor: {
      type: 'tagify',
      logic: 'AND',
      label: 'Voice Actor (ID)',
      urlOrData: '/staff',
    },
    staff: {
      type: 'tagify',
      logic: 'AND',
      label: 'Staff (ID)',
      urlOrData: '/staff',
    },
    studio: {
      type: 'tagify',
      logic: 'AND',
      label: 'Studio',
      urlOrData: '/searchForFilter/studio',
    },
    producer: {
      type: 'tagify',
      logic: 'AND',
      label: 'Producer',
      urlOrData: '/searchForFilter/studio',
    },
    awcCommunityList: {
      type: 'tagify',
      logic: 'AND',
      label: 'Community List',
      urlOrData: [],
    },
    totalRuntime: {
      type: 'range',
      label: 'Total Runtime'
    },
    episodes: {
      type: 'range',
      label: 'Episodes',
    },
    volumes: {
      type: 'range',
      label: 'Volumes',
    },
    mcCount: {
      type: 'range',
      label: 'Main Characters',
    },
    meanScore: {
      type: 'range',
      label: 'Mean Score',
    },
    avgScore: {
      type: 'range',
      label: 'Average Score',
    },
    showAdult: {
      type: 'checkbox',
      label: 'Show Adult entries',
    },
    muPublisher: {
      type: 'tagify',
      logic: 'AND',
      label: 'Publisher',
      urlOrData: '/searchForFilter/muPublisher',
      tooltip: this.mangaUpdatesWarning,
    },
    muPublication: {
      type: 'tagify',
      logic: 'AND',
      label: 'Publication',
      urlOrData: '/searchForFilter/muPublication',
      tooltip: this.mangaUpdatesWarning,
    },
    onlyScanlated: {
      type: 'checkbox',
      label: 'Only fully scanlated',
      tooltip: this.mangaUpdatesWarning,
    },
    nameLike: {
      type: 'text',
      logic: 'AND',
      label: 'Name',
      regex: true,
    },
    bloodType: {
      type: 'tagify',
      logic: 'OR',
      label: 'Blood Type',
      urlOrData: [],
    },
    gender: {
      type: 'tagify',
      logic: 'OR',
      label: 'Gender',
      urlOrData: [],
    },
    birthdayFrom: {
      type: 'text',
      logic: 'OR',
      label: 'Birthday from',
      mask: this.dateMask,
      urlOrData: [],
      tooltip: 'You can use "*" instead of numbers as wildcards (1991-*-*, 199*-01-01 however won\'t work)',
    },
    birthdayUntil: {
      type: 'text',
      logic: 'OR',
      label: 'Birthday until',
      mask: this.dateMask,
      urlOrData: [],
      tooltip: 'You can use "*" instead of numbers as wildcards (1991-*-*, 199*-01-01 however won\'t work)',
    },
    deathdayFrom: {
      type: 'text',
      logic: 'OR',
      label: 'Deathday from',
      mask: this.dateMask,
      urlOrData: [],
      tooltip: 'You can use "*" instead of numbers as wildcards (1991-*-*, 199*-01-01 however won\'t work)',
    },
    deathdayUntil: {
      type: 'text',
      logic: 'OR',
      label: 'Deathday until',
      mask: this.dateMask,
      urlOrData: [],
      tooltip: 'You can use "*" instead of numbers as wildcards (1991-*-*, 199*-01-01 however won\'t work)',
    },
    userStartFrom: {
      type: 'text',
      logic: 'OR',
      label: 'Started on',
      mask: this.dateMask,
      urlOrData: [],
      tooltip: 'You can use "*" instead of numbers as wildcards (1991-*-*, 199*-01-01 however won\'t work)',
    },
    userFinishUntil: {
      type: 'text',
      logic: 'OR',
      label: 'Completed on',
      mask: this.dateMask,
      urlOrData: [],
      tooltip: 'You can use "*" instead of numbers as wildcards (1991-*-*, 199*-01-01 however won\'t work)',
    },
  }

  // Object to hold all added filters
  private filters: {
    userList: Tagify | undefined,
    titleLike: HTMLInputElement | undefined,
    notesLike: HTMLInputElement | undefined,
    format: Tagify | undefined,
    source: Tagify | undefined,
    country: Tagify | undefined,
    airStatus: Tagify | undefined,
    airingStart: HTMLInputElement | undefined,
    airingFinish: HTMLInputElement | undefined,
    genre: Tagify | undefined | undefined,
    tag: Tagify | undefined,
    tagPercentage: HTMLInputElement | undefined,
    season: Tagify | undefined,
    year: Tagify | undefined,
    externalLink: Tagify | undefined,
    voiceActor: Tagify | undefined,
    staff: Tagify | undefined,
    studio: Tagify | undefined,
    producer: Tagify | undefined,
    awcCommunityList: Tagify | undefined,
    totalRuntime: HTMLInputElement,
    episodes: HTMLInputElement,
    volumes: HTMLInputElement,
    mcCount: HTMLInputElement,
    meanScore: HTMLInputElement,
    avgScore: HTMLInputElement,
    showAdult: HTMLInputElement,
    muPublisher: Tagify | undefined,
    muPublication: Tagify | undefined,
    onlyScanlated: HTMLInputElement | undefined,
    nameLike: HTMLInputElement | undefined,
    bloodType: Tagify | undefined,
    gender: Tagify | undefined,
    birthdayFrom: HTMLInputElement | undefined,
    birthdayUntil: HTMLInputElement | undefined,
    deathdayFrom: HTMLInputElement | undefined,
    deathdayUntil: HTMLInputElement | undefined,
  } = {}

  private abortController: AbortController | undefined
  // We cache tags on initialization so the user can switch between grouped and non-grouped mode on the filter
  private tagCache: Object
  // We cache years on initialization so the user can switch between single years and year ranges on the filter
  private yearCache: Object

  constructor (anitools: AniTools, settings: Settings) {
    super()
    this.filterContainer.id = 'filters'
    settings.addEventListener('tag-grouping-updated', this.updateTagFilter)
    this.AniTools = anitools
    this.ATSettings = settings
    this.andOrSwitch.classList.add('btn', 'btn-primary', 'and-or-switch')
    this.andOrSwitch.innerText = 'AND'
    this.andOrSwitch.title = 'All values must match'
    this.regexSwitch.classList.add('btn', 'regex-switch')
    this.regexSwitch.innerText = '.*'
    this.regexSwitch.title = 'Default algorithm will be used for matching'
  }

  public readonly removeFilters = () => {
    // First we clean up all existing ones
    Object.entries(this.filters).forEach((filter) => {
      if (filter[1] instanceof Tagify) {
        filter[1].destroy()
        delete this.filters[filter[0]]
      }

      // Handle Range instances
      if (Object.hasOwn(filter[1], 'noUiSlider')) {
        filter[1].remove()

        delete this.filters[filter[0]]
      }

      if (filter[1] instanceof HTMLInputElement) {
        filter[1].remove()
        delete this.filters[filter[0]]
      }
    })

    this.filterContainer.innerHTML = ''
    // Remove the container from the DOM (doesn't delete it)
    this.filterContainer.remove()
  }

  // Function to setup all filters
  public readonly insertFilters = async (filterSet: string) => {
    this.removeFilters()
    document.querySelector('.sidebar .sidebar-content')?.insertAdjacentElement('beforeend', this.filterContainer)
    
    const clearBtn = document.createElement('button')
    clearBtn.classList.add('btn', 'btn-danger')
    clearBtn.innerText = 'Clear filters'
    this.filterContainer.insertAdjacentElement('beforeend', clearBtn)

    clearBtn.addEventListener('click', () => {
      Object.entries(this.filters).forEach((f) => {
        if (f[0] === 'userList') {
          return
        }

        if (f[1] instanceof Tagify) {
          f[1].removeAllTags()

          return
        }

        // Handle Range instances
        if (Object.hasOwn(f[1], 'noUiSlider')) {
          f[1].noUiSlider.reset()

          return
        }

        // Handle checkboxes
        if (f[1] instanceof HTMLInputElement && f[1].type === 'checkbox') {
          f[1].checked = false

          return
        }

        // Handle text inputs
        if (f[1] instanceof HTMLInputElement) {
          f[1].value = ''
        }
      })
    })

    let lists: TagifyValue[] = [];
    if (userNameField.value.length > 0 && this.filterMap[filterSet].includes('userList')) {
      this.abortController && this.abortController.abort()
      this.abortController = new AbortController()

      let forceReload = ''
      if (loadButton.classList.contains('btn-secondary')) {
        loadButton.classList.remove('btn-secondary')
        loadButton.title = ''
        forceReload = '&force_reload=true'
      }

      let response
      try {
        response = await this.AniTools.fetch(
          '/userLists?user_name=' + userNameField.value + '&media_type=' + mediaTypeSelect.value + forceReload,
          { signal: this.abortController.signal }
        )
      } catch (error) {
        this.abortController = undefined
        return
      }

      const json = await response.json()

      if (Object.hasOwn(json, 'error')) {
        json.error.forEach((e) => {
          this.AniTools.alert(e.message)
        })
      }
      if (Object.hasOwn(json, 'warnings')) {
        json.warnings.forEach((e) => {
          this.AniTools.alert(e.message, 'warning')
          if (Object.hasOwn(e, 'type') && e.type === 'timeout') {
            loadButton.classList.add('btn-secondary')
            loadButton.title = 'Force reloading may take a bit of time.'
          }
        })
      }
      const data: UserList[] = json.data

      data.forEach(function (list) {
        lists.push({
          label: list.name,
          value: list.id,
          customProperties: {
            completion: Object.hasOwn(list, 'amount_completed')
              ? ' (' + list.amount_completed.toString() + '/' + list.amount_total.toString() + ') ' + Math.floor(list.amount_completed / list.amount_total * 100).toString() + '%'
              : ' (' + list.amount_total.toString() + ')'
          }
        })
      }, this)

      // Reindex array and filter out empty lists
      lists = [...lists].sort(undefined).filter(a => a)
    }

    this.filterMap[filterSet].forEach((filterName: string) => {
      const filterDef = this.filterDefs[filterName]
      switch (filterDef.type) {
        case 'text':
          this.addText(filterName, filterDef)
          break;
        case 'tagify':
          this.addTagify(filterName, filterDef)
          break;
        case 'checkbox':
          this.addCheckbox(filterName, filterDef)
          break;
        case 'range':
          // Switch labels for the Episodes filter depending on media type
          if (filterSet === 'MANGA' && filterDef.label === 'Episodes') {
            filterDef.label = 'Chapters'
          }
          if (filterSet === 'ANIME' && filterDef.label === 'Chapters') {
            filterDef.label = 'Episodes'
          }

          this.addRange(filterName, filterDef)
          break;
        case 'userList':
          if (userNameField.value.length === 0 || lists.length === 0) {
            return
          }

          const container = this.filterTemplate.cloneNode(true)
          const field = document.createElement('input')
          field.setAttribute('placeholder', filterDef.label)
          field.classList.add('column-filter', 'form-control')
          field.dataset.logic = filterDef.logic
          field.value = lists[0].label
          field.addEventListener('change', this.filterChangeCallback)
          const logicSwitch: HTMLButtonElement = this.andOrSwitch.cloneNode(true)
          logicSwitch.dataset.filter = 'userList'
          logicSwitch.addEventListener('click', this.logicSwitchCallback);
          container.insertAdjacentElement('afterbegin', logicSwitch)
          container.insertAdjacentElement('beforeend', field)
          this.filterContainer.insertAdjacentElement('beforeend', container)
          this.filters.userList = new Tagify(field, {
            enforceWhiteList: true,
            whitelist: lists,
            pasteAsTags: false,
            editTags: false,
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
                  <div class="ch-label" title="${item.label}">${item.label}</div>
                  <div class="ch-completion">${item.customProperties.completion}</div>
                </div>`
              },
            },
            transformTag: (tagData) => {
              tagData.exclude = false
            }
          })
          this.filters.userList.on('click', (e) => {
            if (this.filterDefs['userList'].logic === 'AND') {
              const {tag:tagElm, data:tagData} = e.detail;
              tagData.exclude = tagData.exclude !== true
              this.filters.userList.replaceTag(tagElm, tagData)
            }
          })
          break;
      }
    })

    // Backup the dropdown rendering function to switch between the custom one for tag groups and the normal one
    if (this.filters.tag !== undefined) {
      this.filters.tag.dropdown.createListHTMLoriginal = this.filters.tag.dropdown.createListHTML
    }
  }

  // Function for Tools to call upon unloading to stop any running requests
  public readonly abort = (): void => {
    this.abortController && this.abortController.abort()
  }

  // Function that updates the available options in the filters using the data the API returned
  public readonly updateFilters = async (filterSet: string): Promise<void> => {
      await this.insertFilters(filterSet)
      // Only really happens if the username field is filled and the user switched between media types
      // before the lists could get loaded
      if (Object.entries(this.filters).length === 0) {
        return
      }

      this.abortController && this.abortController.abort()
      this.abortController = new AbortController()

      let response: Response
      try {
        response = await this.AniTools.fetch(
          '/filterValues?media_type=' + mediaTypeSelect.value,
          { signal: this.abortController.signal }
        )
      } catch (error) {
        return
      }
      
      const filterValues = await handleResponse(response)
      this.tagCache = filterValues.tags
      if (this.filters.format !== undefined) {
        this.filters.format.whitelist = filterValues.format.map((v) => { return {value: v, text: v}})
      }
      if (this.filters.genre !== undefined) {
        this.filters.genre.whitelist = filterValues.genres.map((v) => { return {value: v, text: v}})
      }
      if (this.filters.country !== undefined) {
        this.filters.country.whitelist = filterValues.country_of_origin.map((v) => { return {value: v, text: v}})
      }
      if (this.filters.externalLink !== undefined) {
        this.filters.externalLink.whitelist = filterValues.external_links.map((v) => { return {value: v, text: v}})
      }
      if (this.filters.season !== undefined) {
        this.filters.season.whitelist = filterValues.season.map((v) => { return {value: v, text: v}})
      }
      if (this.filters.year !== undefined) {
        let values = filterValues.season_year.map((v) => { return {value: v, text: v}})
        this.filters.year.whitelist = values
        this.yearCache = values
      }
      if (this.filters.source !== undefined) {
        this.filters.source.whitelist = filterValues.source.map((v) => { return {value: v, text: v}})
      }
      if (this.filters.airStatus !== undefined) {
        this.filters.airStatus.whitelist = filterValues.status.map((v) => { return {value: v, text: v}})
      }
      if (this.filters.awcCommunityList !== undefined) {
        this.filters.awcCommunityList.whitelist = filterValues.awc_community_lists.map((v) => { return {value: v, text: v}})
      }
      if (this.filters.tag !== undefined) {
        this.updateTagFilter()
      }
      if (this.filters.tagPercentage !== undefined) {
        this.updateRangeFilter(this.filters.tagPercentage, [0, 100])
      }
      if (this.filters.totalRuntime !== undefined) {
        this.updateRangeFilter(this.filters.totalRuntime, filterValues.total_runtime)
      }
      if (this.filters.episodes !== undefined) {
        this.updateRangeFilter(this.filters.episodes, filterValues.episodes)
      }
      if (this.filters.volumes !== undefined) {
        this.updateRangeFilter(this.filters.volumes, filterValues.volumes)
      }
      if (this.filters.mcCount !== undefined) {
        this.updateRangeFilter(this.filters.mcCount, filterValues.mcCount)
      }
      if (this.filters.meanScore !== undefined) {
        this.updateRangeFilter(this.filters.meanScore, [0, 100])
      }
      if (this.filters.avgScore !== undefined) {
        this.updateRangeFilter(this.filters.avgScore, [0, 100])
      }
      if (this.filters.bloodType !== undefined) {
        this.filters.bloodType.whitelist = filterValues.blood_type.map((v) => { return {value: v, text: v}})
      }
      if (this.filters.gender !== undefined) {
        this.filters.gender.whitelist = filterValues.gender.map((v) => { return {value: v, text: v}})
      }
      
      this.curFilterValues = this.getFilterParams()
  }

  private readonly filterChangeCallback = () => {
    const newValues = this.getFilterParams()
    // Only trigger the event if the values actually changed
    if (JSON.stringify(this.curFilterValues) !== JSON.stringify(newValues)) {
      this.dispatchEvent(new Event('filter-changed'))
    }
    this.curFilterValues = newValues
  }

  private readonly regexSwitchCallback = (ev) => {
    const regexSwitch = ev.target
    const field = this.filters[regexSwitch.dataset.filter]
    const newMode = field.dataset.regex === 'regex' ? 'default' : 'regex'
    field.dataset.regex = newMode
    regexSwitch.classList.toggle('btn-primary', newMode === 'regex')
    regexSwitch.title = newMode === 'regex'
      ? 'RegEx pattern will be used for matching. Patterns need to be wrapped in delimiters like /, ~, @ or #.' 
        +' You can append an "i" behind it for a case insensitive search. Example: /(Do|Re|Mi)/i'
      : 'Default algorithm will be used for matching'
    this.filterChangeCallback()
  }

  private readonly logicSwitchCallback = (ev) => {
    const logicSwitch = ev.target
    const field = this.filters[logicSwitch.dataset.filter].DOM.originalInput
    const newLogic = field.dataset.logic === 'AND' ? 'OR' : 'AND'
    field.dataset.logic = newLogic
    logicSwitch.innerText = newLogic
    logicSwitch.title = newLogic === 'AND' ? 'All values must match' : 'Any values may match'
    this.filterChangeCallback()
  }

  private readonly addText = (col: string, filterDef: FilterDefinition) => {
    const container = this.filterTemplate.cloneNode(true)
    const input = document.createElement('input')
    input.classList.add('column-filter', 'form-control')
    input.dataset.column = col
    input.placeholder = filterDef.label

    if (Object.hasOwn(filterDef, 'mask') && filterDef.mask !== null) {
      Inputmask({ regex: filterDef.mask }).mask(input)
    }

    // Add a button to switch to regex mode if the filter supports it
    if (Object.hasOwn(filterDef, 'regex') && filterDef.regex === true) {
      const regexSwitch: HTMLButtonElement = this.regexSwitch.cloneNode(true)
      regexSwitch.dataset.filter = col
      regexSwitch.addEventListener('click', this.regexSwitchCallback)

      container.insertAdjacentElement('afterbegin', regexSwitch)
    }

    this.filters[col] = input

    container.insertAdjacentElement('beforeend', input)

    if (Object.hasOwn(filterDef, 'tooltip') && filterDef.tooltip.length > 0) {
      const info = this.tooltipElement.cloneNode(true)
      info.dataset.title = filterDef.tooltip
      container.insertAdjacentElement('beforeend', info)
    }

    this.filterContainer.insertAdjacentElement('beforeend', container)
    input.addEventListener('keyup', this.filterChangeCallback)
  }

  // Function to add a Tagify type filter
  private readonly addTagify = (col: string, filterDef: FilterDefinition) => {
    const container = this.filterTemplate.cloneNode(true)
    const field = document.createElement('input')
    field.setAttribute('placeholder', filterDef.label)
    field.classList.add('column-filter', 'form-control')
    field.dataset.logic = filterDef.logic
    field.addEventListener('change', this.filterChangeCallback)
    container.insertAdjacentElement('beforeend', field)
    if (filterDef.logic === 'AND') {
      const logicSwitch: HTMLButtonElement = this.andOrSwitch.cloneNode(true)
      logicSwitch.dataset.filter = col
      logicSwitch.addEventListener('click', this.logicSwitchCallback);
      container.insertAdjacentElement('afterbegin', logicSwitch)
    }
    this.filterContainer.insertAdjacentElement('beforeend', container)

    if (Object.hasOwn(filterDef, 'tooltip') && filterDef.tooltip.length > 0) {
      const info = this.tooltipElement.cloneNode(true)
      info.dataset.title = filterDef.tooltip
      container.insertAdjacentElement('beforeend', info)
    }

    const options = {
      whitelist: [],
      tagTextProp: 'text',
      pasteAsTags: false,
      editTags: false,
      dropdown: {
        maxItems: Infinity,
        enabled: typeof filterDef.urlOrData === 'string' ? 1 : 0,
        searchKeys: ['value', 'text'],
        mapValueTo: 'text',
        highlightFirst: true,
        closeOnSelect: typeof filterDef.urlOrData === 'string'
      },
      // Set default properties of tags
      transformTag: (tagData) => {
        tagData.exclude = false
      },
      // Custom wrapper template to add a "Remove all" button
      templates: {
        wrapper(input, _s){
          return `<tags class="${_s.classNames.namespace} ${_s.mode ? `${_s.classNames[_s.mode + "Mode"]}` : ""} ${input.className}"
                      ${_s.readonly ? 'readonly' : ''}
                      ${_s.disabled ? 'disabled' : ''}
                      ${_s.required ? 'required' : ''}
                      ${_s.mode === 'select' ? "spellcheck='false'" : ''}
                      tabIndex="-1">
                      ${this.settings.templates.input.call(this)}
                  <i class="clear-filter fa fa-circle-xmark" title="Remove all values"></i>
          </tags>`
      },
    }
    }
    const tagify: Tagify = new Tagify(field, options)
    // Make the "Remove all" button remove all selected values
    tagify.DOM.scope.querySelector('.clear-filter').addEventListener('click', tagify.removeAllTags.bind(tagify))

    // We received an URL for fetching tags remotely
    if (typeof filterDef.urlOrData === 'string') {
      // Trigger the InputHandler when somebody pastes into the field
      tagify.settings.hooks.beforePaste = async function (_tagify, pastedText) {
        // It wants a promise? It get's a promise
        return await new Promise(function (resolve) {
          tagifyInputHandler(pastedText.pastedText)
          resolve()
        })
      }

      let controller: AbortController
      const tagifyInputHandler = (value: string) => {
        tagify.whitelist = null // reset the whitelist

        controller && controller.abort()
        controller = new AbortController()

        // show loading animation and hide the suggestions dropdown
        tagify.loading(true).dropdown.hide()
        if (value.length === 0) {
          tagify.loading(false)
          return
        }
        this.AniTools.fetch(filterDef.urlOrData + '?q=' + value, { signal: controller.signal })
          .then(async response => await response.json())
          .then((newWhitelist) => {
            tagify.whitelist = newWhitelist // update whitelist Array in-place
            tagify.loading(false).dropdown.show(value) // render the suggestions dropdown
          })
          .catch(() => null)
      }

      tagify.on('input', (e) => {
        tagifyInputHandler(e.detail.tagify.state.inputText)
      })
      // Ideally this shouldn't be here but it's the only usecase
    } else if (col === 'year') {
      const tagifyInputHandler = (value: string) => {
        if (value.indexOf('-') === -1) {
          this.filters.year.whitelist = this.yearCache
          this.filters.year.dropdown.show(value)
          return
        }
        const split = value.split('-').map(parseInt)
        let newWhitelist: TagifyValue[] = [];
        this.yearCache.forEach(element => {
          if (element.value > split[0]) {
            newWhitelist.push({
              value: split[0] + '-' + element.value,
              label: split[0] + '-' + element.value,
            })
          }
        });
        this.filters.year.whitelist = newWhitelist
        this.filters.year.dropdown.show(value)
      }

      tagify.on('input', (e) => {
        tagifyInputHandler(e.detail.tagify.state.inputText)
      })
    }

    // Invert value of exclude property on click
    tagify.on('click', (e) => {
      const {tag:tagElm, data:tagData} = e.detail;
      tagData.exclude = tagData.exclude !== true
      tagify.replaceTag(tagElm, tagData)
    })

    this.filters[col] = tagify
  }

  private readonly addCheckbox = (col: string, filterDef: FilterDefinition): void => {
    const cswitch = document.createElement('div')
    cswitch.classList.add('custom-switch')
    const labelElement: HTMLLabelElement = document.createElement('label')
    labelElement.htmlFor = col
    labelElement.innerHTML = filterDef.label
    const field = document.createElement('input')
    field.type = 'checkbox'
    field.id = col
    field.classList.add('column-filter')
    field.addEventListener('click', this.filterChangeCallback)
    cswitch.insertAdjacentElement('beforeend', field)
    cswitch.insertAdjacentElement('beforeend', labelElement)

    if (Object.hasOwn(filterDef, 'tooltip') && filterDef.tooltip.length > 0) {
      cswitch.style.display = 'flex'
      cswitch.style.gap = '0.25em'
      const info = this.tooltipElement.cloneNode(true)
      info.dataset.title = filterDef.tooltip
      cswitch.insertAdjacentElement('beforeend', info)
    }

    this.filters[col] = field

    this.filterContainer.insertAdjacentElement('beforeend', cswitch)
  }

  private readonly addRange = (col: string, filterDef: FilterDefinition): void => {
    const formInline = document.createElement('div')
    formInline.classList.add('form-inline')

    const labelElement = document.createElement('span')
    labelElement.classList.add('column-filter-label')
    labelElement.innerHTML = filterDef.label + ':'
    this.filterContainer.insertAdjacentElement('beforeend', labelElement)

    const minField: HTMLInputElement = document.createElement('input')
    minField.classList.add('column-filter', 'form-control')
    formInline.insertAdjacentElement('beforeend', minField)

    const container = document.createElement('div')
    container.classList.add('column-filter', 'form-control', 'range-filter')
    container.dataset.column = 'episodes'
    this.filterContainer.insertAdjacentElement('beforeend', container)

    const maxField: HTMLInputElement = document.createElement('input')
    maxField.classList.add('column-filter', 'form-control')
    formInline.insertAdjacentElement('beforeend', maxField)

    this.filterContainer.insertAdjacentElement('beforeend', formInline)

    this.filters[col] = container
    noUiSlider.create(container, {
      start: [0, 9999],
      connect: true,
      format: wNumb({ decimals: 0 }),
      range: { min: 0, max: 9999 }
    })
    container.noUiSlider.on('set', () => {
      container.dispatchEvent(new Event('change'))
      this.filterChangeCallback()
    })

    container.noUiSlider.on('update', (values, handle) => {
      const value = Math.round(values[handle])
      if (handle === 0) {
        minField.value = value.toString()
      } else {
        maxField.value = value.toString()
      }
    })

    let debouncer: number

    minField.addEventListener('keyup', () => {
      clearTimeout(debouncer)
      debouncer = setTimeout(() => {
        container.noUiSlider.set([minField.value, null])
        this.filterChangeCallback()
      }, 500);
    })

    maxField.addEventListener('keyup', () => {
      clearTimeout(debouncer)
      debouncer = setTimeout(() => {
        container.noUiSlider.set([null, maxField.value])
        this.filterChangeCallback()
      }, 500);
    })
  }

  private readonly updateRangeFilter = (filter, values) => {
    // Prepare options object to update episode filter
    const options = {
      start: [filter.noUiSlider.get()[0], values[values.length - 1]],
      range: {
        min: 0,
        max: values[values.length - 1]
      }
    }

    // Calculate steps
    for (let i = 0; i < values.length - 1; ++i) {
      options.range[((values[i] / values[values.length - 1]) * 100).toString() + '%'] = values[i]
    }
    filter.noUiSlider.updateOptions(options, false)
  }

  private readonly updateTagFilter = (): void => {
    if (!this.tagCache) {
      return
    }
    const values: any[] = []
    Object.entries(this.tagCache).forEach((group) => {
      group[1].forEach((tag: string) => {
        values.push({
          category: group[0],
          value: tag,
          text: tag
        })
      })
    })
    this.filters.tag.whitelist = values

    if (this.ATSettings.shouldGroupTags()) {
      this.filters.tag.dropdown.createListHTML = (suggestionList) => {
        const categories = suggestionList.reduce((acc, suggestion) => {
          const category = suggestion.category || 'Not Assigned';
            if( !acc[category] )
                acc[category] = [suggestion]
            else
                acc[category].push(suggestion)
    
            return acc
          }, {})
      
          const getUsersSuggestionsHTML = categories => categories.map((suggestion) => {
              if( typeof suggestion == 'string' || typeof suggestion == 'number' )
                  suggestion = {value:suggestion}
      
              var value = this.filters.tag.dropdown.getMappedValue.call(this.filters.tag, suggestion)
      
              suggestion.value = value
      
              return this.filters.tag.settings.templates.dropdownItem.apply(this.filters.tag, [suggestion]);
          }).join("")

          return Object.entries(categories).map(([category, categories]) => {
              return `<div class="tagify-dropdown-item-group" data-title="${category}:">${getUsersSuggestionsHTML(categories)}</div>`
          }).join("")
      }
    } else {
      // Sort values alphabetically
      values.sort((x,y) => { if (x.value < y.value) { return -1 } if (x.value > y.value) { return 1 } return 0 } );
      this.filters.tag.whitelist = values
      // Reset Dropdown rendering function to default
      this.filters.tag.dropdown.createListHTML = this.filters.tag.dropdown.createListHTMLoriginal
    }
  }

  public getFilters = (): any => this.filters

  // Function returning an object of params that can be used for requests to the AniTools Backend
  public getFilterParams = (): any => {
    const params = {}

    Object.entries(this.filters).forEach((f) => {
      // Handle Tagify instances
      if (f[1] instanceof Tagify && f[1].value.length > 0) {
        params[f[0]] = {}
        const logic = f[1].DOM.originalInput.dataset.logic ?? 'AND'
        const v: string[] = []
        const not: string[] = []
        f[1].value.forEach((p) => {
          if (p.exclude === false) {
            v.push(p.value)
          } else {
            not.push(p.value)
          }
          
        })
        params[f[0]][logic.toLowerCase()] = v
        if (not.length > 0) {
          params[f[0]]['not'] = not
        }

        return
      }
      // Handle Checkbox instances
      if (f[1]?.tagName === 'INPUT' && f[1].type === 'checkbox') {
        params[f[0]] = f[1].checked
      }
      // Handle Range instances
      if (Object.hasOwn(f[1], 'noUiSlider')) {
        params[f[0] + 'Min'] = f[1].noUiSlider.get()[0]
        params[f[0] + 'Max'] = f[1].noUiSlider.get()[1]

        return
      }
      if (f[1]?.tagName === 'INPUT' && f[1].type === 'text' && f[1].value.length > 0) {
        // Validate value against regex pattern if present
        if (! Object.hasOwn(this.filterDefs[f[0]], 'mask') || f[1].value.match(this.filterDefs[f[0]].mask) !== null) {
          if (Object.hasOwn(this.filterDefs[f[0]], 'regex') && this.filterDefs[f[0]].regex === true) {
            params[f[0]] = {
              regex: f[1].dataset.regex === 'regex',
              value: f[1].value
            }
          } else {
            params[f[0]] = f[1].value
          }
        }
      }
    })

    // Move tagPercentage to the right place
    if (Object.hasOwn(params, 'tagPercentageMin')) {
      if (Object.hasOwn(params, 'tag')) {
        params['tag']['tagPercentageMin'] = params['tagPercentageMin']
        params['tag']['tagPercentageMax'] = params['tagPercentageMax']
      }
      delete params['tagPercentageMin']
      delete params['tagPercentageMax']
    }

    return { and: params }
  }
}

export default Filters
