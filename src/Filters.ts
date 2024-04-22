import Tagify from '@yaireo/tagify'
import noUiSlider from 'nouislider'
import wNumb from 'wnumb'
import Inputmask from 'inputmask'
import Settings from './Settings'
import { handleError, handleResponse } from './commonLib'

class Filters extends EventTarget {
  private readonly filterContainer: HTMLDivElement = document!.querySelector('#filters')!
  private readonly mediaTypeSelect: HTMLSelectElement = document!.querySelector('.media-type')!
  private readonly userNameField: HTMLInputElement = document!.querySelector('#al-user')!
  private readonly ATSettings: Settings
  private curFilterValues: any
  private readonly andOrSwitch: HTMLButtonElement = document.createElement('button')

  private readonly filterMap = {
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
      'year',
      'airingStart',
      'airingFinish',
      'externalLink',
      'staff',
      'episodes',
      'volumes',
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
      'season',
      'year',
      'airingStart',
      'airingFinish',
      'externalLink',
      'voiceActor',
      'staff',
      'studio',
      'producer',
      'awcCommunityList',
      'episodes',
      'totalRuntime',
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
      mask: '^(\\d{4}|\\*)-([0]\\d|1[0-2]|\\*)-([0-2]\\d|3[01]|\\*)$',
      urlOrData: [],
    },
    airingFinish: {
      type: 'text',
      logic: 'AND',
      label: 'Finished Airing',
      mask: '^(\\d{4}|\\*)-([0]\\d|1[0-2]|\\*)-([0-2]\\d|3[01]|\\*)$',
      urlOrData: [],
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
    showAdult: {
      type: 'checkbox',
      label: 'Show Adult entries',
    },
    muPublisher: {
      type: 'tagify',
      logic: 'AND',
      label: 'Publisher',
      urlOrData: '/searchForFilter/muPublisher',
      experimental: true,
    },
    muPublication: {
      type: 'tagify',
      logic: 'AND',
      label: 'Publication',
      urlOrData: '/searchForFilter/muPublication',
      experimental: true,
    },
    onlyScanlated: {
      type: 'checkbox',
      label: 'Only fully scanlated',
      experimental: true,
    },
    nameLike: {
      type: 'text',
      logic: 'OR',
      label: 'Name',
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
      mask: '^(\\d{4}|\\*)-([0]\\d|1[0-2]|\\*)-([0-2]\\d|3[01]|\\*)$',
      urlOrData: [],
    },
    birthdayUntil: {
      type: 'text',
      logic: 'OR',
      label: 'Birthday until',
      mask: '^(\\d{4}|\\*)-([0]\\d|1[0-2]|\\*)-([0-2]\\d|3[01]|\\*)$',
      urlOrData: [],
    },
    deathdayFrom: {
      type: 'text',
      logic: 'OR',
      label: 'Deathday from',
      mask: '^(\\d{4}|\\*)-([0]\\d|1[0-2]|\\*)-([0-2]\\d|3[01]|\\*)$',
      urlOrData: [],
    },
    deathdayUntil: {
      type: 'text',
      logic: 'OR',
      label: 'Deathday until',
      mask: '^(\\d{4}|\\*)-([0]\\d|1[0-2]|\\*)-([0-2]\\d|3[01]|\\*)$',
      urlOrData: [],
    },
  }

  // Object to hold all added filters
  private filters: {
    userList: Tagify | undefined,
    titleLike: HTMLInputElement | undefined,
    format: Tagify | undefined,
    source: Tagify | undefined,
    country: Tagify | undefined,
    airStatus: Tagify | undefined,
    airingStart: HTMLInputElement | undefined,
    airingFinish: HTMLInputElement | undefined,
    genre: Tagify | undefined | undefined,
    tag: Tagify | undefined,
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

  // We cache tags on initialization so the user can switch between grouped and non-grouped mode on the filter
  private tagCache: Object

  constructor (settings: Settings) {
    super()
    settings.addEventListener('tag-grouping-updated', this.updateTagFilter)
    this.ATSettings = settings
    this.andOrSwitch.classList.add('btn', 'btn-primary', 'and-or-switch')
    this.andOrSwitch.innerText = 'AND'
    this.andOrSwitch.title = 'All values must match'
  }

  // Function to setup all filters
  public readonly insertFilters = async (filterSet: string) => {
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
    if (this.userNameField.value.length > 0 && this.filterMap[filterSet].includes('userList')) {
      const response = await fetch(import.meta.env.VITE_API_URL + '/userLists?user_name=' + this.userNameField.value + '&media_type=' + this.mediaTypeSelect.value)
      const data: UserList[] = await handleResponse(response);

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
          this.addText(filterName, filterDef.label, filterDef.mask ?? null)
          break;
        case 'tagify':
          this.addTagify(filterName, filterDef.label, filterDef.urlOrData, filterDef.logic, filterDef.experimental ?? false)
          break;
        case 'checkbox':
          this.addCheckbox(filterName, filterDef.label, filterDef.experimental ?? false)
          break;
        case 'range':
          // Switch labels for the Episodes filter depending on media type
          if (filterSet === 'MANGA' && filterDef.label === 'Episodes') {
            filterDef.label = 'Chapters'
          }
          if (filterSet === 'ANIME' && filterDef.label === 'Chapters') {
            filterDef.label = 'Episodes'
          }

          this.addRange(filterName, filterDef.label, filterDef.experimental ?? false)
          break;
        case 'userList':
          if (this.userNameField.value.length === 0) {
            return
          }

          const container = document.createElement('div')
          const field = document.createElement('input')
          field.setAttribute('placeholder', filterDef.label)
          field.classList.add('column-filter', 'form-control')
          field.dataset.logic = filterDef.logic
          field.value = lists[0].label
          field.addEventListener('change', this.filterChangeCallback)
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
                  <div class="ch-label">${item.label}</div>
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

  // Function that updates the available options in the filters using the data the API returned
  public readonly updateFilters = async (filterSet: string): Promise<void> => {
    await this.insertFilters(filterSet)

    const response = await fetch(import.meta.env.VITE_API_URL + '/filterValues?media_type=' + this.mediaTypeSelect.value)
    const filterValues = await response.json()
    this.tagCache = filterValues.tags
    if (this.filters.format !== undefined) {
    this.filters.format.whitelist = filterValues.format
    }
    if (this.filters.genre !== undefined) {
    this.filters.genre.whitelist = filterValues.genres
    }
    if (this.filters.country !== undefined) {
    this.filters.country.whitelist = filterValues.country_of_origin
    }
    if (this.filters.externalLink !== undefined) {
    this.filters.externalLink.whitelist = filterValues.external_links
    }
    if (this.filters.season !== undefined) {
      this.filters.season.whitelist = filterValues.season
    }
    if (this.filters.year !== undefined) {
    this.filters.year.whitelist = filterValues.season_year.map(v => v.toString())
    }
    if (this.filters.source !== undefined) {
    this.filters.source.whitelist = filterValues.source
    }
    if (this.filters.airStatus !== undefined) {
    this.filters.airStatus.whitelist = filterValues.status
    }
    if (this.filters.awcCommunityList !== undefined) {
      this.filters.awcCommunityList.whitelist = filterValues.awc_community_lists
    }
    if (this.filters.tag !== undefined) {
    this.updateTagFilter()
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
    if (this.filters.bloodType !== undefined) {
      this.filters.bloodType.whitelist = filterValues.blood_type
    }
    if (this.filters.gender !== undefined) {
      this.filters.gender.whitelist = filterValues.gender
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

  private readonly addText = (col: string, label: string, mask: string | null = null) => {
    const input = document.createElement('input')
    input.classList.add('column-filter', 'form-control')
    input.dataset.column = col
    input.placeholder = label

    if (mask !== null) {
      Inputmask({ regex: mask }).mask(input)
    }

    this.filters[col] = input
    this.filterContainer.insertAdjacentElement('beforeend', input)
    input.addEventListener('keyup', this.filterChangeCallback)
  }

  // Function to add a Tagify type filter
  private readonly addTagify = (col: string, label: string, urlOrData: string[] | string, logic: string, experimental: boolean) => {
    const container = document.createElement('div')
    const field = document.createElement('input')
    field.setAttribute('placeholder', label)
    field.classList.add('column-filter', 'form-control')
    field.dataset.logic = logic
    field.addEventListener('change', this.filterChangeCallback)
    container.insertAdjacentElement('beforeend', field)
    if (logic === 'AND') {
      container.classList.add('d-flex')
      const logicSwitch: HTMLButtonElement = this.andOrSwitch.cloneNode(true)
      logicSwitch.addEventListener('click', (ev) => {
        const newLogic = field.dataset.logic === 'AND' ? 'OR' : 'AND'
        field.dataset.logic = newLogic
        logicSwitch.innerText = newLogic
        logicSwitch.title = newLogic === 'AND' ? 'All values must match' : 'Any values may match'
        this.filterChangeCallback()
      });
      container.insertAdjacentElement('afterbegin', logicSwitch)
    }
    this.filterContainer.insertAdjacentElement('beforeend', container)
    if (experimental === true) {
      container.style.display = 'flex'
      container.style.gap = '0.25em'
      const warning = document.querySelector('#mangaupdates-warning').content.firstElementChild.cloneNode(true)
      container.insertAdjacentElement('beforeend', warning)
    }

    const tagify: Tagify = new Tagify(field, {
      enforceWhitelist: true,
      whitelist: [],
      tagTextProp: 'text',
      pasteAsTags: false,
      editTags: false,
      dropdown: {
        maxItems: Infinity,
        enabled: typeof urlOrData === 'string' ? 1 : 0,
        searchKeys: ['value', 'text'],
        mapValueTo: 'text',
        highlightFirst: true,
        closeOnSelect: typeof urlOrData === 'string'
      },
      transformTag: (tagData) => {
        tagData.exclude = false
      }
    })

    // We received an URL for fetching tags remotely
    if (typeof urlOrData === 'string') {
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
        fetch(import.meta.env.VITE_API_URL + urlOrData + '?q=' + value, { signal: controller.signal })
          .then(async response => await response.json())
          .then((newWhitelist) => {
            tagify.whitelist = newWhitelist // update whitelist Array in-place
            tagify.loading(false).dropdown.show(value) // render the suggestions dropdown
          })
          .catch(handleError)
      }

      tagify.on('input', (e) => {
        tagifyInputHandler(e.detail.tagify.state.inputText)
      })    
    }

      tagify.on('click', (e) => {
      if (this.filterDefs[col].logic === 'AND') {
        const {tag:tagElm, data:tagData} = e.detail;
        tagData.exclude = tagData.exclude !== true
        tagify.replaceTag(tagElm, tagData)
      }
      })

    this.filters[col] = tagify
  }

  private readonly addCheckbox = (col: string, label: string, experimental: boolean): void => {
    const cswitch = document.createElement('div')
    cswitch.classList.add('custom-switch')
    const labelElement: HTMLLabelElement = document.createElement('label')
    labelElement.htmlFor = col
    labelElement.innerHTML = label
    const field = document.createElement('input')
    field.type = 'checkbox'
    field.id = col
    field.classList.add('column-filter')
    field.addEventListener('click', this.filterChangeCallback)
    cswitch.insertAdjacentElement('beforeend', field)
    cswitch.insertAdjacentElement('beforeend', labelElement)

    if (experimental === true) {
      cswitch.style.display = 'flex'
      cswitch.style.gap = '0.25em'
      const warning = document.querySelector('#mangaupdates-warning').content.firstElementChild.cloneNode(true)
      cswitch.insertAdjacentElement('beforeend', warning)
    }

    this.filters[col] = field

    this.filterContainer.insertAdjacentElement('beforeend', cswitch)
  }

  private readonly addRange = (col: string, label: string, experimental: boolean): void => {
    const formInline = document.createElement('div')
    formInline.classList.add('form-inline')

    const labelElement = document.createElement('span')
    labelElement.classList.add('column-filter-label')
    labelElement.innerHTML = label + ':'
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

    minField.addEventListener('keyup', () => {
      container.noUiSlider.set([minField.value, null])
      this.filterChangeCallback()
    })

    maxField.addEventListener('keyup', () => {
      container.noUiSlider.set([null, maxField.value])
      this.filterChangeCallback()
    })
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
          value: tag
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
        params[f[0] + 'Min'] = f[1].noUiSlider.get(true)[0]
        params[f[0] + 'Max'] = f[1].noUiSlider.get(true)[1]

        return
      }
      if (f[1]?.tagName === 'INPUT' && f[1].type === 'text' && f[1].value.length > 0) {
        // Validate value against regex pattern if present
        if (! Object.hasOwn(this.filterDefs[f[0]], 'mask') || f[1].value.match(this.filterDefs[f[0]].mask) !== null) {
        params[f[0]] = f[1].value
        }
      }
    })

    return { and: params }
  }
}

export default Filters
