import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '../../types';

@Component({
  selector: 'app-view-conversation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-conversation-modal.component.html',
  styleUrls: ['./view-conversation-modal.component.css']
})
export class ViewConversationModalComponent implements OnInit, OnChanges, AfterViewChecked {
  @Input() isOpen: boolean = false;
  @Input() conversation: Conversation | null = null;
  @Input() isLoading: boolean = false;
  @Output() close = new EventEmitter<void>();
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef<HTMLDivElement>;

  private shouldScroll = false;

  ngOnInit(): void {
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
        this.shouldScroll = true;
      } else {
        document.body.style.overflow = '';
      }
    }
    if (changes['conversation'] && this.conversation) {
      this.shouldScroll = true;
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.scrollContainer) {
      setTimeout(() => {
        if (this.scrollContainer?.nativeElement) {
          this.scrollContainer.nativeElement.scrollTo({
            top: this.scrollContainer.nativeElement.scrollHeight,
            behavior: 'smooth'
          });
        }
        this.shouldScroll = false;
      }, 100);
    }
  }

  onClose(): void {
    this.close.emit();
    document.body.style.overflow = '';
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
