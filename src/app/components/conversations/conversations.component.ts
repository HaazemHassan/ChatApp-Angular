import { Participant, UserConversation } from './../../models/conversations/responses/user-conversations-response';
import { ConversationsService } from './../../services/conversations.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ConversationListComponent } from './conversation-list/conversation-list.component';
import { ConversationWindowComponent } from './conversation-window/conversation-window.component';
import { AuthenticationService } from '../../services/authentication.service';
import { ConversationType } from '../../enums/conversation-type';
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
  conversations: UserConversation[] = [];
  others: UserConversation[] = [];

  constructor(private authService: AuthenticationService, private conversationsService: ConversationsService) { }

  ngOnInit(): void {
    this.conversationsService.getUserConversations().subscribe({
      next: (list) => {
        this.conversations = list ?? [];
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onConversationSelected(conversation: UserConversation) {
    this.selectedConversation = conversation;
  }


  onSearchChanged(searchValue: string) {

    this.others = [];
    this.conversationsService.getUserByUsername(searchValue).subscribe({
      next: (user) => {
        if (user) {
          const currentUser = this.authService.getCurrentUser();
          const participant1: Participant = {
            userId: currentUser!.id,
            userName: currentUser!.userName,
            fullName: currentUser!.fullName
          }

          const participant2: Participant = {
            userId: user.id,
            userName: user.userName,
            fullName: user.fullName
          }

          const conversation: UserConversation = {
            title: user.fullName,
            type: ConversationType.Direct,
            lastMessageAt: null,
            participants: [participant1, participant2]
          };
          this.others = [conversation];
        }
      },
      error: (error) => {
      }
    });
  }
}
