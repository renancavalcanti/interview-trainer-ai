import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeEditorComponent } from '../code-editor/code-editor.component';
import { InterviewService, InterviewRequest, InterviewResponse } from '../services/interview.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-interview-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, CodeEditorComponent],
  templateUrl: './interview-chat.component.html',
  styleUrl: './interview-chat.component.scss'
})
export class InterviewChatComponent implements OnInit {
  selectedTechnology: string = 'javascript';
  selectedLevel: string = 'beginner';
  userInput: string = '';
  codeInput: string = '';
  messages: { sender: string; text: string; formattedText?: SafeHtml }[] = [];
  conversationId: string | null = null;
  isLoading: boolean = false;
  
  technologies = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'csharp', name: 'C#' },
    { id: 'cpp', name: 'C++' },
    { id: 'go', name: 'Go' },
    { id: 'rust', name: 'Rust' },
    { id: 'react', name: 'React' },
    { id: 'angular', name: 'Angular' },
    { id: 'vue', name: 'Vue' },
    { id: 'nodejs', name: 'Node.js' },
    { id: 'sql', name: 'SQL' },
    { id: 'nosql', name: 'NoSQL' },
    { id: 'programming_concepts', name: 'Programming Concepts' },
    { id: 'data_structures', name: 'Data Structures' },
    { id: 'algorithms', name: 'Algorithms' },
    { id: 'design_patterns', name: 'Design Patterns' },
    { id: 'system_design', name: 'System Design' },
    { id: 'cloud_computing', name: 'Cloud Computing' },
    { id: 'devops', name: 'DevOps' },
    { id: 'testing', name: 'Testing' }
  ];
  
  levels = [
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'expert', name: 'Expert' }
  ];

  constructor(
    private interviewService: InterviewService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
    }
  }

  startInterview(): void {
    // Check if user is logged in before starting
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.messages = [];
    this.conversationId = null;
    this.isLoading = true;
    this.codeInput = '';
    this.userInput = '';
    
    const welcomeMessage = `Starting ${this.selectedLevel} level interview for ${this.getSelectedTechnologyName()}...`;
    this.messages.push({
      sender: 'system',
      text: welcomeMessage,
      formattedText: this.formatPlainText(welcomeMessage)
    });
    
    this.interviewService.startConversation({
      technology: this.selectedTechnology,
      level: this.selectedLevel,
      language: 'english',
      message: 'Start interview'
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.conversationId = response.conversation_id;
        this.addMessageWithFormatting('ai', response.message);
        this.scrollToBottom();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error starting interview:', error);
        const errorMsg = 'Error connecting to the interview service. Please try again later.';
        this.messages.push({
          sender: 'system',
          text: errorMsg,
          formattedText: this.formatPlainText(errorMsg)
        });
      }
    });
  }

  resetConversation(): void {
    this.messages = [];
    this.conversationId = null;
    this.userInput = '';
    this.codeInput = '';
  }

  handleKeyDown(event: KeyboardEvent): void {
    // Send message on Ctrl+Enter
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(useCodeInput: boolean = false): void {
    // Check if user is logged in before sending
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    
    const messageContent = useCodeInput ? this.codeInput.trim() : this.userInput.trim();
    
    if (messageContent && !this.isLoading) {
      this.messages.push({ 
        sender: 'user', 
        text: messageContent,
        formattedText: this.formatPlainText(messageContent)
      });
      
      if (useCodeInput) {
        this.codeInput = '';
      } else {
        this.userInput = '';
      }
      
      this.isLoading = true;
      this.scrollToBottom();
      
      this.interviewService.continueConversation({
        technology: this.selectedTechnology,
        level: this.selectedLevel,
        language: 'english',
        message: messageContent,
        conversation_id: this.conversationId || undefined
      }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.conversationId = response.conversation_id;
          this.addMessageWithFormatting('ai', response.message);
          
          // Scroll to the bottom of the chat after receiving a response
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error in interview conversation:', error);
          const errorMsg = 'Error connecting to the interview service. Please try again.';
          this.messages.push({
            sender: 'system',
            text: errorMsg,
            formattedText: this.formatPlainText(errorMsg)
          });
          this.scrollToBottom();
        }
      });
    }
  }
  
  updateCodeInput(code: string): void {
    this.codeInput = code;
  }
  
  getSelectedTechnologyName(): string {
    const tech = this.technologies.find(t => t.id === this.selectedTechnology);
    return tech ? tech.name : this.selectedTechnology;
  }
  
  formatPlainText(text: string): SafeHtml {
    if (!text) return this.sanitizer.bypassSecurityTrustHtml('');
    // Replace newlines with <br> tags
    const formatted = text.replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }
  
  private addMessageWithFormatting(sender: string, text: string): void {
    try {
      // Process text to handle code blocks and format them properly
      const formattedText = this.formatMessageWithCodeBlocks(text);
      
      this.messages.push({
        sender,
        text,
        formattedText
      });
    } catch (error) {
      console.error('Error formatting message:', error);
      // Fallback to plain text if formatting fails
      this.messages.push({
        sender,
        text,
        formattedText: this.formatPlainText(text)
      });
    }
  }
  
  private formatMessageWithCodeBlocks(text: string): SafeHtml {
    if (!text) return this.sanitizer.bypassSecurityTrustHtml('');
    
    try {
      // First, handle code blocks with triple backticks
      const codeBlockRegex = /```([\w]*)\n([\s\S]*?)\n```/g;
      let formatted = text;
      let match;
      
      // Replace all code blocks
      while ((match = codeBlockRegex.exec(text)) !== null) {
        const language = match[1] || '';
        const code = match[2] || '';
        const replacement = `<pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>`;
        formatted = formatted.replace(match[0], replacement);
      }
      
      // Then handle inline code
      formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
      
      // Finally replace newlines with <br>
      formatted = formatted.replace(/\n/g, '<br>');
      
      return this.sanitizer.bypassSecurityTrustHtml(formatted);
    } catch (error) {
      console.error('Error in formatMessageWithCodeBlocks:', error);
      return this.formatPlainText(text);
    }
  }
  
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  
  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }, 50);
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
