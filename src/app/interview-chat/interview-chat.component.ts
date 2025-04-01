import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RankingComponent } from '../ranking/ranking.component';

@Component({
  selector: 'app-interview-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RankingComponent],
  templateUrl: './interview-chat.component.html',
  styleUrl: './interview-chat.component.scss'
})
export class InterviewChatComponent {
  selectedLevel: string = 'junior';
  userInput: string = '';
  messages: { sender: string; text: string }[] = [];

  startInterview() {
    this.messages = [];
    this.messages.push({
      sender: 'ai',
      text: `Welcome to the ${this.selectedLevel} level interview! Let's begin.`,
    });
    this.askQuestion();
  }

  askQuestion() {
    const questions = {
      junior: 'What is the difference between let and const in JavaScript?',
      intermediate:
        'Explain the concept of closures in JavaScript with an example.',
      senior:
        'How would you optimize the performance of a large-scale Angular application?',
    };
    this.messages.push({
      sender: 'ai',
      text: questions[this.selectedLevel as keyof typeof questions],
    });
  }

  sendMessage() {
    if (this.userInput.trim()) {
      this.messages.push({ sender: 'user', text: this.userInput });
      this.userInput = '';
      setTimeout(() => {
        this.messages.push({
          sender: 'ai',
          text: 'Great answer! Let’s move to the next question.',
        });
        this.askQuestion();
      }, 1000);
    }
  }
}
