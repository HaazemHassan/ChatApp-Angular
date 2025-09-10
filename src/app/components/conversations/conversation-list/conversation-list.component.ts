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

  conversations = input.required<UserConversation[]>();
  @Input({ required: true }) others!: UserConversation[];
  conversationSelected = output<UserConversation>();
  searchChanged = output<string>();
  filteredConversations: UserConversation[] = [];
  selectedConversation: UserConversation | null = null;


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

  onSelectConversation(conversation: UserConversation) {
    this.selectedConversation = conversation;
    this.conversationSelected.emit(conversation);
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
      c.title.toLowerCase().includes(searchValue) || (c.type === ConversationType.Direct &&
        c.participants.some(p => p.userId !== this.authService.getCurrentUserId() && p.userName.toLowerCase().includes(searchValue))));


    if (searchValue == this.authService.getCurrentUser()?.userName.toLowerCase())
      return;

    var directConverationByUserName = this.filteredConversations.find(c =>
      c.type === ConversationType.Direct &&
      c.participants.some(p => p.userId !== this.authService.getCurrentUserId() && p.userName.toLowerCase() === searchValue)
    );


    if (!directConverationByUserName) {
      this.searchChanged.emit(searchValue);
    }
  }

  isSelected(conversation: UserConversation): boolean {
    if (this.selectedConversation?.id)
      return this.selectedConversation.id === conversation.id;

    if (this.selectedConversation)
      return this.selectedConversation === conversation;

    return false;
  }

}

