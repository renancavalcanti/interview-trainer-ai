import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewChatComponent } from './interview-chat.component';

describe('InterviewChatComponent', () => {
  let component: InterviewChatComponent;
  let fixture: ComponentFixture<InterviewChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
