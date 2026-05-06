import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-admin-categories',
  imports: [FormsModule],
  template: `
    <div class="admin-page">
      <h1 class="admin-title">Categorii</h1>

      <div class="two-col">

        <!-- Grupuri principale -->
        <div class="section-card">
          <h2 class="section-title">Grupuri principale</h2>
          <div class="add-row">
            <input [(ngModel)]="newGroupName" placeholder="ex: Produse Software" class="input" (keydown.enter)="addGroup()" />
            <button class="btn-primary" (click)="addGroup()" [disabled]="!newGroupName.trim()">Adaugă</button>
          </div>
          <ul class="item-list">
            @for (g of groups(); track g.id) {
              <li class="item-row">
                @if (editingId() === g.id) {
                  <input class="input-inline" [(ngModel)]="editName" (keydown.enter)="saveEdit(g)" (keydown.escape)="cancelEdit()" />
                  <div class="row-actions">
                    <button class="btn-save" (click)="saveEdit(g)">✓</button>
                    <button class="btn-cancel-sm" (click)="cancelEdit()">✕</button>
                  </div>
                } @else {
                  <div class="item-info">
                    <span class="item-name">{{ g.name }}</span>
                    <span class="item-count">{{ childCount(g.id) }} subcategorii</span>
                  </div>
                  <div class="row-actions">
                    <button class="btn-edit-sm" (click)="startEdit(g)">✏</button>
                    <button class="btn-delete-sm" (click)="deleteGroup(g)">🗑</button>
                  </div>
                }
              </li>
            }
            @empty {
              <li class="empty-msg">Niciun grup. Adaugă primul grup.</li>
            }
          </ul>
        </div>

        <!-- Subcategorii -->
        <div class="section-card">
          <h2 class="section-title">Subcategorii</h2>
          <div class="add-row">
            <select [(ngModel)]="newSubParentId" class="input select-sm">
              <option [ngValue]="null">-- Grup --</option>
              @for (g of groups(); track g.id) {
                <option [ngValue]="g.id">{{ g.name }}</option>
              }
            </select>
            <input [(ngModel)]="newSubName" placeholder="Nume subcategorie" class="input" (keydown.enter)="addSub()" />
            <button class="btn-primary" (click)="addSub()" [disabled]="!newSubName.trim() || newSubParentId === null">Adaugă</button>
          </div>
          <ul class="item-list">
            @for (g of groups(); track g.id) {
              @for (sub of subcategoriesOf(g.id); track sub.id) {
                <li class="item-row sub-row">
                  <span class="group-tag">{{ g.name }}</span>
                  @if (editingId() === sub.id) {
                    <input class="input-inline" [(ngModel)]="editName" (keydown.enter)="saveEdit(sub)" (keydown.escape)="cancelEdit()" />
                    <div class="row-actions">
                      <button class="btn-save" (click)="saveEdit(sub)">✓</button>
                      <button class="btn-cancel-sm" (click)="cancelEdit()">✕</button>
                    </div>
                  } @else {
                    <span class="item-name sub-name">{{ sub.name }}</span>
                    <div class="row-actions">
                      <button class="btn-edit-sm" (click)="startEdit(sub)">✏</button>
                      <button class="btn-delete-sm" (click)="deleteSub(sub)">🗑</button>
                    </div>
                  }
                </li>
              }
            }
            @for (orphan of orphans(); track orphan.id) {
              <li class="item-row sub-row">
                <span class="group-tag ungrouped">Fără grup</span>
                <span class="item-name sub-name">{{ orphan.name }}</span>
                <div class="row-actions">
                  <button class="btn-edit-sm" (click)="startEdit(orphan)">✏</button>
                  <button class="btn-delete-sm" (click)="deleteSub(orphan)">🗑</button>
                </div>
              </li>
            }
            @if (allSubs().length === 0 && orphans().length === 0) {
              <li class="empty-msg">Nicio subcategorie.</li>
            }
          </ul>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .section-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 1.25rem; }
    .section-title { margin: 0 0 1rem; font-size: 1rem; font-weight: 600; }
    .add-row { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; }
    .input { padding: 0.55rem 0.8rem; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg); color: var(--color-text); font-size: 0.9rem; flex: 1; min-width: 0; }
    .select-sm { flex: 0 0 auto; width: 140px; }
    .input-inline { padding: 0.35rem 0.6rem; border: 1px solid var(--color-primary); border-radius: 6px; background: var(--color-bg); color: var(--color-text); font-size: 0.9rem; flex: 1; min-width: 0; }
    .item-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.4rem; }
    .item-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.55rem 0.75rem; border-radius: 8px; background: var(--color-bg); border: 1px solid var(--color-border); }
    .sub-row { font-size: 0.9rem; }
    .item-info { flex: 1; display: flex; flex-direction: column; }
    .item-name { font-weight: 500; font-size: 0.9rem; }
    .sub-name { flex: 1; }
    .item-count { font-size: 0.75rem; color: var(--color-text-secondary); }
    .group-tag { font-size: 0.72rem; background: color-mix(in srgb, var(--color-primary) 12%, transparent); color: var(--color-primary); border-radius: 4px; padding: 0.1rem 0.4rem; white-space: nowrap; flex-shrink: 0; }
    .group-tag.ungrouped { background: var(--color-border); color: var(--color-text-secondary); }
    .row-actions { display: flex; gap: 0.3rem; margin-left: auto; flex-shrink: 0; }
    .empty-msg { font-size: 0.85rem; color: var(--color-text-secondary); padding: 0.5rem 0; }
    .btn-primary { padding: 0.55rem 1rem; background: var(--color-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; white-space: nowrap; font-size: 0.9rem; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-edit-sm, .btn-delete-sm, .btn-save, .btn-cancel-sm { width: 28px; height: 28px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; }
    .btn-edit-sm { background: var(--color-border); color: var(--color-text); }
    .btn-delete-sm { background: #fee2e2; color: #dc2626; }
    .btn-save { background: #d1fae5; color: #065f46; }
    .btn-cancel-sm { background: var(--color-border); color: var(--color-text-secondary); }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  all = signal<Category[]>([]);

  groups = () => this.all().filter(c => !c.parentId);
  allSubs = () => this.all().filter(c => !!c.parentId);
  subcategoriesOf = (parentId: number) => this.all().filter(c => c.parentId === parentId);
  orphans = () => this.all().filter(c => c.parentId == null ? false : !this.groups().find(g => g.id === c.parentId));
  childCount = (parentId: number) => this.subcategoriesOf(parentId).length;

  newGroupName = '';
  newSubName = '';
  newSubParentId: number | null = null;
  editingId = signal<number | null>(null);
  editName = '';

  ngOnInit() { this.load(); }

  load() {
    this.adminService.getCategories().subscribe(c => this.all.set(c));
  }

  addGroup() {
    const name = this.newGroupName.trim();
    if (!name) return;
    this.adminService.createCategory(name).subscribe({
      next: () => { this.toast.success('Grup adăugat'); this.newGroupName = ''; this.load(); },
      error: () => this.toast.error('Eroare la adăugare')
    });
  }

  addSub() {
    const name = this.newSubName.trim();
    if (!name || this.newSubParentId === null) return;
    this.adminService.createCategoryWithParent(name, this.newSubParentId).subscribe({
      next: () => { this.toast.success('Subcategorie adăugată'); this.newSubName = ''; this.load(); },
      error: () => this.toast.error('Eroare la adăugare')
    });
  }

  startEdit(cat: Category) { this.editingId.set(cat.id); this.editName = cat.name; }
  cancelEdit() { this.editingId.set(null); this.editName = ''; }

  saveEdit(cat: Category) {
    const name = this.editName.trim();
    if (!name) return;
    this.adminService.updateCategory(cat.id, name).subscribe({
      next: () => { this.toast.success('Actualizat'); this.cancelEdit(); this.load(); },
      error: () => this.toast.error('Eroare la actualizare')
    });
  }

  deleteGroup(cat: Category) {
    if (!confirm(`Ștergi grupul "${cat.name}"? Subcategoriile vor rămâne fără grup.`)) return;
    this.adminService.deleteCategory(cat.id).subscribe({
      next: () => { this.toast.success('Grup șters'); this.load(); },
      error: () => this.toast.error('Eroare la ștergere')
    });
  }

  deleteSub(cat: Category) {
    if (!confirm(`Ștergi subcategoria "${cat.name}"?`)) return;
    this.adminService.deleteCategory(cat.id).subscribe({
      next: () => { this.toast.success('Subcategorie ștearsă'); this.load(); },
      error: () => this.toast.error('Eroare la ștergere')
    });
  }
}
