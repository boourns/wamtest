import { render, h } from "preact"
import { Site } from "./views/Site"

document.addEventListener('DOMContentLoaded', () => {
    render(<Site></Site>, document.body)
})