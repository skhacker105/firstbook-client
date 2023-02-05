import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRoomStoreComponent } from './chat-room-store.component';

describe('ChatRoomStoreComponent', () => {
  let component: ChatRoomStoreComponent;
  let fixture: ComponentFixture<ChatRoomStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatRoomStoreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatRoomStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
