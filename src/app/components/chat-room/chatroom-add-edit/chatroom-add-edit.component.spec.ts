import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatroomAddEditComponent } from './chatroom-add-edit.component';

describe('ChatroomAddEditComponent', () => {
  let component: ChatroomAddEditComponent;
  let fixture: ComponentFixture<ChatroomAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatroomAddEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatroomAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
