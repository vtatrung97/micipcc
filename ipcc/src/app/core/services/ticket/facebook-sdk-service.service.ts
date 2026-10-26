import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FacebookSdkServiceService {

  constructor() { }
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  init(appId: string, version = 'v25.0'): Promise<void> {
    if (this.initialized) {
      return Promise.resolve();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve) => {
      if (this.initialized) {
        resolve();
        return;
      }

      const initialize = () => {
        FB.init({
          appId,
          autoLogAppEvents: true,
          xfbml: true,
          version,
        });

        this.initialized = true;
        resolve();
      };

      if (typeof FB !== 'undefined') {
        initialize();
        return;
      }

      window.fbAsyncInit = initialize;
    });

    return this.initPromise;
  }

  login(configId: string): Promise<any> {
    return new Promise((resolve) => {
      FB.login(
        (response: any) => {
          resolve(response);
        },
        {
          config_id: configId,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            setup: {},
          },
        }
      );
    });
  }
}
