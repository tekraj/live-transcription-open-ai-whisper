import { TestBed } from '@angular/core/testing';

import { TranscriptionHandlerService } from './transcription-handler.service';

describe('TranscriptionHandlerService', () => {
  let service: TranscriptionHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranscriptionHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
