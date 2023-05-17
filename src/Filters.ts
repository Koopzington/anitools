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
    this.addSel('format', 'Format', [], 'OR')
    this.addSel('source', 'Source', [], 'OR')
    this.addSel('country', 'Country', [], 'OR')
    this.addSel('airStatus', 'Airing Status', [], 'OR')
    this.addSel('genres', 'Genres', [], 'AND')
    this.addSel('tags', 'Tags', [], 'AND')
    this.addSel('season', 'Season', [], 'OR')
    this.addSel('year', 'Year', [], 'OR', false)
    this.addSel('externalLinks', 'Available On', [], 'AND')
    this.addTagify('staff', 'Staff (ID)', '/staff')
    this.addTagify('studio', 'Studio', '/studio')
    this.addTagify('producer', 'Producer', '/studio')
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

  // Function to add a Choices type filter
  private readonly addSel = (col: string, label: string, values: string[] | Object, logic: string, shouldSort: boolean = true) => {
    const select = document.createElement('select')
    select.multiple = true
    select.classList.add('columnFilter', 'form-control')
    select.dataset.column = col
    select.dataset.logic = logic
    select.addEventListener('change', this.filterChangeCallback)
    if (Array.isArray(values)) {
      for (let i = 0; i < values.length; ++i) {
        const o = document.createElement('option')
        o.text = values[i]
        o.value = values[i]
        select.add(o)
      }
    } else {
      const optgroups = Object.keys(values)
      optgroups.forEach((g) => {
        const og = document.createElement('optgroup')
        og.label = g

        values[g].forEach((v) => {
          const o = document.createElement('option')
          o.text = v
          o.value = v
          og.insertAdjacentElement('beforeend', o)
        })
        select.add(og)
      })
    }
    this.filterContainer.insertAdjacentElement('beforeend', select)
    this.filters[col] = new Choices(select, {
      placeholderValue: label,
      removeItemButton: true,
      shouldSort,
      allowHTML: false
    })
  }

  // Function to add a Tagify type filter
  private readonly addTagify = (col: string, label: string, url: string) => {
    const container = document.createElement('div')
    const field = document.createElement('input')
    field.setAttribute('placeholder', label)
    field.classList.add('columnFilter', 'form-control')
    field.dataset.logic = 'AND'
    field.addEventListener('change', this.filterChangeCallback)
    container.insertAdjacentElement('beforeend', field)
    this.filterContainer.insertAdjacentElement('beforeend', container)

    const tagify: Tagify = new Tagify(field, {
      enforceWhitelist: true,
      whitelist: [],
      tagTextProp: 'text',
      pasteAsTags: false,
      dropdown: {
        enabled: 1,
        searchKeys: ['value', 'text'],
        mapValueTo: 'text',
        highlightFirst: true
      },
      hooks: {
        beforePaste: async function (_tagify, pastedText) {
          // It wants a promise? It get's a promise
          return await new Promise(function (resolve) {
            tagifyInputHandler(pastedText.pastedText)
            resolve()
          })
        }
      }
    })
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
      fetch(import.meta.env.VITE_API_URL + url + '?q=' + value, { signal: controller.signal })
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

  private readonly getValues = (data: string[]): any[] => {
    const v: any[] = []
    data.forEach((e) => v.push({ value: e, label: e }))

    return v
  }

  private readonly updateTagFilter = (): void => {
    if (!this.tagCache) {
      return
    }
    if (this.ATSettings.shouldGroupTags()) {
      const values: any[] = []
      Object.entries(this.tagCache).forEach((group) => {
        values.push({
          label: group[0],
          disabled: false,
          choices: this.getValues(group[1])
        })
      })
      this.filters['tags'].setChoices(values, 'value', 'label', true)
    } else {
      const values = []
      Object.entries(this.tagCache).forEach((group) => {
        group[1].forEach((t: string) => { values.push(t) })
      })
      values.sort(undefined)
      this.filters['tags'].setChoices(this.getValues(values), 'value', 'label', true)
    }
  }

  // Function that updates the available options in the filters using the data the API returned
  public updateFilters = async (userListChoice: Choices | undefined = undefined): Promise<void> => {
    const response = await fetch(import.meta.env.VITE_API_URL + '/filterValues?media_type=' + this.mediaTypeSelect.value)
    const filterValues = await response.json()
    this.tagCache = filterValues.tags
    this.filters['format'].setChoices(this.getValues(filterValues.format), 'value', 'label', true)
    this.filters['genres'].setChoices(this.getValues(filterValues.genres), 'value', 'label', true)
    this.filters['country'].setChoices(this.getValues(filterValues.country_of_origin), 'value', 'label', true)
    this.filters['externalLinks'].setChoices(this.getValues(filterValues.external_links), 'value', 'label', true)
    this.filters['season'].setChoices(this.getValues(filterValues.season), 'value', 'label', true)
    this.filters['year'].setChoices(this.getValues(filterValues.season_year), 'value', 'label', true)
    this.filters['source'].setChoices(this.getValues(filterValues.source), 'value', 'label', true)
    this.filters['airStatus'].setChoices(this.getValues(filterValues.status), 'value', 'label', true)
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
        f[1].value.forEach((p) => {
          v.push(p.value)
        })
        params[f[0]][logic.toLowerCase()] = v

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
