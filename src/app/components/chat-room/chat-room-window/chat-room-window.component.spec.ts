import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRoomWindowComponent } from './chat-room-window.component';

describe('ChatRoomWindowComponent', () => {
  let component: ChatRoomWindowComponent;
  let fixture: ComponentFixture<ChatRoomWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatRoomWindowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatRoomWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
