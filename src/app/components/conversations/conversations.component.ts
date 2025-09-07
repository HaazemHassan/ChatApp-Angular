import { ConversationsService } from './../../services/conversations.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConversationListComponent } from './conversation-list/conversation-list.component';
import { ConversationWindowComponent } from './conversation-window/conversation-window.component';
import { AuthenticationService } from '../../services/authentication.service';
import { UserConversation } from '../../models/conversations/responses/user-conversations-response';


@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ConversationListComponent,
    ConversationWindowComponent,
  ],
  templateUrl: './conversations.component.html',
  styleUrl: './conversations.component.css',
})
export class ConversationsComponent implements OnInit {

  selectedConversation: UserConversation | null = null;
  unauthorized = false;
  conversations: UserConversation[] = [];

  constructor(private authService: AuthenticationService, private conversationsService: ConversationsService) { }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.unauthorized = true;
    }

    this.conversationsService.getUserConversations().subscribe({
      next: (list) => {
        this.conversations = list ?? [];
      },
      error: (err) => {
        if (err?.status === 401) {
          this.unauthorized = true;
        }
        console.error(err);
      },
    });
  }

  onConversationSelected(conversationId: number) {
    this.selectedConversation = this.conversations.find(c => c.id === conversationId) || null;
  }


}
