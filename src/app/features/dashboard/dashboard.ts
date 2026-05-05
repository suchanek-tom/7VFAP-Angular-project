import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Item } from '../../core/models/item.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);

  readonly currentUser = this.authService.currentUser;

  readonly items = signal<Item[]>([]);
  readonly isLoading = signal(true);

  readonly totalItems = computed(() => this.items().length);
  readonly recentItems = computed(() => {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 30);
    return this.items().filter(i => new Date(i.created_at) >= threshold).length;
  });
  readonly olderItems = computed(() => this.totalItems() - this.recentItems());

  readonly recentActivity = computed(() =>
    [...this.items()]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  );

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins  < 1)   return 'Just now';
    if (mins  < 60)  return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    if (hours < 24)  return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days  < 7)   return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(dateStr).toLocaleDateString('cs-CZ');
  }

  ngOnInit(): void {
    this.apiService.getItems().subscribe({
      next: items => {
        this.items.set(items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}