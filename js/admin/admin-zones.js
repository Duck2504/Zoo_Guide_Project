/**
 * Admin Zones Controller (CRUD Zone)
 * Validates latitude, longitude, radius > 0 (PRD FR-12, FR-18, US-12)
 */
import { AdminApi } from '../api/admin-api.js';
import { adminState } from './admin-state.js';
import { adminMapPicker } from './admin-map-picker.js';
import { adminAnimals } from './admin-animals.js';

class AdminZones {
  init() {
    this.bindEvents();
  }

  async loadZones() {
    try {
      const zones = await AdminApi.getZones();
      adminState.set({ zones });
      this.renderZonesDropdown(zones);
      this.renderZonesTable(zones);
    } catch (err) {
      console.warn('Lỗi khi tải danh sách Zone:', err.message);
      adminState.set({ zones: [] });
      this.renderZonesDropdown([]);
      this.renderZonesTable([]);
    }
  }

  renderZonesDropdown(zones) {
    const cZone = document.getElementById('c-zone');
    if (cZone) {
      cZone.innerHTML = zones.length > 0 ? zones.map(z => `
        <option value="${this.escapeHtml(z.zoneCode)}" data-zone-id="${z.id}" data-lat="${z.latitude}" data-lng="${z.longitude}" data-radius="${z.radius}">
          ${this.escapeHtml(z.zoneCode)} (${z.radius}m)
        </option>
      `).join('') : '<option value="">Chưa có khu vực nào</option>';
    }

    const filterZone = document.getElementById('filter-animal-zone');
    if (filterZone) {
      filterZone.innerHTML = '<option value="">Tất cả các khu vực (Zone)</option>' +
        zones.map(z => `<option value="${z.id}">${this.escapeHtml(z.zoneCode)}</option>`).join('');
    }
  }

  renderZonesTable(zones) {
    const zoneCount = document.getElementById('kpi-total-zones');
    if (zoneCount) zoneCount.textContent = `${zones?.length || 0} Zones`;

    const tableBody = document.getElementById('admin-zones-tbody');
    if (!tableBody) return;

    if (!zones || zones.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-xs text-slate-500">Chưa có dữ liệu Khu vực (Zone).</td></tr>`;
      return;
    }

    tableBody.innerHTML = zones.map(z => `
      <tr class="border-b border-slate-800 text-xs">
        <td class="p-3 font-bold text-white">${this.escapeHtml(z.zoneCode)}</td>
        <td class="p-3 text-slate-400 font-mono">${Number(z.latitude).toFixed(4)}, ${Number(z.longitude).toFixed(4)}</td>
        <td class="p-3 text-emerald-400 font-bold">${z.radius} mét</td>
        <td class="p-3 text-slate-400 max-w-xs truncate">${this.escapeHtml(z.description || 'Chưa có mô tả')}</td>
        <td class="p-3 text-right">
          <div class="flex justify-end gap-1.5">
          <button type="button" data-zone-id="${z.id}" class="btn-edit-zone py-1 px-2.5 rounded-lg bg-sky-500/20 hover:bg-sky-500 text-sky-400 hover:text-white font-bold transition" title="Sửa khu vực">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button type="button" data-zone-id="${z.id}" class="btn-delete-zone py-1 px-2.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white font-bold transition">
            <i class="fa-solid fa-trash"></i>
          </button>
          </div>
        </td>
      </tr>
    `).join('');

    tableBody.querySelectorAll('.btn-edit-zone').forEach(btn => {
      btn.addEventListener('click', () => this.openEditModal(Number(btn.dataset.zoneId)));
    });

    tableBody.querySelectorAll('.btn-delete-zone').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-zone-id'));
        this.deleteZone(id);
      });
    });
  }

  escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  openEditModal(id) {
    const zone = adminState.get().zones.find(item => Number(item.id) === id);
    if (!zone) return;
    document.getElementById('edit-zone-id').value = zone.id;
    document.getElementById('edit-zone-code').value = zone.zoneCode || '';
    document.getElementById('edit-zone-latitude').value = zone.latitude;
    document.getElementById('edit-zone-longitude').value = zone.longitude;
    document.getElementById('edit-zone-radius').value = zone.radius;
    document.getElementById('edit-zone-description').value = zone.description || '';
    const modal = document.getElementById('edit-zone-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  async deleteZone(id) {
    const animalCount = adminState.get().animals.filter(animal => Number(animal.zoneId) === id).length;
    const consequence = animalCount
      ? ` ${animalCount} động vật và nội dung liên quan thuộc khu vực này cũng sẽ bị xóa.`
      : '';
    if (!confirm(`Xóa khu vực này?${consequence}`)) return;
    try {
      await AdminApi.deleteZone(id);
      alert('Đã xóa khu vực thành công!');
      await this.loadZones();
      await adminAnimals.loadAnimals();
      adminMapPicker.initOverviewMap('admin-overview-map', adminState.get().zones);
    } catch (err) {
      alert(`Không thể xóa khu vực: ${err.message}`);
    }
  }

  bindEvents() {
    const editForm = document.getElementById('edit-zone-form');
    editForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const id = Number(document.getElementById('edit-zone-id').value);
      const zoneCode = document.getElementById('edit-zone-code').value.trim();
      const latitude = Number(document.getElementById('edit-zone-latitude').value);
      const longitude = Number(document.getElementById('edit-zone-longitude').value);
      const radius = Number(document.getElementById('edit-zone-radius').value);
      const description = document.getElementById('edit-zone-description').value.trim();
      if (!zoneCode || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
          !Number.isFinite(longitude) || longitude < -180 || longitude > 180 ||
          !Number.isInteger(radius) || radius < 1 || radius > 100000) {
        alert('Vui lòng kiểm tra tên khu vực, tọa độ và bán kính.');
        return;
      }
      try {
        await AdminApi.updateZone(id, { zoneCode, latitude, longitude, radius, description });
        document.getElementById('edit-zone-modal').classList.add('hidden');
        document.getElementById('edit-zone-modal').classList.remove('flex');
        await this.loadZones();
        await adminAnimals.loadAnimals();
        adminMapPicker.initOverviewMap('admin-overview-map', adminState.get().zones);
        alert('Đã cập nhật khu vực.');
      } catch (err) {
        alert(`Không thể cập nhật khu vực: ${err.message}`);
      }
    });

    const zoneForm = document.getElementById('form-create-zone');
    if (zoneForm) {
      zoneForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('zone-name-input')?.value.trim();
        const lat = parseFloat(document.getElementById('c-latitude')?.value);
        const lng = parseFloat(document.getElementById('c-longitude')?.value);
        const rad = parseInt(document.getElementById('c-radius')?.value);
        const desc = document.getElementById('zone-desc-input')?.value.trim();

        // PRD FR-18 Validation
        if (!code) return alert('Vui lòng nhập tên khu vực');
        if (isNaN(lat) || lat < -90 || lat > 90) return alert('Vĩ độ không hợp lệ [-90, 90]');
        if (isNaN(lng) || lng < -180 || lng > 180) return alert('Kinh độ không hợp lệ [-180, 180]');
        if (isNaN(rad) || rad <= 0) return alert('Bán kính phải lớn hơn 0 mét');

        try {
          await AdminApi.createZone({
            zoneCode: code,
            latitude: lat,
            longitude: lng,
            radius: rad,
            description: desc || ''
          });
          alert('Tạo Khu Vực (Zone) mới thành công!');
          zoneForm.reset();
          await this.loadZones();
          adminMapPicker.initOverviewMap('admin-overview-map', adminState.get().zones);
        } catch (err) {
          alert(`Lỗi tạo Zone: ${err.message}`);
        }
      });
    }
  }
}

export const adminZones = new AdminZones();
