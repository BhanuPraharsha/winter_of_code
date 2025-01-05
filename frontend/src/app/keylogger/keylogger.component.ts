import { Component, OnInit } from '@angular/core';
import { KeyloggerService } from '../keylogger.service';

@Component({
  selector: 'keylogger',
  templateUrl: './keylogger.component.html',
  styleUrls: ['./keylogger.component.css']
})
export class KeyloggerComponent implements OnInit {
  logs: string = '';
  formattedLogs: any[] = [];
  constructor(private keylogger:KeyloggerService )
  {

  }
  ngOnInit(): void {
    this.fetchLogs();
  }
  fetchLogs(): void {
    debugger;
    this.keylogger.getLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.parseLogs(data);
       // this.error = null;
      },
      error: (err) => {
       // this.error = err;
        this.logs = '';
      }
    });
  }

  parseLogs(rawLogs: string): void {
    const sessions = rawLogs.split('Session Start: ').filter(log => log.trim());
    var formattedData = sessions.map(session => {
      debugger;
      const [start, ...rest] = session.split('\n');
  
      // Extract "Session End" and "Captured Text"
      const domainMatch = rest.find(line => line.startsWith('Domain:'));
      //const domainMatchIndex = rest.findIndex(line => line.startsWith('Domain:'));


      const endMatch = rest.find(line => line.startsWith('Session End:'));
      const textStartIndex = rest.findIndex(line => line.startsWith('Captured Text:'));
      
      // Captured Text content
      const textMatch = textStartIndex !== -1
        ? rest.slice(textStartIndex).map(line => line.replace('Captured Text:', '').trim()).join('\n')
        : '';
  
      return {
        start: start.trim(),
        domain: domainMatch?.trim(),
        end: endMatch ? endMatch.replace('Session End: ', '').trim() : 'N/A',

        text: textMatch.trim()
      };
    });

    this.formattedLogs=formattedData.filter(x=>x.domain!=undefined);
  }
  
}
