import lgZoom from "lightgallery/plugins/zoom";
import lgThumbnail from "lightgallery/plugins/thumbnail";

export function getCommonGallerySetting(isAlbum: boolean = true, option?: any): any {
    let plugins = isAlbum ? [lgThumbnail, lgZoom] : [lgZoom]
    let settings = {
        infiniteZoom: true,
        scale: 1,
        counter: false,
        plugins: plugins,
        flipHorizontal: false,
        flipVertical: false,
        rotateRight: true,
        rotateLeft: true,
        thumbHeight: "48px",
        thumbMargin: 16,
        thumbWidth: 48,
        speed: 500,
        showZoomInOutIcons: true,
        actualSize: false,

        prevHtml: `
            <div class="d-flex align-items-center">
              <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>`
        ,
        nextHtml: `
            <div class="d-flex align-items-center">
              <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.13086 4L10.1309 8L6.13086 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>`
        ,
        ...option
    }
    return settings;
}
