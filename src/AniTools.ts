/* global localStorage */

import '@fontsource-variable/inter'
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
import AniList from './AniList'
import Mapper from './Tools/Mapper'
import { htmlToNode } from './commonLib'
import { mediaTypeSelect, userNameField, loadButton } from './GlobalElements'

class AniTools {
  // Tools which can be loaded and unloaded
  private readonly Tools: { BetterList: BetterList } = {}
  private readonly AniList: AniList
  private readonly toolSelect: HTMLSelectElement = htmlToNode('<select id="tool-dropdown" class="form-control"></select>')
  private activeModule: string | undefined
  private curWindowWidth: number = 0

  private readonly alertElement: HTMLDivElement = htmlToNode(`
  <div class="alert" role="alert">
    <button class="close" data-dismiss="alert" type="button" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
    <span class="message"></span>
    </div>`.trim()
  )

  constructor () {
    this.AniList = new AniList()
  }

  public readonly init = async (): Promise<void> => {
    this.initALLoginButton()
    this.handleInputs()
    // Check for stored username and replace default value if it exists
    const userName = localStorage.getItem('userName')
    if (userName !== null) {
      userNameField.value = userName
    }

    halfmoon.onDOMContentLoaded()
    document.querySelector('#toggle-sidebar-btn')!.addEventListener('click', () => { halfmoon.toggleSidebar() })
    document.querySelectorAll('.dark-mode-toggler').forEach((e) => e.addEventListener('click', () => { halfmoon.toggleDarkMode() }))

    // Basic stuff that needs to run on page load
    const settings = new Settings()
    const filters = new Filters(this, settings)
    const columns = new Columns()
    this.Tools.BetterList = new BetterList(this, settings, filters, columns, this.AniList)
    this.Tools.Mapper = new Mapper(this, filters)
    
    settings.initSettings()
    columns.initToggles()
    this.initToolSelect()
    this.route()
    this.initChangelog()
    window.onresize = this.handleInputs
  }

  private readonly initALLoginButton = (): void =>  {
    const loginbtn = document.querySelector('#al-login-btn')!
    const logoutbtn = document.querySelector('#al-logout-btn')!

    // Check whether we got redirected from AniList's OAuth login
    const accessToken = this.getHashParam('access_token')
    if (accessToken !== null) {
      localStorage.setItem('al-access-token', accessToken)
      this.clearHash()
    }
    // Check whether we got an access token in the localStorage
    if (localStorage.getItem('al-access-token') !== null) {
      loginbtn.classList.remove('d-inline-flex')
      loginbtn.classList.add('d-none')
      logoutbtn.classList.remove('d-none')
      logoutbtn.classList.add('d-inline-flex')
      logoutbtn.addEventListener('click', () => {
        localStorage.removeItem('al-access-token')
        window.location.reload()
      });
    }
  }

  private readonly initToolSelect = (): void => {
    Object.keys(this.Tools).forEach((m) => {
      const o = document.createElement('option')
      o.value = m
      o.innerText = m
      this.toolSelect.insertAdjacentElement('beforeend', o)
    })

    const lastTool = localStorage.getItem('tool')
    if (lastTool !== null && Object.hasOwn(this.Tools, lastTool)) {
      this.toolSelect.value = lastTool
    }

    // Sync value change with other select and route
    this.toolSelect.addEventListener('change', () => {
      localStorage.setItem('tool', this.toolSelect.value)
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
    // The window resize event gets triggered on mobile devices when the soft keyboard is opened
    // Chrome doesn't like it when focused elements (i.e. the user name input) is being moved during focus and
    // so we exit early when no change in window width was detected and prevent any moving
    if (window.innerWidth === this.curWindowWidth) {
      return
    }
    this.curWindowWidth = window.innerWidth
    
    const movingElements = [
      loadButton,
      userNameField,
      mediaTypeSelect,
      this.toolSelect,
    ]

    let targetContainer = document.querySelector('#navsidebar-sidebar')
    if (window.innerWidth >= 768) {
      targetContainer = document.querySelector('#navsidebar-nav')
    }

    movingElements.forEach((e) => {
      targetContainer?.insertAdjacentElement('afterbegin', e)
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

  public readonly isLoggedIn = (): boolean => {
    return localStorage.getItem('al-access-token') !== null
  }

  public readonly fetch = async (url: string, init: RequestInit | undefined = undefined): Promise<Response> => {
    const accessToken = localStorage.getItem('al-access-token');
    if (accessToken !== null) {
      if (init === undefined) {
        init = {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('al-access-token')
          }
        }
      } else {
        if (Object.hasOwn(init, 'headers')) {
          init.headers.Authorization = 'Bearer ' + localStorage.getItem('al-access-token')
        } else {
          init.headers = {
            Authorization: 'Bearer ' + localStorage.getItem('al-access-token')
          }
        }
        
      }
    }

    try {
      return await fetch(import.meta.env.VITE_API_URL + url, init)
    } catch (error) {
      this.errorHandler(error)
      throw error
    }
  }

  private readonly errorHandler = (error): void => {
    // Ignore AbortErrors, they're caused by the user when clicking things too fast
    if (error.name === 'AbortError') {
      return
    }

    console.error(error)
    this.alert(
      'There seems to be a problem with the AniTools Backend. Please contact the dev.',
      'danger',
      false
    )
  }

  public readonly alert = (msg: string, type: string = '', autoremove: boolean = true) => {
    let alert = this.alertElement.cloneNode(true)
    if (type.length > 0) {
      alert.classList.add('alert-' +  type)
    }
    alert.querySelector('.message')!.innerHTML = msg
    document.querySelector('#alert-container')?.insertAdjacentElement('beforeend', alert)
    if (autoremove) {
      window.setTimeout(() => {
        alert.remove()
      }, 10000)
    }
  }
}

// Stupid rules say i can't have unused variables so i moved the contructor code to init()
const aniTools = new AniTools()
aniTools.init()

export default AniTools
