import { htmlToNode } from "./commonLib"

const mediaTypeSelect: HTMLSelectElement = htmlToNode(`
  <select class="media-type form-control">
    <option value="ANIME">Anime</option>
    <option value="MANGA">Manga</option>
    <option value="CHARACTER">Character</option>
    <option value="STAFF">Staff</option>
  </select>
`.trim())

const userNameField: HTMLInputElement = htmlToNode(
  `<input id="al-user" type="text" class="form-control" placeholder="AL Username" required="required">`
)

const loadButton: HTMLButtonElement = htmlToNode(
  `<button id="load" class="btn btn-primary" type="button">Load</button>`
)

export {
  mediaTypeSelect,
  userNameField,
  loadButton,
}