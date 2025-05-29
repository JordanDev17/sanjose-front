import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebHomeComponent } from './web-home.component';

describe('WebHomeComponent', () => {
  let component: WebHomeComponent;
  let fixture: ComponentFixture<WebHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
