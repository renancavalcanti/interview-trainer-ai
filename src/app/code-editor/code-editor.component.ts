import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit {
  @Input() disabled: boolean = false;
  @Output() codeChange = new EventEmitter<string>();
  @Output() sendCode = new EventEmitter<void>();
  
  code: string = '';
  
  // Language options for syntax highlighting
  languageOptions = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'csharp', name: 'C#' },
    { id: 'cpp', name: 'C++' },
    { id: 'plaintext', name: 'Plain Text' }
  ];
  
  selectedLanguage: string = 'javascript';

  constructor() { }

  ngOnInit(): void {
  }
  
  onCodeChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.code = textarea.value;
    this.codeChange.emit(this.code);
  }

  onSendCode(): void {
    if (this.code.trim() && !this.disabled) {
      this.sendCode.emit();
    }
  }
  
  changeLanguage(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedLanguage = select.value;
  }
  
  handleTabKey(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      event.preventDefault();
      
      const textarea = event.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert tab character
      this.code = this.code.substring(0, start) + '  ' + this.code.substring(end);
      
      // Set cursor position after the tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
      
      this.codeChange.emit(this.code);
    } else if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      this.onSendCode();
    }
  }
} 