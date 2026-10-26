import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  audioNewTicket: any;

  constructor() { }

  playAudioNewTicket(): void {
    if (!this.audioNewTicket) this.audioNewTicket = new Audio();
    this.audioNewTicket.src = 'assets/sound/facebook_messenger.mp3';
    this.audioNewTicket.load();
    this.audioNewTicket.play();
  }
}
