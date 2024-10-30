import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppWithHeaderComponent } from './app-with-header.component';

describe('AppWithHeaderComponent', () => {
  let component: AppWithHeaderComponent;
  let fixture: ComponentFixture<AppWithHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppWithHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppWithHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
