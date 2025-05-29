import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWarehousesComponent } from './dashboard-warehouses.component';

describe('DashboardWarehousesComponent', () => {
  let component: DashboardWarehousesComponent;
  let fixture: ComponentFixture<DashboardWarehousesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardWarehousesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardWarehousesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
