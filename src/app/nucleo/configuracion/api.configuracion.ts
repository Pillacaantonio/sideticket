import { InjectionToken } from '@angular/core';

export const URL_API_SIDETICKET = new InjectionToken<string>('URL_API_SIDETICKET', {
  providedIn: 'root',
  factory: () => '/api/v1/SideTicket',
});
