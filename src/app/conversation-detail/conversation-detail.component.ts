import { Component, OnInit, PLATFORM_ID, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConversationService, ConversationDetail, Message } from '../services/conversation.service';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KeyValue } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-conversation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule],
  templateUrl: './conversation-detail.component.html',
  styleUrls: ['./conversation-detail.component.scss']
})
export class ConversationDetailComponent implements OnInit {
  conversation: ConversationDetail | null = null;
  conversationId: string = '';
  loading = true;
  error = '';
  
  // For study features
  highlightedMessages: Set<number> = new Set();
  highlightedMessagesMap: Record<string, boolean> = {}; // For use with keyvalue pipe
  notes: { [index: number]: string } = {};
  showNoteEditor = -1;
  currentNote = '';
  studyMode = false;
  private isBrowser: boolean;
  @ViewChild('studySummary') studySummaryElement: ElementRef | null = null;
  generatingPdf = false;
  toast: { show: boolean; message: string; type: string } = { show: false, message: '', type: 'success' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private conversationService: ConversationService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.conversationId = params['id'];
      this.loadConversation();
    });
  }

  loadConversation(): void {
    this.loading = true;
    this.conversationService.getConversation(this.conversationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.conversation = response.conversation;
          // Load notes from localStorage if they exist (browser only)
          if (this.isBrowser) {
            this.loadStudyData();
          }
          this.updateHighlightedMessagesMap();
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load conversation. Please try again later.';
        console.error('Error loading conversation:', error);
        this.loading = false;
      }
    });
  }

  // Helper method to convert the Set to a Record for keyvalue pipe
  updateHighlightedMessagesMap(): void {
    this.highlightedMessagesMap = {};
    this.highlightedMessages.forEach(index => {
      this.highlightedMessagesMap[index.toString()] = true;
    });
  }

  // Helper method to format content with replaced newlines
  formatContent(content: string): string {
    if (!content) return '';
    return content.replace(/\n/g, '<br>');
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleStudyMode(): void {
    this.studyMode = !this.studyMode;
  }

  toggleHighlight(index: number): void {
    if (this.highlightedMessages.has(index)) {
      this.highlightedMessages.delete(index);
    } else {
      this.highlightedMessages.add(index);
    }
    this.updateHighlightedMessagesMap();
    this.saveStudyData();
  }

  isHighlighted(index: number): boolean {
    return this.highlightedMessages.has(index);
  }

  addNote(index: number): void {
    this.showNoteEditor = index;
    this.currentNote = this.notes[index] || '';
  }

  saveNote(): void {
    if (this.showNoteEditor >= 0) {
      if (this.currentNote.trim()) {
        this.notes[this.showNoteEditor] = this.currentNote;
      } else {
        delete this.notes[this.showNoteEditor];
      }
      this.showNoteEditor = -1;
      this.currentNote = '';
      this.saveStudyData();
    }
  }

  cancelNote(): void {
    this.showNoteEditor = -1;
    this.currentNote = '';
  }

  private saveStudyData(): void {
    if (!this.isBrowser || !this.conversationId) return;
    
    try {
      const studyData = {
        highlights: Array.from(this.highlightedMessages),
        notes: this.notes
      };
      localStorage.setItem(`study_${this.conversationId}`, JSON.stringify(studyData));
    } catch (error) {
      console.error('Error saving study data to localStorage', error);
    }
  }

  private loadStudyData(): void {
    if (!this.isBrowser || !this.conversationId) return;
    
    try {
      const studyDataJSON = localStorage.getItem(`study_${this.conversationId}`);
      if (studyDataJSON) {
        const studyData = JSON.parse(studyDataJSON);
        this.highlightedMessages = new Set(studyData.highlights);
        this.notes = studyData.notes || {};
      }
    } catch (error) {
      console.error('Error loading study data from localStorage', error);
    }
  }

  copyToClipboard(content: string): void {
    if (!this.isBrowser) return;
    
    navigator.clipboard.writeText(content).then(() => {
      alert('Text copied to clipboard!');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  // Helper method to get message role
  getMessageRole(index: number): string {
    if (this.conversation && this.conversation.messages[index]) {
      return this.conversation.messages[index].role === 'user' ? 'You' : 'AI Assistant';
    }
    return '';
  }

  // Helper method to safely access message content
  getMessageContent(index: number): string {
    if (this.conversation && this.conversation.messages[index]) {
      return this.conversation.messages[index].content;
    }
    return '';
  }

  // Helper method to safely access message timestamp
  getMessageTimestamp(index: number): string {
    if (this.conversation && this.conversation.messages[index]) {
      return this.formatDate(this.conversation.messages[index].timestamp);
    }
    return '';
  }

  // Safe accessor for notes
  hasNote(index: number): boolean {
    return !!this.notes[index];
  }

  getNote(index: number): string {
    return this.notes[index] || '';
  }

  /**
   * Display a toast message 
   */
  private showToast(message: string, type: string = 'success'): void {
    if (!this.isBrowser) return;
    
    this.toast = { show: true, message, type };
    
    // Hide the toast after 3 seconds
    setTimeout(() => {
      this.toast = { ...this.toast, show: false };
    }, 3000);
  }

  /**
   * Generate and download a PDF of the study summary
   */
  generatePdf(): void {
    if (!this.isBrowser || !this.studySummaryElement || !this.conversation) {
      console.error('Cannot generate PDF: missing required elements');
      return;
    }

    this.generatingPdf = true;
    const element = this.studySummaryElement.nativeElement;
    const conversationTitle = this.conversation.title || 'Conversation Summary';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${conversationTitle.replace(/\s+/g, '_')}_${timestamp}.pdf`;

    // Show loading indicator or message
    const originalDisplay = element.style.display;
    // Ensure the element is visible for html2canvas
    element.style.display = 'block';

    html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      allowTaint: true
    }).then((canvas) => {
      // Restore original display style
      element.style.display = originalDisplay;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30; // Start 30mm from the top

      // Add a title
      pdf.setFontSize(16);
      pdf.text(conversationTitle, pdfWidth / 2, 15, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(`Generated on ${new Date().toLocaleString()}`, pdfWidth / 2, 22, { align: 'center' });
      
      // Add the image
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Download the PDF
      pdf.save(filename);
      this.generatingPdf = false;
      this.showToast('PDF has been generated and downloaded successfully!');
    }).catch((error) => {
      console.error('Error generating PDF:', error);
      element.style.display = originalDisplay;
      this.generatingPdf = false;
      this.showToast('Failed to generate PDF. Please try again.', 'danger');
    });
  }
} 