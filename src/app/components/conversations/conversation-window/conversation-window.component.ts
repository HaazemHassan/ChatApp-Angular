import {
  Participant,
  UserConversation,
} from './../../../models/conversations/responses/user-conversations-response';
import {
  Component,

  OnInit,

  ViewChild,
  ElementRef,
  AfterViewChecked,
  input,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversationsService } from '../../../services/conversations.service';
import { AuthenticationService } from '../../../services/authentication.service';
import {
  MessageResponse,
  ConversationMessagesResponse,
} from '../../../models/conversations/responses/conversation-messages-response';
import { SendDirectMessageRequest } from '../../../models/conversations/requests/send-direct-message-request';
import { MessageType } from '../../../enums/message-type';


@Component({
  selector: 'app-conversation-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversation-window.component.html',
  styleUrl: './conversation-window.component.css',
})
export class ConversationWindowComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesList', { static: false }) messagesList!: ElementRef;
  conversation = input.required<UserConversation>();

  messages: MessageResponse[] = [];
  loading = false;
  error: string | null = null;
  currentUserId: number | null = null;
  messageText: string = '';
  private shouldScrollToBottom = false;

  constructor(
    private conversationsService: ConversationsService,
    private authService: AuthenticationService
  ) {
    effect(() => {
      if (this.conversation() && this.conversation().id) {
        this.loadMessages();
      }
      else
        this.messages = [];
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  private loadMessages(): void {

    if (!this.conversation() || !this.conversation().id) return;

    this.loading = true;
    this.error = null;

    this.conversationsService
      .getConversationMessages(this.conversation().id!)
      .subscribe({
        next: (response: ConversationMessagesResponse) => {
          this.messages = response.messages || [];

          this.loading = false;
          this.shouldScrollToBottom = true;
        },
        error: (err) => {
          this.error = 'Failed to load messages';
          this.loading = false;
          console.error('Error loading messages:', err);
        },
      });
  }

  isCurrentUserMessage(message: MessageResponse): boolean {
    return message.senderId === this.currentUserId;
  }

  formatMessageTime(sentAt: string): string {
    const date = new Date(sentAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && this.messagesList) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesList && this.messagesList.nativeElement) {
        const element = this.messagesList.nativeElement;

        requestAnimationFrame(() => {
          element.scrollTop = element.scrollHeight;
        });

        setTimeout(() => {
          element.scrollTop = element.scrollHeight;
        }, 100);
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  sendMessage(): void {
    if (!this.messageText.trim() || !this.conversation()
      || this.currentUserId === null) return;

    const recipientUserId = this.conversation().participants.find(
      (p: Participant) => p.userId !== this.currentUserId
    )?.userId;

    console.log(this.conversation())

    console.log(recipientUserId);

    if (!recipientUserId) {
      this.error = 'Recipient not found';
      return;
    }

    const message: SendDirectMessageRequest = {
      senderId: this.currentUserId,
      recipientUserId: recipientUserId,
      content: this.messageText.trim(),
      messageType: MessageType.Text,
    };

    const originalText = this.messageText;
    this.messageText = '';
    this.error = null;

    this.conversationsService.sendDirectMessage(message).subscribe({
      next: (response: MessageResponse) => {
        console.log('Message sent successfully:', response);
        this.messages.push(response);
        this.scrollToBottom();

      },
      error: (err) => {
        console.error('Error sending message:', err);

        this.error = 'Failed to send message. Please try again.';

        this.messageText = originalText;
      },
    });
  }
}
