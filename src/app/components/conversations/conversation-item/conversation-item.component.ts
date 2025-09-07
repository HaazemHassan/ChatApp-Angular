import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-conversation-item',
  standalone: true,
  imports: [],
  templateUrl: './conversation-item.component.html',
  styleUrl: './conversation-item.component.css',
})
export class ConversationItemComponent {
  conversationId = input.required<number>();
  conversationTitle = input.required<string>();
  isSelected = input<boolean>(false);
  selected = output<number>();

  onSelect() {
    this.selected.emit(this.conversationId());
  }

  // Get initials from the title (first letter of up to two words)
  extractInitialsFromTitle(title: string | null | undefined): string {
    if (!title) return '?';
    const parts = title.trim().split(' ').slice(0, 2);
    return parts
      .map((p) => p.charAt(0))
      .join('')
      .toUpperCase();
  }
}
