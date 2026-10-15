import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AGENTMATE } from '@env/environment';
import { AgentMateBotOption } from '@core/models/env.model';

@Injectable({ providedIn: 'root' })
export class AgentmateUiService {
  private _selectedBot = new BehaviorSubject<AgentMateBotOption>(AGENTMATE.bots[0]);
  selectedBot$ = this._selectedBot.asObservable();

  selectBot(bot: AgentMateBotOption): void {
    this._selectedBot.next(bot);
  }
}
