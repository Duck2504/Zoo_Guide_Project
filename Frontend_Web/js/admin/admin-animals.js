/**
 * Admin Animals Controller (CRUD Animal) (PRD FR-13, US-13)
 */
import { AdminApi } from '../api/admin-api.js';
import { adminState } from './admin-state.js';

class AdminAnimals {
  init() {
    this.bindEvents();
  }

  async loadAnimals() {
    try {
      const animals = await AdminApi.getAnimals();
      adminState.set({ animals });
      this.renderAnimalsTable(animals);
      this.populateSelects(animals);
    } catch (err) {
      console.warn('Lỗi khi tải danh sách động vật:', err.message);
    }
  }

  populateSelects(animals) {
    const contentSel = document.getElementById('content-animal-select');
    if (contentSel && animals) {
      const previousValue = contentSel.value;
      contentSel.innerHTML = '<option value="">-- Chọn động vật cần soạn nội dung --</option>' +
        animals.map(a => `<option value="${a.id}">${this.escapeHtml(a.defaultLocalName || a.name)} (${this.escapeHtml(a.scientificName || 'N/A')})</option>`).join('');
      if (animals.some(animal => String(animal.id) === previousValue)) {
        contentSel.value = previousValue;
      } else if (previousValue) {
        contentSel.value = '';
        contentSel.dispatchEvent(new Event('change'));
      }
    }

    const signageSel = document.getElementById('signage-animal-select');
    if (signageSel && animals) {
      signageSel.innerHTML = animals.length
        ? animals.map(a => `<option value="${a.id}">${this.escapeHtml(a.defaultLocalName || a.name)}</option>`).join('')
        : '<option value="">Chưa có động vật</option>';
      signageSel.dispatchEvent(new Event('change'));
    }
  }

  escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  renderAnimalsTable(animals) {
    const tbody = document.getElementById('admin-animals-tbody');
    if (!tbody) return;

    const { zones } = adminState.get();
    const zoneMap = new Map((zones || []).map(z => [z.id, z.zoneCode]));

    if (!animals || animals.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-xs text-slate-500">Chưa có dữ liệu động vật trong cơ sở dữ liệu.</td></tr>`;
      return;
    }

    tbody.innerHTML = animals.map(a => {
      const zoneName = zoneMap.get(a.zoneId) || a.zone || 'Chưa phân khu';
      return `
        <tr class="border-b border-slate-800 text-xs">
          <td class="p-3">
            ${a.avatarUrl ? `<img src="${this.escapeHtml(a.avatarUrl)}" class="w-10 h-10 rounded-xl object-cover border border-slate-700" alt="${this.escapeHtml(a.name)}" />` : '<span class="text-slate-500">Chưa có ảnh</span>'}
          </td>
          <td class="p-3">
            <div class="font-extrabold text-white text-sm">${this.escapeHtml(a.defaultLocalName || a.name)}</div>
            <div class="text-[11px] text-slate-400 italic">${this.escapeHtml(a.scientificName || 'Chưa có tên khoa học')}</div>
          </td>
          <td class="p-3">
            <span class="px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 font-bold border border-emerald-500/20">${this.escapeHtml(zoneName)}</span>
          </td>
          <td class="p-3 text-slate-400 max-w-xs truncate">${this.escapeHtml(a.scriptText || a.narrative || 'Chưa có bài thuyết minh')}</td>
          <td class="p-3 text-right">
            <div class="flex items-center justify-end space-x-1.5">
              <button type="button" data-animal-id="${a.id}" class="btn-edit-content py-1 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold transition">
                <i class="fa-solid fa-language mr-1"></i> Nội dung
              </button>
              <button type="button" data-animal-id="${a.id}" class="btn-edit-animal py-1 px-2.5 rounded-lg bg-sky-500/20 hover:bg-sky-500 text-sky-400 hover:text-white font-bold transition" title="Sửa thông tin động vật">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" data-animal-id="${a.id}" class="btn-delete-animal py-1 px-2.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white font-bold transition">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach actions
    tbody.querySelectorAll('.btn-edit-content').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-animal-id'));
        const sel = document.getElementById('content-animal-select');
        if (sel) {
          sel.value = id;
          sel.dispatchEvent(new Event('change'));
        }
        // Switch to multilingual tab
        const tabBtn = document.getElementById('tab-btn-multilingual');
        if (tabBtn) tabBtn.click();
      });
    });

    tbody.querySelectorAll('.btn-edit-animal').forEach(btn => {
      btn.addEventListener('click', () => this.openEditModal(Number(btn.dataset.animalId)));
    });

    tbody.querySelectorAll('.btn-delete-animal').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-animal-id'));
        this.deleteAnimal(id);
      });
    });
  }

  openEditModal(id) {
    const { animals, zones } = adminState.get();
    const animal = animals.find(item => Number(item.id) === id);
    if (!animal) return;
    document.getElementById('edit-animal-id').value = animal.id;
    document.getElementById('edit-animal-name').value = animal.defaultLocalName || animal.name || '';
    document.getElementById('edit-animal-scientific-name').value = animal.scientificName || '';
    document.getElementById('edit-animal-avatar').value = animal.avatarUrl || '';
    document.getElementById('edit-animal-script').value = animal.scriptText || animal.descriptionVi || '';
    const zoneSelect = document.getElementById('edit-animal-zone');
    zoneSelect.innerHTML = zones.map(zone =>
      `<option value="${zone.id}">${this.escapeHtml(zone.zoneCode)}</option>`
    ).join('');
    zoneSelect.value = String(animal.zoneId);
    const modal = document.getElementById('edit-animal-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  async deleteAnimal(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa loài thú này cùng toàn bộ bài thuyết minh liên quan?')) return;
    try {
      await AdminApi.deleteAnimal(id);
      alert('Đã xóa động vật thành công!');
      window.dispatchEvent(new CustomEvent('admin:animal-deleted', { detail: id }));
      await this.loadAnimals();
    } catch (err) {
      alert(`Không thể xóa động vật: ${err.message}`);
    }
  }

  bindEvents() {
    const editForm = document.getElementById('edit-animal-form');
    editForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const id = Number(document.getElementById('edit-animal-id').value);
      const defaultLocalName = document.getElementById('edit-animal-name').value.trim();
      const scientificName = document.getElementById('edit-animal-scientific-name').value.trim();
      const zoneId = Number(document.getElementById('edit-animal-zone').value);
      const avatarUrl = document.getElementById('edit-animal-avatar').value.trim();
      const scriptText = document.getElementById('edit-animal-script').value.trim();
      if (!defaultLocalName || !scientificName || !Number.isInteger(zoneId) || !scriptText) {
        alert('Vui lòng nhập đầy đủ tên, khu vực và bài thuyết minh.');
        return;
      }
      try {
        await AdminApi.updateAnimal(id, { defaultLocalName, scientificName, zoneId, avatarUrl, scriptText });
        const modal = document.getElementById('edit-animal-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        await this.loadAnimals();
        alert('Đã cập nhật thông tin động vật.');
      } catch (err) {
        alert(`Không thể cập nhật động vật: ${err.message}`);
      }
    });

    const form = document.getElementById('form-create-animal');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('c-name')?.value.trim();
        const sciname = document.getElementById('c-sciname')?.value.trim();
        const zoneSel = document.getElementById('c-zone');
        const zoneId = Number(zoneSel?.options[zoneSel.selectedIndex]?.getAttribute('data-zone-id'));
        const avatarUrl = document.getElementById('c-img')?.value.trim();
        const scriptVi = document.getElementById('c-script-vi')?.value.trim();

        if (!name) return alert('Vui lòng nhập tên động vật');
        if (!Number.isInteger(zoneId) || zoneId < 1) return alert('Vui lòng tạo và chọn khu vực hợp lệ trước.');
        if (!scriptVi) return alert('Vui lòng nhập bài thuyết minh tiếng Việt.');

        try {
          await AdminApi.createAnimal({
            defaultLocalName: name,
            scientificName: sciname || '',
            zoneId: Number(zoneId),
            avatarUrl: avatarUrl || '',
            scriptText: scriptVi,
            languageCode: 'vi'
          });
          alert('Tạo Động Vật mới thành công!');
          form.reset();
          await this.loadAnimals();
        } catch (err) {
          alert(`Lỗi tạo động vật: ${err.message}`);
        }
      });
    }

    const filterZone = document.getElementById('filter-animal-zone');
    if (filterZone) {
      filterZone.addEventListener('change', (e) => {
        const zoneId = e.target.value;
        const { animals } = adminState.get();
        if (!zoneId) {
          this.renderAnimalsTable(animals);
        } else {
          const filtered = animals.filter(a => Number(a.zoneId) === Number(zoneId));
          this.renderAnimalsTable(filtered);
        }
      });
    }
  }
}

export const adminAnimals = new AdminAnimals();
