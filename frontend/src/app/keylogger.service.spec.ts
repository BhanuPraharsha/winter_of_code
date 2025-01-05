import { TestBed } from '@angular/core/testing';

import { KeyloggerService } from './keylogger.service';

describe('KeyloggerService', () => {
  let service: KeyloggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyloggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
