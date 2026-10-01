import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Angular 14 Project';
  angularVersion = '14.2.0';
  cliVersion = '14.2.13';
  nodeVersion = 'v18+ Compatible';

  activeTab: 'features' | 'commands' | 'structure' | 'graph' = 'graph';
  copiedCommand = '';

  features = [
    { title: 'Angular 14 Core', desc: 'Standalone Components support, Typed Forms, & Streamlined Page Title API', icon: '⚡', tag: 'Core Framework' },
    { title: 'TypeScript 4.7', desc: 'Strict mode enabled with optimized build pipelines and type definitions', icon: '🛡️', tag: 'Type Safety' },
    { title: 'RxJS 7.5 Integration', desc: 'Reactive state management and smooth asynchronous stream operations', icon: '🔄', tag: 'State' },
    { title: 'Angular Router v14', desc: 'Modular navigation with built-in route guards and lazy loading capabilities', icon: '🔀', tag: 'Routing' }
  ];

  commands = [
    { cmd: 'npm start', label: 'Khởi chạy Dev Server (http://localhost:4200)' },
    { cmd: 'npm run build', label: 'Build Production Bundle (dist/)' },
    { cmd: 'ng generate component my-comp', label: 'Tạo Component mới' },
    { cmd: 'ng generate service my-service', label: 'Tạo Service mới' }
  ];

  copyCommand(cmd: string): void {
    navigator.clipboard.writeText(cmd);
    this.copiedCommand = cmd;
    setTimeout(() => {
      this.copiedCommand = '';
    }, 2000);
  }
}

