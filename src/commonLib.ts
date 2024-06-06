import DataTable from 'datatables.net-dt'

const handleResponse = async (response: Response): Promise<any> => {
  const json = await response.json()

  return response.ok ? json : await Promise.reject(json)
}

// Function for eventlistener delegation. For cases where you want to listen to an event on elemens that might not exist yet
const on = function (wrapperSelector: string, eventName: string, targetSelector: string, fn: Function): EventListener {
  const element = document.querySelector(wrapperSelector)

  const handler: EventListener = function (event: Event) {
    const possibleTargets = element.querySelectorAll(targetSelector)
    const target = event.target
    let el: EventTarget | null
    let p: Element

    for (let i = 0, l = possibleTargets.length; i < l; i++) {
      el = target
      p = possibleTargets[i]

      while (el !== null && el !== element) {
        if (el === p) {
          return fn.call(p, event)
        }

        el = el.parentNode
      }
    }
  }

  element.addEventListener(eventName, handler)

  return handler
}

DataTable.ext.classes.paging.button = 'page-link'
DataTable.ext.classes.paging.active = 'active'
/* We still require the dataTable class for the vendor CSS rules */
DataTable.ext.classes.table = 'dataTable dt-table'

export {
  on,
  handleResponse,
}
