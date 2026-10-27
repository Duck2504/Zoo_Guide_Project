/**
 * QR Scanner Controller for Visitor
 * Supports camera QR scanning & simulation selector (PRD FR-01, US-01)
 */
import { VisitorApi } from '../api/visitor-api.js';

class VisitorQrScanner {
  constructor() {
    this.videoStream = null;
    this.onScanSuccess = null;
  }

  init(onScanSuccess) {
    this.onScanSuccess = onScanSuccess;
  }

  openModal(animals) {
    const modal = document.getElementById('qr-scan-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const container = document.getElementById('qr-scan-interactive-box');
    if (container) {
      container.innerHTML = `
        <div class="w-full h-full flex flex-col items-center justify-center p-4 text-center">
          <div class="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-2 animate-bounce">
            📷
          </div>
          <h4 class="text-sm font-extrabold text-white">Quét Mã QR Tại Chuồng Thú</h4>
          <p class="text-[11px] text-slate-400 mt-1 max-w-xs">
            Hướng camera vào mã QR gắn trên biển thông tin để mở ngay bài thuyết minh.
          </p>

          <div class="mt-4 w-full">
            <p class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Hoặc chọn nhanh chuồng thú mô phỏng:</p>
            <div class="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto custom-scrollbar">
              ${(animals || []).map(a => `
                <button type="button" data-animal-id="${a.id}" class="btn-simulate-qr p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white text-xs font-bold truncate transition text-left flex items-center space-x-1.5">
                  <span>${a.icon || '🐾'}</span>
                  <span class="truncate">${a.name}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      // Bind simulate click events
      container.querySelectorAll('.btn-simulate-qr').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-animal-id');
          this.handleQrResult(`/a/${id}`);
        });
      });
    }
  }

  closeModal() {
    const modal = document.getElementById('qr-scan-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    this.stopCamera();
  }

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
  }

  handleQrResult(decodedText) {
    this.closeModal();

    // Parse URL format: /a/{id} or ?id={id}
    let animalId = null;
    if (decodedText.includes('/a/')) {
      const parts = decodedText.split('/a/');
      animalId = parts[1]?.split('?')[0];
    } else {
      const match = decodedText.match(/id=([0-9]+)/i);
      if (match) animalId = match[1];
    }

    if (!animalId && !isNaN(decodedText)) {
      animalId = decodedText;
    }

    if (animalId && this.onScanSuccess) {
      this.onScanSuccess(Number(animalId));
    } else {
      alert(`Mã QR không hợp lệ: "${decodedText}"`);
    }
  }
}

export const visitorQrScanner = new VisitorQrScanner();
