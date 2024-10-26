import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EleccionPerfilComponent } from './eleccion-perfil.component';

describe('EleccionPerfilComponent', () => {
  let component: EleccionPerfilComponent;
  let fixture: ComponentFixture<EleccionPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EleccionPerfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EleccionPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
