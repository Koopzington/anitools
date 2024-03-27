/* global localStorage */

class Settings extends EventTarget {
  private htmlTag: HTMLHtmlElement = document.querySelector('html')!

  public initSettings (): void {
    this.initTheme()
    this.initSideBarPosition()
    this.initBooleanSetting(
      '4k-halfsize',
      document.querySelector('#four-k-halfsize-toggle')!,
      (state: boolean) => {
        this.htmlTag.classList.toggle('i-wanna-read-on-4k-halfsize', state)
      }
    )
    this.initBooleanSetting(
      'fat-free',
      document.querySelector('#fat-free-toggle')!,
      (state: boolean) => {
        this.htmlTag.classList.toggle('fat-free', state)
      }
    )
    this.initBooleanSetting(
      'show-covers-on-title-hover',
      document.querySelector('#show-covers-on-title-hover')!,
      (state: boolean) => {
        this.htmlTag.classList.toggle('show-covers-on-title-hover', state)
      }
    )
    this.initBooleanSetting(
      'use-tag-groups',
      document.querySelector('#use-tag-groups')!,
      () => { this.dispatchEvent(new Event('tag-grouping-updated')) }
    )
    this.initBooleanSetting('use-embeds-for-code-copy', document.querySelector('#use-embeds-for-code-copy')!)
    this.initBooleanSetting('use-native-dropdowns', document.querySelector('#use-native-dropdowns')!)
  }

  public shouldGroupTags = (): boolean => localStorage.getItem('settings-use-tag-groups') === 'true'
  public shouldUseEmbedsForCodeCopy = (): boolean => localStorage.getItem('settings-use-embeds-for-code-copy') === 'true'

  private readonly initBooleanSetting = (settingName: string, btn: HTMLElement, callback: Function = () => {}) => {
    let localStorageKey = 'settings-' + settingName.split(/(?=[A-Z])/).join('-').toLowerCase()
    // Store the state locally
    this[settingName] = localStorage.getItem(localStorageKey) === 'true'
    btn?.addEventListener('click', () => {
      // Toggle state
      this[settingName] = !this[settingName]
      btn?.classList.toggle('btn-primary', this[settingName])
      // Store state in localStorage
      localStorage.setItem(localStorageKey, this[settingName].toString())
      // Trigger callback if given
      callback(this[settingName]);
    })
    btn?.classList.toggle('btn-primary', this[settingName])
    // Trigger callback if given
    callback(this[settingName]);
  }

  private readonly initTheme = (): void => {
    const siteThemeSelect: HTMLSelectElement = document.querySelector('#site-theme')!
    const enableTheme = (theme: string): void => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.classList.add('site-theme')
      link.href = 'themes/' + theme + '.css'
      document.querySelector('head')!.appendChild(link)
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
    const sideBarPositionSelect: HTMLSelectElement = document.querySelector('#sidebar-position')!
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
}

export default Settings
