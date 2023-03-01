import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationMessageComponent } from './information-message.component';

describe('InformationMessageComponent', () => {
  let component: InformationMessageComponent;
  let fixture: ComponentFixture<InformationMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformationMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformationMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
