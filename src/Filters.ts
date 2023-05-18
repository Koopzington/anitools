import Choices from 'choices.js'
import Tagify from '@yaireo/tagify'
import noUiSlider from 'nouislider'
import wNumb from 'wnumb'
import Settings from './Settings'
import { handleError } from './commonLib'

class Filters extends EventTarget {
  private readonly filterContainer: HTMLDivElement = document?.querySelector('#filters')
  private readonly mediaTypeSelect: HTMLSelectElement = document?.querySelector('.media-type')
  private readonly ATSettings: Settings

  // Object to hold all added filters
  private filters: Object = {}

  // We cache tags on initialization so the user can switch between grouped and non-grouped mode on the filter
  private tagCache: Object

  constructor (settings: Settings) {
    super()
    settings.addEventListener('tag-grouping-updated', this.updateTagFilter)
    this.ATSettings = settings
  }

  // Function to setup all filters
  public insertFilters = () => {
    this.filterContainer.innerHTML = ''

    const clearBtn = document.createElement('button')
    clearBtn.classList.add('btn', 'btn-primary')
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

        if (f[1] instanceof Choices) {
          f[1].removeActiveItems()

          return
        }

        // Handle Range instances
        if (Object.hasOwn(f[1], 'get')) {
          f[1].reset()

          return
        }

        if (f[1] instanceof HTMLInputElement && f[1].type === 'checkbox') {
          f[1].checked = false

          return
        }

        if (f[1] instanceof HTMLInputElement) {
          f[1].value = ''
        }
      })
    })

    this.addText('title_like', 'Title')
    this.addTagify('format', 'Format', [], 'OR')
    this.addTagify('source', 'Source', [], 'OR')
    this.addTagify('country', 'Country', [], 'OR')
    this.addTagify('airStatus', 'Airing Status', [], 'OR')
    this.addTagify('genres', 'Genres', [], 'AND')
    this.addTagify('tags', 'Tags', [], 'AND')
    // Backup the dropdown rendering function to switch between the custom one for tag groups and the normal one
    this.filters['tags'].dropdown.createListHTMLoriginal = this.filters['tags'].dropdown.createListHTML
    this.addTagify('season', 'Season', [], 'OR')
    this.addTagify('year', 'Year', [], 'OR')
    this.addTagify('externalLinks', 'Available On', [], 'AND')
    this.addTagify('voiceActor', 'Voice Actor (ID)', '/staff', 'AND')
    this.addTagify('staff', 'Staff (ID)', '/staff', 'AND')
    this.addTagify('studio', 'Studio', '/studio', 'AND')
    this.addTagify('producer', 'Producer', '/studio', 'AND')
    this.addRange('episodes', 'Episodes')
    this.addCheckbox('showAdult', 'Show Adult entries')
  }

  private readonly filterChangeCallback = () => {
    this.dispatchEvent(new Event('filter-changed'))
  }

  private addText (col: string, label: string) {
    const input = document.createElement('input')
    input.classList.add('columnFilter', 'form-control')
    input.dataset.column = col
    input.placeholder = label
    this.filters[col] = input
    this.filterContainer.insertAdjacentElement('beforeend', input)
    input.addEventListener('keyup', this.filterChangeCallback)
  }

  // Function to add a Tagify type filter
  private readonly addTagify = (col: string, label: string, urlOrData: string[] | string, logic: string) => {
    const container = document.createElement('div')
    const field = document.createElement('input')
    field.setAttribute('placeholder', label)
    field.classList.add('columnFilter', 'form-control')
    field.dataset.logic = logic
    field.addEventListener('change', this.filterChangeCallback)
    container.insertAdjacentElement('beforeend', field)
    this.filterContainer.insertAdjacentElement('beforeend', container)

    const tagify: Tagify = new Tagify(field, {
      enforceWhitelist: true,
      whitelist: [],
      tagTextProp: 'text',
      pasteAsTags: false,
      editTags: false,
      dropdown: {
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

    // TODO: Change when making filter logic configurable by user
    if (logic === 'AND') {
      tagify.on('click', (e) => {
        const {tag:tagElm, data:tagData} = e.detail;
        tagData.exclude = tagData.exclude !== true
        tagify.replaceTag(tagElm, tagData)
      })
    }

    this.filters[col] = tagify
  }

  private readonly addCheckbox = (col: string, label: string): void => {
    const cswitch = document.createElement('div')
    cswitch.classList.add('custom-switch')
    const labelElement: HTMLLabelElement = document.createElement('label')
    labelElement.htmlFor = col
    labelElement.innerHTML = label
    const field = document.createElement('input')
    field.type = 'checkbox'
    field.id = col
    field.classList.add('columnFilter')
    field.addEventListener('click', this.filterChangeCallback)
    cswitch.insertAdjacentElement('beforeend', field)
    cswitch.insertAdjacentElement('beforeend', labelElement)

    this.filters[col] = field

    this.filterContainer.insertAdjacentElement('beforeend', cswitch)
  }

  private readonly addRange = (col: string, label: string): void => {
    const formInline = document.createElement('div')
    formInline.classList.add('form-inline')

    const labelElement = document.createElement('span')
    labelElement.classList.add('columnFilter-label')
    labelElement.innerHTML = label + ':'
    this.filterContainer.insertAdjacentElement('beforeend', labelElement)

    const minField: HTMLInputElement = document.createElement('input')
    minField.classList.add('columnFilter', 'form-control')
    formInline.insertAdjacentElement('beforeend', minField)

    const container = document.createElement('div')
    container.classList.add('columnFilter', 'form-control', 'range-filter')
    container.dataset.column = 'episodes'
    this.filterContainer.insertAdjacentElement('beforeend', container)

    const maxField: HTMLInputElement = document.createElement('input')
    maxField.classList.add('columnFilter', 'form-control')
    formInline.insertAdjacentElement('beforeend', maxField)

    this.filterContainer.insertAdjacentElement('beforeend', formInline)

    this.filters[col] = noUiSlider.create(container, {
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
    this.filters['tags'].whitelist = values
    this.filters['tags'].settings.dropdown.maxItems = values.length

    if (this.ATSettings.shouldGroupTags()) {
      this.filters['tags'].dropdown.createListHTML = (suggestionList) => {
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
      
              var value = this.filters['tags'].dropdown.getMappedValue.call(this.filters['tags'], suggestion)
      
              suggestion.value = value
      
              return this.filters['tags'].settings.templates.dropdownItem.apply(this.filters['tags'], [suggestion]);
          }).join("")

          // assign the user to a group
          return Object.entries(categories).map(([category, categories]) => {
              return `<div class="tagify-dropdown-item-group" data-title="Team ${category}:">${getUsersSuggestionsHTML(categories)}</div>`
          }).join("")
      }
    } else {
      // Sort values alphabetically
      values.sort((x,y) => { if (x.value < y.value) { return -1 } if (x.value > y.value) { return 1 } return 0 } );
      this.filters['tags'].whitelist = values
      // Reset Dropdown rendering function to default
      this.filters['tags'].dropdown.createListHTML = this.filters['tags'].dropdown.createListHTMLoriginal
    }
  }

  // Function that updates the available options in the filters using the data the API returned
  public updateFilters = async (userListChoice: Choices | undefined = undefined): Promise<void> => {
    const response = await fetch(import.meta.env.VITE_API_URL + '/filterValues?media_type=' + this.mediaTypeSelect.value)
    const filterValues = await response.json()
    this.tagCache = filterValues.tags
    this.filters['format'].whitelist = filterValues.format
    this.filters['genres'].whitelist = filterValues.genres
    this.filters['genres'].settings.dropdown.maxItems = filterValues.genres.length
    this.filters['country'].whitelist = filterValues.country_of_origin
    this.filters['country'].settings.dropdown.maxItems = filterValues.country_of_origin.length
    this.filters['externalLinks'].whitelist = filterValues.external_links
    this.filters['externalLinks'].settings.dropdown.maxItems = filterValues.external_links.length
    this.filters['season'].whitelist = filterValues.season
    this.filters['season'].settings.dropdown.maxItems = filterValues.season.length
    this.filters['year'].whitelist = filterValues.season_year.map(v => v.toString())
    this.filters['year'].settings.dropdown.maxItems = filterValues.season_year.length
    this.filters['source'].whitelist = filterValues.source
    this.filters['source'].settings.dropdown.maxItems = filterValues.source.length
    this.filters['airStatus'].whitelist = filterValues.status
    this.filters['airStatus'].settings.dropdown.maxItems = filterValues.status.length
    this.updateTagFilter()

    if (userListChoice !== undefined) {
      this.filters['userList'] = userListChoice
    } else {
      // Remove the userList filter if it exists but wasn't passed with the method call
      if (Object.hasOwn(this.filters, 'userList')) {
        delete this.filters['userList']
      }
    }
    
    // Prepare options object to update episode filter
    const e = filterValues.episodes
    const options = {
      start: [this.filters['episodes'].get()[0], e[e.length - 1]],
      range: {
        min: 0,
        max: e[e.length - 1]
      }
    }

    // Calculate steps
    for (let i = 0; i < e.length - 1; ++i) {
      options.range[((e[i] / e[e.length - 1]) * 100).toString() + '%'] = e[i]
    }
    this.filters['episodes'].updateOptions(options, false)
  }

  public getFilters = (): any => this.filters

  // Function returning an object of params that can be used for requests to the AniTools Backend
  public getFilterParams = (): any => {
    const params = {
      mediaType: this.mediaTypeSelect.value
    }

    Object.entries(this.filters).forEach((f) => {
      // Handle Choices
      if (f[1] instanceof Choices) {
        const v: string[] = []
        // Choices.getValue() can return a string or string[] depending on single or multi value mode
        const choiceValue = f[1].getValue(true)
        if (choiceValue.length === 0) {
          return
        }

        if (choiceValue instanceof Array) {
          choiceValue.forEach((value) => {
            v.push(value)
          })
        }
        if (typeof choiceValue === 'string') {
          v.push(choiceValue)
        }
        const logic = f[1].passedElement.element.dataset.logic ?? 'AND'
        params[f[0]] = {}
        params[f[0]][logic.toLowerCase()] = v

        return
      }
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
        params[f[0]] = f[1].isChecked
      }
      // Handle Range instances
      if (Object.hasOwn(f[1], 'get')) {
        params[f[0] + 'Min'] = f[1].get(true)[0]
        params[f[0] + 'Max'] = f[1].get(true)[1]

        return
      }
      if (f[1]?.tagName === 'INPUT' && f[1].type === 'text' && f[1].value.length > 0) {
        params[f[0]] = f[1].value
      }
    })

    return { and: params }
  }
}

export default Filters
