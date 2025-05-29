import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosAdminsComponent } from './datos-admins.component';

describe('DatosAdminsComponent', () => {
  let component: DatosAdminsComponent;
  let fixture: ComponentFixture<DatosAdminsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatosAdminsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatosAdminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
