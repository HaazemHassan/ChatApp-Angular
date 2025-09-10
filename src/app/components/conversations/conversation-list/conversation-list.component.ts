import { CommonModule } from '@angular/common';
import { UserConversation } from '../../../models/conversations/responses/user-conversations-response';
import { ConversationItemComponent } from '../conversation-item/conversation-item.component';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConversationType } from '../../../enums/conversation-type';
import { AuthenticationService } from '../../../services/authentication.service';
import { Component, DestroyRef, effect, Input, input, output } from '@angular/core';


@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ConversationItemComponent],
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.css',
})
export class ConversationListComponent {

  conversationSelected = output<number>();
  searchChanged = output<string>();
  conversations = input.required<UserConversation[]>();
  filteredConversations: UserConversation[] = [];
  @Input({ required: true }) others!: UserConversation[];


  selectedConversationId: number | null = null;
  selectedOthersConversation: UserConversation | null = null;
  othersConversationSelected = output<UserConversation>();

  error: string | null = null;


  private searchSubject = new Subject<string>();

  constructor(private destroyRef: DestroyRef, private authService: AuthenticationService) {
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(searchValue => {
      this.filterConversations(searchValue);
    });


    effect(() => {
      const convs = this.conversations();
      if (convs) {
        this.filteredConversations = [...convs];
      }
    });
  }

  onSelectConversation(conversationId: number) {
    this.selectedConversationId = conversationId;
    this.selectedOthersConversation = null
    this.conversationSelected.emit(conversationId);
  }

  onSelectOthersConversation(conversation: UserConversation) {
    this.selectedOthersConversation = conversation;
    this.selectedConversationId = null;
    this.othersConversationSelected.emit(conversation);
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const searchValue = target.value.trim().toLowerCase();
    this.searchSubject.next(searchValue);
  }

  private filterConversations(searchValue: string) {
    if (!searchValue) {
      this.filteredConversations = [...this.conversations()];
      this.others = [];
      return;
    }

    this.filteredConversations = this.conversations().filter(c =>
      c.title.toLowerCase().includes(searchValue));

    var directConverationByUserName = this.conversations().find(c =>
      c.type === ConversationType.Direct &&
      c.participants.some(p => p.userId !== this.authService.getCurrentUserId() && p.userName.toLowerCase() === searchValue)
    );

    if (directConverationByUserName) {
      if (!this.filteredConversations.includes(directConverationByUserName))
        this.filteredConversations.push(directConverationByUserName);
    }
    else if (searchValue !== this.authService.getCurrentUser()?.userName.toLowerCase()) {
      this.searchChanged.emit(searchValue);
    }
  }

  isSelected(conversation: UserConversation): boolean {
    if (this.selectedConversationId)
      return this.selectedConversationId === conversation.id;

    if (this.selectedOthersConversation)
      return this.selectedOthersConversation === conversation;

    return false;
  }

}

