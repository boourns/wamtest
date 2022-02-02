import { render, h } from "preact"
import { Site } from "./core/Site"

document.addEventListener('DOMContentLoaded', () => {
    render(<Site></Site>, document.body)
})