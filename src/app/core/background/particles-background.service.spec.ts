import { TestBed } from '@angular/core/testing';

import { ParticlesBackgroundService } from './particles-background.service';

describe('ParticlesBackgroundService', () => {
  let service: ParticlesBackgroundService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParticlesBackgroundService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
