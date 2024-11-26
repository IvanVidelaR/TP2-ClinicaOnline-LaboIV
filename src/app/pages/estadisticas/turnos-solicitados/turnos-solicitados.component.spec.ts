import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnosSolicitadosComponent } from './turnos-solicitados.component';

describe('TurnosSolicitadosComponent', () => {
  let component: TurnosSolicitadosComponent;
  let fixture: ComponentFixture<TurnosSolicitadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnosSolicitadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurnosSolicitadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
