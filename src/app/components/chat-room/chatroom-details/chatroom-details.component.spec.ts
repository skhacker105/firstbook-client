import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatroomDetailsComponent } from './chatroom-details.component';

describe('ChatroomDetailsComponent', () => {
  let component: ChatroomDetailsComponent;
  let fixture: ComponentFixture<ChatroomDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatroomDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatroomDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
