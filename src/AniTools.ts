import halfmoon from 'halfmoon/js/halfmoon-module'
import 'datatables.net'
import 'datatables.net-colreorder'
import 'nouislider'
import '@yaireo/tagify'
import 'wnumb'
import './commonLib'
import Columns from './Columns'
import Settings from './Settings'
import BetterList from './Tools/BetterList'
import Filters from './Filters'
import BetterBrowse from './Tools/BetterBrowse'

class AniTools {
  // Tools which can be loaded and unloaded
  private Tools = {}
  private activeModule: string
  private moduleSelect: HTMLSelectElement

  constructor () {
    // Check for stored username and replace default value if it exists
    const userName = localStorage.getItem('userName')
    if (userName !== null) {
      document.querySelector('#al-user').value = userName
    }

    this.moduleSelect = document.querySelector('#tool-dropdown')
    halfmoon.onDOMContentLoaded()
    document.querySelector('#toggle-sidebar-btn').addEventListener('click', () => { halfmoon.toggleSidebar() })
    document.querySelectorAll('.dark-mode-toggler').forEach((e) => e.addEventListener('click', () => { halfmoon.toggleDarkMode() }))

    // Basic stuff that needs to run on page load
    const settings = new Settings()
    const filters = new Filters(settings)
    const columns = new Columns();
    this.Tools["BetterList"] = new BetterList(settings, filters, columns)
    this.Tools["BetterBrowse"] = new BetterBrowse(filters, columns)
    
    settings.initSettings()
    columns.initToggles()
    this.handleInputs()
    this.initModuleSelect()
    this.route()
    this.enableShortcuts()
  }

  private initModuleSelect = () => {
    Object.keys(this.Tools).forEach((m) => {
      const o = document.createElement('option')
      o.value = m
      o.label = m
      this.moduleSelect.insertAdjacentElement('beforeend', o)
    })

    // Sync value change with other select and route
    this.moduleSelect.addEventListener('change', () => {
      this.route(this.moduleSelect.value)
    })
  }

  private getHashParams = () => {
    const hash = window.location.hash.substring(1)

    const result = hash.split('&').reduce(function (res, item) {
      const parts = item.split('=')
      res[parts[0]] = parts[1]
      return res
    }, {})

    return result
  }

  private getHashParam = (param) => {
    const params = this.getHashParams()
    return params[param] ?? false
  }

  private route = (target = null) => {
    if (target === null) {
      target = this.getHashParam('module')
      if (target === false) {
        target = this.moduleSelect.value
      } else {
        this.moduleSelect.value = target
      }
    }

    if (target && Object.hasOwn(this.Tools, target)) {
      if (this.activeModule) {
        this.Tools[this.activeModule].unload()
      }

      this.Tools[target].load()
      this.activeModule = target
    }
  }

  private enableShortcuts = () => {
    document.addEventListener('DOMContentLoaded', function () {
      // Handle keydown events (overridden)
      halfmoon.keydownHandler = function (event) {
        event = event || window.event
        // Shortcuts are triggered only if no input, textarea, select or slider has focus
        if (!(document.querySelector('input:focus') ||
              document.querySelector('textarea:focus') ||
              document.querySelector('select:focus') ||
              document.activeElement.classList.contains('noUi-handle') ||
              document.activeElement.hasAttribute('contenteditable'))
        ) {
          // Open Sidebar containing the filters
          if (event.key === 'r') {
            document.querySelector('#load').dispatchEvent(new Event('click'))
            event.preventDefault()
            // Open the settings menu
          } else if (event.key === 's') {
            halfmoon.toggleModal('settings-modal')
            event.preventDefault()
            // Pagination
          } else if (event.key === 'ArrowLeft') {
            const e = document.querySelector('.page-previous')
            if (e) {
              e.dispatchEvent(new Event('click'))
            }
            event.preventDefault()
          } else if (event.key === 'ArrowRight') {
            const e = document.querySelector('.page-next')
            if (e) {
              e.dispatchEvent(new Event('click'))
            }
            event.preventDefault()
          }
        }
      }
    })
  }

  // Function moving elements around depending on screen width
  private handleInputs = () => {
    if (window.innerWidth >= 768) {
      return
    }

    Object.values(document.querySelector('#navsidebar-nav').children).forEach((e) => {
      document.querySelector('#navsidebar-sidebar').insertAdjacentElement('beforeend', e)
    })
  }
}

const anitools = new AniTools()
