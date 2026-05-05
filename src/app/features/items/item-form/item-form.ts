import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Item } from '../../../core/models/item.model';

@Component({
  selector: 'app-item-form',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './item-form.html',
  styleUrl: './item-form.css',
})
export class ItemForm implements OnInit {
  private readonly fb         = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  private readonly router     = inject(Router);
  private readonly route      = inject(ActivatedRoute);
  private readonly snackBar   = inject(MatSnackBar);

  readonly isLoading  = signal(false);
  readonly isSaving   = signal(false);
  readonly isEditMode = signal(false);

  private editId: number | null = null;

  readonly itemForm = this.fb.group({
    name:        ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    created_at:  [null as Date | null, Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId = Number(id);
      this.isEditMode.set(true);
      this.loadItem(this.editId);
    } else {
      this.itemForm.patchValue({ created_at: new Date() });
    }
  }

  private loadItem(id: number): void {
    this.isLoading.set(true);
    this.apiService.getItem(id).subscribe({
      next: item => {
        this.itemForm.patchValue({
          name:        item.name,
          description: item.description,
          created_at:  item.created_at ? new Date(item.created_at) : null,
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open('Failed to load item.', 'Close', { duration: 3000 });
        this.isLoading.set(false);
        this.router.navigate(['/items']);
      },
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const raw = this.itemForm.getRawValue();

    const payload: Omit<Item, 'id'> = {
      name:        raw.name!,
      description: raw.description!,
      created_at:  (raw.created_at as Date).toISOString(),
    };

    const request$ = this.isEditMode()
      ? this.apiService.updateItem(this.editId!, { ...payload, id: this.editId! })
      : this.apiService.createItem(payload);

    request$.subscribe({
      next: () => {
        const msg = this.isEditMode() ? 'Item updated successfully.' : 'Item created successfully.';
        this.snackBar.open(msg, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.router.navigate(['/items']);
      },
      error: () => {
        this.snackBar.open('Failed to save item. Please try again.', 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar'],
        });
        this.isSaving.set(false);
      },
    });
  }

  getFieldError(field: string): string {
    const control = this.itemForm.get(field);
    if (!control) return '';
    if (control.hasError('required')) return 'This field is required.';
    if (control.hasError('maxlength')) {
      const req = control.errors!['maxlength'].requiredLength as number;
      return `Maximum ${req} characters allowed.`;
    }
    return '';
  }
}
