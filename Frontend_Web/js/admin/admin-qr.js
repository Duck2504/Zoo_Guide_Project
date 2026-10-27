/**
 * Admin QR Signage Studio Controller
 * Generates QR codes, signage plate preview, single PNG download & batch zone printing (PRD FR-16, US-14)
 */
import { adminState } from './admin-state.js';

class AdminQr {
  constructor() {
    this.qrInstance = null;
  }

  init() {
    this.bindEvents();
  }

  generateQrForAnimal(animal) {
    if (!animal) return;
    const qrContainer = document.getElementById('signage-qr-canvas');
    if (!qrContainer) return;

    qrContainer.innerHTML = '';
    const qrDestination = new URL('./index.html', window.location.href);
    qrDestination.searchParams.set('animalId', animal.id);
    const qrUrl = qrDestination.href;

    // Render QRCode
    if (typeof QRCode !== 'undefined') {
      this.qrInstance = new QRCode(qrContainer, {
        text: qrUrl,
        width: 160,
        height: 160,
        colorDark: '#022c22',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H,
      });
    }

    // Update Signage Plate Information
    const titleEl = document.getElementById('plate-animal-name');
    const sciEl = document.getElementById('plate-animal-sciname');
    const zoneEl = document.getElementById('plate-animal-zone');
    const urlEl = document.getElementById('plate-qr-url');

    if (titleEl) titleEl.innerText = animal.defaultLocalName || animal.name;
    if (sciEl) sciEl.innerText = animal.scientificName || '';
    if (zoneEl) zoneEl.innerText = animal.zoneName || animal.zone || 'Thảo Cầm Viên Sài Gòn';
    if (urlEl) urlEl.innerText = qrUrl;
  }

  downloadSinglePng() {
    const qrContainer = document.getElementById('signage-qr-canvas');
    const img = qrContainer?.querySelector('img') || qrContainer?.querySelector('canvas');
    if (!img) return alert('Chưa tạo được ảnh mã QR.');

    const animalName = document.getElementById('plate-animal-name')?.innerText || 'animal';
    const link = document.createElement('a');
    link.download = `QR_${animalName.replace(/\s+/g, '_')}.png`;
    link.href = img.src || (img.toDataURL ? img.toDataURL('image/png') : '');
    link.click();
  }

  printBatchSignage() {
    const { animals, zones } = adminState.get();
    if (!animals.length) return alert('Chưa có động vật để in mã QR.');
    if (typeof QRCode === 'undefined') return alert('Thư viện tạo QR chưa tải được. Hãy kiểm tra kết nối Internet rồi thử lại.');

    const zoneNames = new Map(zones.map(zone => [Number(zone.id), zone.zoneCode]));
    const printContainer = document.getElementById('admin-print-batch');
    printContainer.innerHTML = animals.map((animal, index) => `
      <article class="batch-signage-card">
        <h1>THẢO CẦM VIÊN SÀI GÒN</h1>
        <h2>${this.escapeHtml(animal.defaultLocalName || animal.name)}</h2>
        <p><em>${this.escapeHtml(animal.scientificName || '')}</em></p>
        <p>${this.escapeHtml(zoneNames.get(Number(animal.zoneId)) || animal.zoneName || '')}</p>
        <div id="batch-qr-${index}" class="batch-qr"></div>
        <p>Quét mã QR để mở trang thuyết minh.</p>
      </article>
    `).join('');

    animals.forEach((animal, index) => {
      const destination = new URL('./index.html', window.location.href);
      destination.searchParams.set('animalId', animal.id);
      new QRCode(document.getElementById(`batch-qr-${index}`), {
        text: destination.href,
        width: 180,
        height: 180,
        colorDark: '#022c22',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    });

    printContainer.classList.remove('hidden');
    const cleanup = () => {
      printContainer.classList.add('hidden');
      printContainer.innerHTML = '';
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.setTimeout(() => window.print(), 150);
  }

  escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  bindEvents() {
    const sel = document.getElementById('signage-animal-select');
    if (sel) {
      sel.addEventListener('change', (e) => {
        const id = Number(e.target.value);
        const { animals } = adminState.get();
        const animal = animals.find(a => Number(a.id) === id);
        if (animal) {
          this.generateQrForAnimal(animal);
        } else {
          document.getElementById('signage-qr-canvas').innerHTML = '';
          document.getElementById('plate-animal-name').innerText = '--';
          document.getElementById('plate-animal-sciname').innerText = '--';
          document.getElementById('plate-animal-zone').innerText = '--';
          document.getElementById('plate-qr-url').innerText = '--';
        }
      });
    }

    const btnDownload = document.getElementById('btn-download-qr');
    if (btnDownload) {
      btnDownload.addEventListener('click', () => this.downloadSinglePng());
    }

    const btnPrint = document.getElementById('btn-print-batch-qr');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => this.printBatchSignage());
    }
  }
}

export const adminQr = new AdminQr();
