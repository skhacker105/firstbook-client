import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StringMessageComponent } from './string-message.component';

describe('StringMessageComponent', () => {
  let component: StringMessageComponent;
  let fixture: ComponentFixture<StringMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StringMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StringMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
