import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Đảm bảo Webpack nạp các lazy chunk đúng từ server Remote (localhost:4201) khi chạy nhúng
declare let __webpack_public_path__: string;
__webpack_public_path__ = 'http://localhost:4201/';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error('[ProcessX] Lỗi khởi động module:', err));
