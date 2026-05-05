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