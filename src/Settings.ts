/* global localStorage */

class Settings extends EventTarget {
  private useTagGroups: boolean
  private useEmbedsForCodeCopy: boolean
  private htmlTag: HTMLHtmlElement = document.querySelector('html')

  public initSettings (): void {
    this.initFatFreeMode()
    this.initIWannaReadOn4kHalfsize()
    this.initTheme()
    this.initSideBarPosition()
    this.initTagGroups()
    this.initCodeCopyBehaviour()
    this.initShowCoversOnTitleHover()
  }

  private readonly initShowCoversOnTitleHover = (): void => {
    const btn = document.querySelector('#show-covers-on-title-hover')
    const settingName = 'settings-show-covers-on-title-hover'
    btn?.addEventListener('click', () => {
      this.htmlTag.classList.toggle('show-covers-on-title-hover')
      const state = this.htmlTag.classList.contains('show-covers-on-title-hover')
      btn.classList.toggle('btn-primary', state)
      localStorage.setItem(settingName, state.toString())
    })

    const settingState = localStorage.getItem(settingName) === 'true'
    this.htmlTag.classList.toggle('show-covers-on-title-hover', settingState)
    btn?.classList.toggle('btn-primary', settingState)
  }

  private readonly initFatFreeMode = (): void => {
    const btn = document.querySelector('#fat-free-toggle')
    const settingName = 'settings-fat-free'
    btn?.addEventListener('click', () => {
      this.htmlTag.classList.toggle('fat-free')
      const state = this.htmlTag.classList.contains('fat-free')
      btn.classList.toggle('btn-primary', state)
      localStorage.setItem(settingName, state.toString())
    })
    const settingState = localStorage.getItem(settingName) === 'true'
    this.htmlTag.classList.toggle('fat-free', settingState)
    btn?.classList.toggle('btn-primary', settingState)
  }

  private readonly initIWannaReadOn4kHalfsize = (): void => {
    const btn = document.querySelector('#four-k-halfsize-toggle')
    const settingName = 'settings-4k-halfsize'
    btn?.addEventListener('click', () => {
      this.htmlTag.classList.toggle('i-wanna-read-on-4k-halfsize')
      const state = this.htmlTag.classList.contains('i-wanna-read-on-4k-halfsize')
      btn?.classList.toggle('btn-primary', state)
      localStorage.setItem(settingName, state.toString())
    })
    const fourkhalfsize = localStorage.getItem(settingName) === 'true'
    this.htmlTag.classList.toggle('i-wanna-read-on-4k-halfsize', fourkhalfsize)
    btn?.classList.toggle('btn-primary', fourkhalfsize)
  }

  private readonly initTheme = (): void => {
    const siteThemeSelect: HTMLSelectElement = document.querySelector('#site-theme')
    const enableTheme = (theme: string): void => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.classList.add('site-theme')
      link.href = 'themes/' + theme + '.css'
      document.querySelector('head').appendChild(link)
    }
    siteThemeSelect.addEventListener('change', () => {
      document.querySelectorAll('.site-theme').forEach((e) => {
        e.remove()
      })

      if (siteThemeSelect.value === '') {
        localStorage.removeItem('site-theme')
        return
      }

      enableTheme(siteThemeSelect.value)
      localStorage.setItem('site-theme', siteThemeSelect.value)
    })
    const siteTheme = localStorage.getItem('site-theme')
    if (siteTheme !== null) {
      enableTheme(siteTheme)
      siteThemeSelect.value = siteTheme
    }
  }

  private readonly initSideBarPosition = (): void => {
    const sideBarPositionSelect: HTMLSelectElement = document.querySelector('#sidebar-position')
    const moveSideBarToRightSide = (): void => {
      this.htmlTag.classList.toggle('sidebar-right', sideBarPositionSelect.value === 'right')
    }

    sideBarPositionSelect.addEventListener('change', () => {
      moveSideBarToRightSide()
      localStorage.setItem('settings-sidebar-position', sideBarPositionSelect.value)
    })

    const sidebarPosition = localStorage.getItem('settings-sidebar-position')
    if (sidebarPosition !== null) {
      sideBarPositionSelect.value = sidebarPosition
    }
    moveSideBarToRightSide()
  }

  private readonly initTagGroups = (): void => {
    this.useTagGroups = localStorage.getItem('settings-use-tag-groups') === 'true'
    const btn = document.querySelector('#use-tag-groups')

    btn?.addEventListener('click', () => {
      this.useTagGroups = !this.useTagGroups
      btn?.classList.toggle('btn-primary', this.useTagGroups)
      localStorage.setItem('settings-use-tag-groups', this.useTagGroups.toString())
      this.dispatchEvent(new Event('tag-grouping-updated'))
    })
    btn?.classList.toggle('btn-primary', this.useTagGroups)
  }

  public shouldGroupTags = (): boolean => this.useTagGroups

  private readonly initCodeCopyBehaviour = (): void => {
    this.useEmbedsForCodeCopy = localStorage.getItem('settings-use-embeds-for-code-copy') === 'true'
    const btn = document.querySelector('#use-embeds-for-code-copy')
    btn?.addEventListener('click', () => {
      this.useEmbedsForCodeCopy = !this.useEmbedsForCodeCopy
      btn?.classList.toggle('btn-primary', this.useEmbedsForCodeCopy)
      localStorage.setItem('settings-use-embeds-for-code-copy', this.useEmbedsForCodeCopy.toString())
    })
    btn?.classList.toggle('btn-primary', this.useEmbedsForCodeCopy)
  }

  public shouldUseEmbedsForCodeCopy = (): boolean => this.useEmbedsForCodeCopy
}

export default Settings
