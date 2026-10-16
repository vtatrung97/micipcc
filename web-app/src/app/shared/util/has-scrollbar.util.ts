export function isHasScrollbar(element: HTMLElement) {
    if (element) {
        return (element.clientWidth < element.scrollWidth)
    }
    return false
}
