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
  private readonly andOrSwitch: HTMLButtonElement = htmlToNode(
    `<button class="btn btn-primary and-or-switch" title="All values must match">AND</button>`
  )
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
    MANGA: [
      'id',
      'titleLike',
      'notesLike',
      'descriptionLike',
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
      'relationToAWCCommunityList',
      'meanScore',
      'avgScore',
      'popularity',
      'mcCount',
      'muPublisher',
      'muPublication',
      'onlyScanlated',
      'showAdult',
    ],
    ANIME: [
      'id',
      'titleLike',
      'notesLike',
      'descriptionLike',
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
      'popularity',
      'mcCount',
      'showAdult',
    ],
    CHARACTER: [
      'id',
      'nameLike',
      'descriptionLike',
      'bloodType',
      'gender',
      'birthdayFrom',
      'birthdayUntil',
    ],
    STAFF: [
      'id',
      'nameLike',
      'descriptionLike',
      'bloodType',
      'gender',
      'primaryOccupation',
      'homeTownLike',
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
    id: {
      type: 'tagify',
      logic: 'AND',
      label: 'ID',
      urlOrData: '*',
      tooltip: 'Enter "99" if the ID should contain "99"',
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
      regex: true,
    },
    descriptionLike: {
      type: 'text',
      logic: 'AND',
      label: 'Description',
      urlOrData: [],
      regex: true,
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
      urlOrData: '/searchForFilter/producer',
    },
    awcCommunityList: {
      type: 'tagify',
      logic: 'AND',
      label: 'Community List',
      urlOrData: [],
    },
    relationToAWCCommunityList: {
      type: 'tagify',
      logic: 'AND',
      label: 'Rel. to Com. List',
      urlOrData: [],
      tooltip: 'Relation to an anime on an AWC community list'
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
    popularity: {
      type: 'range',
      label: 'Popularity',
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
    primaryOccupation: {
      type: 'tagify',
      logic: 'AND',
      label: 'Primary Occupation',
      urlOrData: [],
    },
    homeTownLike: {
      type: 'text',
      logic: 'AND',
      label: 'Hometown',
      regex: true,
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
    id: Tagify | undefined,
    titleLike: HTMLInputElement | undefined,
    notesLike: HTMLInputElement | undefined,
    descriptionLike: HTMLInputElement | undefined,
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
    relationToAWCCommunityList: Tagify | undefined,
    totalRuntime: HTMLInputElement,
    episodes: HTMLInputElement,
    volumes: HTMLInputElement,
    mcCount: HTMLInputElement,
    meanScore: HTMLInputElement,
    avgScore: HTMLInputElement,
    popularity: HTMLInputElement,
    showAdult: HTMLInputElement,
    muPublisher: Tagify | undefined,
    muPublication: Tagify | undefined,
    onlyScanlated: HTMLInputElement | undefined,
    nameLike: HTMLInputElement | undefined,
    bloodType: Tagify | undefined,
    gender: Tagify | undefined,
    primaryOccupation: Tagify | undefined,
    homeTownLike: HTMLInputElement | undefined,
    birthdayFrom: HTMLInputElement | undefined,
    birthdayUntil: HTMLInputElement | undefined,
    deathdayFrom: HTMLInputElement | undefined,
    deathdayUntil: HTMLInputElement | undefined,
  } = {}

  // Object to hold whitelists for Tagify filters
  private filterWhitelists = {
    format: [],
    genre: [],
    country: [],
    externalLink: [],
    season: [],
    year: [],
    source: [],
    airStatus: [],
    awcCommunityList: [],
    relationToAWCCommunityList: [],
    bloodType: [],
    gender: [],
    primaryOccupation: []
  }

  // Object to hold value ranges for Range filters
  private filterRanges = {
    tagPercentage: [0, 100],
    totalRuntime: [],
    episodes: [],
    volumes: [],
    mcCount: [],
    meanScore: [0, 100],
    avgScore: [0, 100],
    popularity: []
  }

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
  private readonly insertFilters = async (filterSet: string) => {
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
          // We manually update the values because .reset() defaults to the ones set on creation
          f[1].noUiSlider.set([
            f[1].noUiSlider.options.range.min,
            f[1].noUiSlider.options.range.max
          ])

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
        this.AniTools.alert(json.error)
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

    // Check if the last selected values were stored. if yes, load them them
    let filterValues = localStorage.getItem('filters-' + mediaTypeSelect.value.toLowerCase())
    if (filterValues !== null) {
      this.curFilterValues = JSON.parse(filterValues)
      // Move tagPercentage to the right place
      if (Object.hasOwn(this.curFilterValues.and, 'tag')) {
        this.curFilterValues.and.tagPercentageMin = this.curFilterValues.and.tag.tagPercentageMin
        this.curFilterValues.and.tagPercentageMax = this.curFilterValues.and.tag.tagPercentageMax
        delete this.curFilterValues.and.tag.tagPercentageMin
        delete this.curFilterValues.and.tag.tagPercentageMax
      }
    }

    await Promise.all(this.filterMap[filterSet].map(async (filterName: string) => {
      const filterDef = this.filterDefs[filterName]
      switch (filterDef.type) {
        case 'text':
          this.addText(filterName, filterDef)
          break;
        case 'tagify':
          await this.addTagify(filterName, filterDef)
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
          // Use previously selected values if present
          if(this.curFilterValues && this.curFilterValues.and.userList) {
            const v = Object.entries(this.curFilterValues.and.userList)[0]
            field.dataset.logic = v[0].toUpperCase()
            field.value = lists.filter(l => v[1].includes(l.value)).map(v => v.label).join(', ')
          } else {
            field.dataset.logic = filterDef.logic
            field.value = lists[0].label
          }
          field.addEventListener('change', this.filterChangeCallback)
          const logicSwitch: HTMLButtonElement = this.andOrSwitch.cloneNode(true)
          logicSwitch.dataset.filter = 'userList'
          logicSwitch.addEventListener('click', this.logicSwitchCallback);
          this.setLogicSwitchMode(logicSwitch, field.dataset.logic)
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
    }))

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

      const defaultValMap = (v) => { return {value: v.toString(), text: v.toString()}}

      const filterValues = await handleResponse(response)
      if (Object.hasOwn(filterValues, 'format')) {
        this.filterWhitelists.format = filterValues.format.map(defaultValMap)
      }
      if (Object.hasOwn(filterValues, 'genres')) {
        this.filterWhitelists.genre = filterValues.genres.map(defaultValMap)
      }
      if (Object.hasOwn(filterValues, 'country_of_origin')) {
        this.filterWhitelists.country = filterValues.country_of_origin.map(defaultValMap)
      }
      if (Object.hasOwn(filterValues, 'external_links')) {
        this.filterWhitelists.externalLink = filterValues.external_links.map(defaultValMap)
      }
      if (Object.hasOwn(filterValues, 'season')) {
        this.filterWhitelists.season = filterValues.season.map(defaultValMap)
      }
      if (Object.hasOwn(filterValues, 'season_year')) {
        this.yearCache = filterValues.season_year.map(defaultValMap)
        this.filterWhitelists.year = this.yearCache
      }
      if (Object.hasOwn(filterValues, 'source')) {
        this.filterWhitelists.source = filterValues.source.map(defaultValMap)
      }
      if (Object.hasOwn(filterValues, 'status')) {
        this.filterWhitelists.airStatus = filterValues.status.map(defaultValMap)
      }
      if (Object.hasOwn(filterValues, 'awc_community_lists')) {
        this.filterWhitelists.awcCommunityList = filterValues.awc_community_lists.map(defaultValMap)
      }
      if (Object.hasOwn(filterValues, 'awc_community_lists')) {
        this.filterWhitelists.relationToAWCCommunityList = filterValues.awc_community_lists.map(defaultValMap)
      }
      if (Object.hasOwn(filterValues, 'blood_type')) {
        this.filterWhitelists.bloodType = filterValues.blood_type.map(defaultValMap)
      }
      if (Object.hasOwn(filterValues, 'gender')) {
        this.filterWhitelists.gender = filterValues.gender.map(defaultValMap)
      }
      if (Object.hasOwn(filterValues, 'primary_occupations')) {
        this.filterWhitelists.primaryOccupation = filterValues.primary_occupations.map(defaultValMap)
      }
      if (Object.hasOwn(filterValues, 'tags')) {
        this.tagCache = filterValues.tags
      }
      if (Object.hasOwn(filterValues, 'total_runtime')) {
        this.filterRanges.totalRuntime = filterValues.total_runtime
      }
      if (Object.hasOwn(filterValues, 'episodes')) {
        this.filterRanges.episodes = filterValues.episodes
      }
      if (Object.hasOwn(filterValues, 'volumes')) {
        this.filterRanges.volumes = filterValues.volumes
      }
      if (Object.hasOwn(filterValues, 'mcCount')) {
        this.filterRanges.mcCount = filterValues.mcCount
      }
      if (Object.hasOwn(filterValues, 'popularity')) {
        this.filterRanges.popularity = [0, filterValues.popularity]
      }

      await this.insertFilters(filterSet)
      
      if (this.filters.tag !== undefined) {
        this.updateTagFilter()
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
    // Store selected values so we can initialize them on page reloads
    localStorage.setItem('filters-' + mediaTypeSelect.value.toLowerCase(), JSON.stringify(newValues))
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
    this.setLogicSwitchMode(logicSwitch, newLogic)
    this.filterChangeCallback()
  }

  private readonly setLogicSwitchMode = (e: HTMLButtonElement, newMode: string) => {
    newMode = newMode.toUpperCase()
    e.innerText = newMode
    e.title = newMode === 'AND' ? 'All values must match' : 'Any values may match'
  }

  private readonly addText = (col: string, filterDef: FilterDefinition) => {
    const container = this.filterTemplate.cloneNode(true)
    this.filterContainer.insertAdjacentElement('beforeend', container)
    const input = document.createElement('input')
    input.classList.add('column-filter', 'form-control')
    input.dataset.column = col
    input.placeholder = filterDef.label
    if (this.curFilterValues && this.curFilterValues.and[col]) {
      if (Object.hasOwn(filterDef, 'regex') && filterDef.regex === true) {
        input.value = this.curFilterValues.and[col].value
      } else {
        input.value = this.curFilterValues.and[col]
      }
    }

    if (Object.hasOwn(filterDef, 'mask') && filterDef.mask !== null) {
      Inputmask({ regex: filterDef.mask }).mask(input)
    }

    // Add a button to switch to regex mode if the filter supports it
    if (Object.hasOwn(filterDef, 'regex') && filterDef.regex === true) {
      const regexSwitch: HTMLButtonElement = this.regexSwitch.cloneNode(true)
      regexSwitch.dataset.filter = col
      regexSwitch.addEventListener('click', this.regexSwitchCallback)
      if (this.curFilterValues && this.curFilterValues.and[col] && this.curFilterValues.and[col].regex === true) {
        input.dataset.regex = 'regex'
        regexSwitch.classList.add('btn-primary')
      }

      container.insertAdjacentElement('afterbegin', regexSwitch)
    }

    this.filters[col] = input

    container.insertAdjacentElement('beforeend', input)

    if (Object.hasOwn(filterDef, 'tooltip') && filterDef.tooltip.length > 0) {
      const info = this.tooltipElement.cloneNode(true)
      info.dataset.title = filterDef.tooltip
      container.insertAdjacentElement('beforeend', info)
    }

    input.addEventListener('keyup', this.filterChangeCallback)
  }

  // Function to add a Tagify type filter
  private readonly addTagify = async (col: string, filterDef: FilterDefinition) => {
    const container = this.filterTemplate.cloneNode(true)
    this.filterContainer.insertAdjacentElement('beforeend', container)
    const field = document.createElement('input')
    field.setAttribute('placeholder', filterDef.label)
    field.classList.add('column-filter', 'form-control')
    if(this.curFilterValues && this.curFilterValues.and[col]) {
      let foundLogic = 'and'
      let values = [];
      await Promise.all(Object.entries(this.curFilterValues.and[col]).map(async (v) => {
        // Filter values can only contain either 'and' or 'or' and optionally 'not'
        // So we set the logic to the not-'not' we find
        if (v[0] !== 'not') {
          foundLogic = v[0].toUpperCase()
        }
        // Check values against whitelist
        if (Object.hasOwn(this.filterWhitelists, col)) {
          if (col === 'year') {
            // Manually validate and add year ranges is present
            v[1].filter(val => val.toString().indexOf('-') > -1).map((val) => {
              const split = val.split('-').map(s => parseInt(s))
              if (split[0] < split[1]) {
                values.push(val)
              }
            })
          }
          this.filterWhitelists[col].filter(l => v[1].includes(l.value)).forEach((val) => {
            val.exclude = v[0] === 'not' ? true : false
            values.push(val)
          })
        } else {
          await Promise.all(v[1].map(async (val) => {
            let t: TagifyValue = {
              value: val
            }
            // Fetch the associated label from the backend if needed
            if (typeof filterDef.urlOrData === 'string' && filterDef.urlOrData !== '*') {
              const result = await this.AniTools.fetch(filterDef.urlOrData + '?q=' + val)
              const data = await result.json()
              // In case the backend no longer finds the value skip it
              if (data.length === 0) {
                return
              }
              t = data[0]
            }
            t.exclude = v[0] === 'not' ? true : false
            values.push(t)
          }))
        }
      }))
      field.value = JSON.stringify(values)
      field.dataset.logic = foundLogic
    } else {
      field.dataset.logic = filterDef.logic
    }

    field.addEventListener('change', this.filterChangeCallback)
    container.insertAdjacentElement('beforeend', field)
    // This might be confusing but we only need the switches for the filters that start with AND
    // Because the filters that start as OR are filtering fields that can only have one value
    if (filterDef.logic === 'AND') {
      const logicSwitch: HTMLButtonElement = this.andOrSwitch.cloneNode(true)
      logicSwitch.dataset.filter = col
      this.setLogicSwitchMode(logicSwitch, field.dataset.logic)
      logicSwitch.addEventListener('click', this.logicSwitchCallback);
      container.insertAdjacentElement('afterbegin', logicSwitch)
    }

    if (Object.hasOwn(filterDef, 'tooltip') && filterDef.tooltip.length > 0) {
      const info = this.tooltipElement.cloneNode(true)
      info.dataset.title = filterDef.tooltip
      container.insertAdjacentElement('beforeend', info)
    }

    let whitelist: any[] = []
    if (col === 'tag') {
      whitelist = this.getTagFilterWhitelist()
    } else if (col === 'year') {
      whitelist = this.filterWhitelists[col]
      if (field.value.length> 0) {
        JSON.parse(field.value).filter(v => v.value.indexOf('-') > -1).forEach(v => {
          whitelist.push(v)
        });
      }
    } else if (Object.hasOwn(this.filterWhitelists, col)) {
      whitelist = this.filterWhitelists[col]
    } else if (field.value.length> 0 && typeof filterDef.urlOrData === 'string' && filterDef.urlOrData !== '*') {
      whitelist = JSON.parse(field.value).map((v) => {
        delete v['exclude']
        return v
      })
    }

    const options = {
      whitelist: whitelist,
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
      // Add the exclude property to tags if they don't have them yet
      transformTag: (tagData) => {
        if (! Object.hasOwn(tagData, 'exclude')) {
          tagData.exclude = false
        }
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
    if (filterDef.urlOrData !== '*') {
      options['enforceWhitelist'] = true
    }

    // We received an URL for fetching tags remotely
    if (typeof filterDef.urlOrData === 'string' && filterDef.urlOrData !== '*') {
      // Trigger the InputHandler when somebody pastes into the field
      options.hooks = {
        beforePaste: (_e, data) => {
          // It wants a promise? It get's a promise
          return new Promise(function (resolve) {
            tagifyInputHandler(data.tagify, data.pastedText)
            resolve()
          })
        }
      }

      let controller: AbortController
      const tagifyInputHandler = (tagify: Tagify, value: string) => {
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

      options.callbacks = {
        input: (e) => {
          tagifyInputHandler(e.detail.tagify, e.detail.tagify.state.inputText)
        }
      }
    } else if (col === 'year') {
      const tagifyInputHandler = (value: string) => {
        if (value.indexOf('-') === -1) {
          this.filters.year.whitelist = this.yearCache
          this.filters.year.dropdown.show(value)
          return
        }
        const split = value.split('-').map(v => parseInt(v))
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

      options.callbacks = {
        input: (e) => {
          tagifyInputHandler(e.detail.tagify.state.inputText)
        }
      }
    }

    const tagify: Tagify = new Tagify(field, options)
    // Make the "Remove all" button remove all selected values
    tagify.DOM.scope.querySelector('.clear-filter').addEventListener('click', tagify.removeAllTags.bind(tagify))

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
    this.filterContainer.insertAdjacentElement('beforeend', cswitch)
    cswitch.classList.add('custom-switch')
    const labelElement: HTMLLabelElement = document.createElement('label')
    labelElement.htmlFor = col
    labelElement.innerHTML = filterDef.label
    const field = document.createElement('input')
    field.type = 'checkbox'
    field.id = col
    field.classList.add('column-filter')
    if (this.curFilterValues && this.curFilterValues.and[col]) {
      field.checked = this.curFilterValues.and[col] === true
    }
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

    const firstVal = 0
    const lastVal = this.filterRanges[col][this.filterRanges[col].length - 1]

    let startMin = firstVal
    let startMax = lastVal
    if (this.curFilterValues && this.curFilterValues.and[col + 'Min']) {
      startMin = this.curFilterValues.and[col + 'Min']
    }
    if (this.curFilterValues && this.curFilterValues.and[col + 'Max']) {
      startMax = this.curFilterValues.and[col + 'Max']
    }

    this.filterContainer.insertAdjacentElement('beforeend', formInline)

    let options = {
      start: [startMin, startMax],
      connect: true,
      format: wNumb({ decimals: 0 }),
      range: {
        min: 0,
        max: lastVal
      }
    }

    // Calculate steps
    for (let i = 0; i < this.filterRanges[col].length - 1; ++i) {
      options.range[
        (
          (this.filterRanges[col][i] / this.filterRanges[col][this.filterRanges[col].length - 1]) * 100
        ).toString() + '%'
      ] = this.filterRanges[col][i]
    }

    this.filters[col] = container
    noUiSlider.create(container, options)
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

  private readonly getTagFilterWhitelist = (): any[] => {
    let whitelist: any[] = []
    if (!this.tagCache) {
      return whitelist
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
    whitelist = values

    if (this.ATSettings.shouldGroupTags()) {
    } else {
      // Sort values alphabetically
      values.sort((x,y) => { if (x.value < y.value) { return -1 } if (x.value > y.value) { return 1 } return 0 } );
      whitelist = values
    }

    return whitelist
  }

  private readonly updateTagFilter = (): void => {
    if (!this.tagCache) {
      return
    }

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
      // Reset Dropdown rendering function to default
      this.filters.tag.dropdown.createListHTML = this.filters.tag.dropdown.createListHTMLoriginal
    }

    this.filters.tag.whitelist = this.getTagFilterWhitelist()
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
