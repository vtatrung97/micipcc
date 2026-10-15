export function escapeHtml(str: string): string {
    return str.replace(/[&<>"']/g, (match: string) => {
        switch (match) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case "'":
                return '&#39;';
            case '`':
                return '&#x60;';
            default:
                return match;
        }
    });
}
