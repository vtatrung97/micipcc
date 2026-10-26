import { Injectable } from '@angular/core';
import { getProcessXRemoteUrl } from '../../app-routing.module';

@Injectable({
  providedIn: 'root'
})
export class RemoteLoaderService {
  private isLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  async loadProcessXScripts(): Promise<void> {
    if (this.isLoaded || document.getElementById('process-x-loaded')) {
      return;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = (async () => {
      try {
        const baseUrl = (getProcessXRemoteUrl() || 'http://localhost:4201/remoteEntry.js').replace(/\/remoteEntry\.js.*$/, '');

        // 1. Vô hiệu hóa webpack-dev-server tự động reload trang khi chạy nhúng
        if (typeof window !== 'undefined' && !window.location.search.includes('webpack-dev-server-live-reload=false')) {
          const sep = window.location.search ? '&' : '?';
          window.history.replaceState(
            null,
            '',
            `${window.location.pathname}${window.location.search}${sep}webpack-dev-server-live-reload=false`
          );
        }

        // 2. Nạp styles.css (dùng thẻ <link> CSS thuần, không nạp styles.js để tránh dev-server reload)
        const styleId = 'process-x-styles-css';
        if (!document.getElementById(styleId)) {
          const link = document.createElement('link');
          link.id = styleId;
          link.rel = 'stylesheet';
          link.href = `${baseUrl}/styles.css`;
          document.head.appendChild(link);
        }

        // 3. Thứ tự nạp JS:
        // - runtime.js: khởi tạo Webpack runtime của ProcessX
        // - vendor.js: thư viện
        // - main.js: code component
        const bundles = ['runtime.js', 'vendor.js', 'main.js'];

        for (const bundle of bundles) {
          const id = `process-x-${bundle.replace(/[^a-zA-Z0-9]/g, '-')}`;
          if (!document.getElementById(id)) {
            await new Promise<void>((resolve) => {
              const script = document.createElement('script');
              script.id = id;
              script.type = 'module';
              script.src = `${baseUrl}/${bundle}`;
              script.onload = () => {
                console.log(`[Host IPCC] Nạp thành công: ${bundle}`);
                resolve();
              };
              script.onerror = () => {
                console.warn(`[Host IPCC] Bỏ qua hoặc không tìm thấy: ${bundle}`);
                resolve();
              };
              document.head.appendChild(script);
            });
          }
        }

        // 4. Đợi Web Component được đăng ký
        if (typeof window !== 'undefined' && window.customElements && customElements.whenDefined) {
          try {
            await Promise.race([
              customElements.whenDefined('process-procedure-app'),
              new Promise((r) => setTimeout(r, 1000))
            ]);
          } catch (e) {}
        }

        const marker = document.createElement('div');
        marker.id = 'process-x-loaded';
        marker.style.display = 'none';
        document.head.appendChild(marker);

        this.isLoaded = true;
      } catch (err) {
        console.error('[Host IPCC] Nạp script ProcessX thất bại:', err);
      } finally {
        this.loadingPromise = null;
      }
    })();

    return this.loadingPromise;
  }
}
