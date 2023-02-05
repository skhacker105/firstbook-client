import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEntityTriggerComponent } from './add-entity-trigger.component';

describe('AddEntityTriggerComponent', () => {
  let component: AddEntityTriggerComponent;
  let fixture: ComponentFixture<AddEntityTriggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEntityTriggerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEntityTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
