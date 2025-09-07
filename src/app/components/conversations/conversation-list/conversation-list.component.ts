import { Component, OnInit, Output, EventEmitter, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversationsService } from '../../../services/conversations.service';
import { UserConversation } from '../../../models/conversations/responses/user-conversations-response';
import { ConversationItemComponent } from '../conversation-item/conversation-item.component';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from '../../../services/authentication.service';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ConversationItemComponent],
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.css',
})
export class ConversationListComponent implements OnInit {
  @Output() conversationSelected = new EventEmitter<number>();

  conversations = input.required<UserConversation[]>();
  error: string | null = null;
  unauthorized = false;
  selectedConversationId: number | null = null;

  constructor(
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.unauthorized = true;
      return;
    }
  }

  onSelect(conversationId: number) {
    this.selectedConversationId = conversationId;
    this.conversationSelected.emit(conversationId);
  }
}
