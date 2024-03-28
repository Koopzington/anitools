import halfmoon from 'halfmoon/js/halfmoon-module'
import 'datatables.net'
import 'datatables.net-colreorder'
import 'nouislider'
import '@yaireo/tagify'
import 'wnumb'
import { marked } from 'marked'
import './commonLib'
import Columns from './Columns'
import Settings from './Settings'
import BetterList from './Tools/BetterList'
import Filters from './Filters'

class AniTools {
  // Tools which can be loaded and unloaded
  private readonly Tools = {}
  private activeModule: string | undefined
  private toolSelect: HTMLSelectElement

  private readonly alertTemplate = `
  <div class="alert" role="alert">
    <button class="close" data-dismiss="alert" type="button" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
    <span class="message"></span>
  </div>`

  public readonly init = async (): Promise<void> => {
    // Check for stored username and replace default value if it exists
    const userName = localStorage.getItem('userName')
    if (userName !== null) {
      document.querySelector('#al-user')!.value = userName
    }

    this.toolSelect = document.querySelector('#tool-dropdown')!
    halfmoon.onDOMContentLoaded()
    document.querySelector('#toggle-sidebar-btn').addEventListener('click', () => { halfmoon.toggleSidebar() })
    document.querySelectorAll('.dark-mode-toggler').forEach((e) => e.addEventListener('click', () => { halfmoon.toggleDarkMode() }))

    // Basic stuff that needs to run on page load
    const settings = new Settings()
    const filters = new Filters(settings)
    const columns = new Columns()
    this.Tools.BetterList = new BetterList(settings, filters, columns)

    settings.initSettings()
    columns.initToggles()
    this.handleInputs()
    this.initToolSelect()
    this.route()
    this.initChangelog()
  }

  private readonly initToolSelect = (): void => {
    Object.keys(this.Tools).forEach((m) => {
      const o = document.createElement('option')
      o.value = m
      o.innerText = m
      this.toolSelect.insertAdjacentElement('beforeend', o)
    })

    // Sync value change with other select and route
    this.toolSelect.addEventListener('change', () => {
      this.route(this.toolSelect.value)
    })
  }

  private readonly getHashParams = (): any => {
    const hash = window.location.hash.substring(1)

    const result = hash.split('&').reduce(function (res, item) {
      const parts = item.split('=')
      res[parts[0]] = parts[1]
      return res
    }, {})

    return result
  }

  private readonly clearHash = (): any => {
    window.location.hash = '';
  }

  private readonly getHashParam = (param): string => {
    const params = this.getHashParams()
    return params[param] ?? null
  }

  private readonly route = (target: any = null): void => {
    if (target === null) {
      target = this.getHashParam('module')
      if (target === null) {
        target = this.toolSelect.value
      } else {
        this.toolSelect.value = target
      }
    }

    if (target && Object.hasOwn(this.Tools, target)) {
      if (this.activeModule !== undefined) {
        this.Tools[this.activeModule].unload()
      }

      this.Tools[target].load()
      this.activeModule = target
    }
  }

  // Function moving elements around depending on screen width
  private readonly handleInputs = (): void => {
    if (window.innerWidth >= 768) {
      return
    }

    Object.values(document.querySelector('#navsidebar-nav')!.children).forEach((e) => {
      document.querySelector('#navsidebar-sidebar')!.insertAdjacentElement('beforeend', e)
    })
  }

  private readonly initChangelog = (): void => {
    document.querySelector('#show-changelog')?.addEventListener('click', async (): Promise<void> => {
      // We need to import the markdown file as a module, otherwise it won't make it into the build
      const changelogRawImport = await import('../CHANGELOG.md')
      const changelogRaw = await fetch(changelogRawImport.default)
      document.querySelector('#changelog-content')!.innerHTML = marked.parse(await changelogRaw.text())
    });
  }
  public readonly alert = (msg: string, type: string = '') => {
    let alert = document.createElement('div')
    alert.innerHTML = this.alertTemplate
    if (type.length > 0) {
      alert.querySelector('.alert')!.classList.add('alert-' +  type)
    }
    alert.querySelector('.message')!.innerHTML = msg
    document.querySelector('#alert-container')?.insertAdjacentElement('beforeend', alert)
    window.setTimeout(() => {
      alert.remove()
    }, 10000)
  }
}

// Stupid rules say i can't have unused variables so i moved the contructor code to init()
const aniTools = new AniTools()
aniTools.init()

export default AniTools
