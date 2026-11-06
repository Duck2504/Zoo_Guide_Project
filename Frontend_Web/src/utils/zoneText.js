// Chữ dùng chung cho khối "Quanh bạn" ở trang chủ, ngăn kéo khu và danh sách con vật trong khu.
const zoneText = {
  vi: {
    aroundTitle: 'Con vật quanh bạn',
    offText: 'Bật định vị, khi bạn bước vào một khu, danh sách con vật ở đó sẽ tự hiện ra.',
    turnOn: 'Bật định vị', turnOff: 'Tắt định vị',
    loading: 'Đang tải các khu trong vườn…', error: 'Chưa tải được các khu. Kiểm tra mạng rồi thử lại.',
    searching: 'Đang tìm vị trí của bạn…', searchingHint: 'Ra chỗ thoáng để GPS bắt nhanh hơn.',
    inaccurate: acc => `Vị trí chưa đủ chính xác (±${Math.round(acc)} m). Đang chờ GPS…`,
    denied: 'Bạn đã chặn quyền vị trí. Hãy cho phép trong cài đặt trình duyệt, hoặc quét mã QR ở chuồng.',
    unsupported: 'Trình duyệt này không hỗ trợ định vị. Hãy quét mã QR ở chuồng.',
    youAreIn: 'Bạn đang ở', species: n => `${n} loài`,
    nearest: 'Khu gần nhất', meters: d => `khoảng ${Math.round(d)} m`, showWay: 'Xem trên bản đồ',
    playAll: 'Nghe cả khu', stop: 'Dừng', nowPlaying: (i, n) => `Đang phát ${i}/${n}`,
    noAudioZone: 'Khu này chưa có thuyết minh bằng ngôn ngữ của bạn.', listened: 'Đã nghe',
    close: 'Đóng', openZone: 'Mở danh sách khu', demo: 'Chế độ thử: chạm bản đồ để đặt vị trí của bạn'
  },
  en: {
    aroundTitle: 'Animals around you',
    offText: 'Turn on location and the animals of each zone appear as you walk into it.',
    turnOn: 'Turn on location', turnOff: 'Turn off location',
    loading: 'Loading the zoo zones…', error: 'The zones could not be loaded. Check your connection and try again.',
    searching: 'Finding your location…', searchingHint: 'Step into the open so GPS can lock on faster.',
    inaccurate: acc => `Location not precise enough yet (±${Math.round(acc)} m). Waiting for GPS…`,
    denied: 'Location access is blocked. Allow it in your browser settings, or scan the QR code at an enclosure.',
    unsupported: 'This browser has no location support. Scan the QR code at an enclosure instead.',
    youAreIn: 'You are in', species: n => `${n} species`,
    nearest: 'Nearest zone', meters: d => `about ${Math.round(d)} m`, showWay: 'Show on map',
    playAll: 'Play whole zone', stop: 'Stop', nowPlaying: (i, n) => `Playing ${i}/${n}`,
    noAudioZone: 'This zone has no audio guide in your language yet.', listened: 'Listened',
    close: 'Close', openZone: 'Open zone list', demo: 'Demo mode: tap the map to set your position'
  },
  ko: {
    aroundTitle: '주변 동물',
    offText: '위치를 켜면 구역에 들어갈 때 그곳 동물 목록이 자동으로 나타납니다.',
    turnOn: '위치 켜기', turnOff: '위치 끄기',
    loading: '구역 정보를 불러오는 중…', error: '구역을 불러오지 못했습니다. 연결을 확인하고 다시 시도하세요.',
    searching: '위치를 찾는 중…', searchingHint: '트인 곳으로 가면 GPS가 더 빨리 잡힙니다.',
    inaccurate: acc => `위치가 아직 정확하지 않습니다 (±${Math.round(acc)} m). GPS를 기다리는 중…`,
    denied: '위치 권한이 차단되었습니다. 브라우저 설정에서 허용하거나 우리의 QR 코드를 스캔하세요.',
    unsupported: '이 브라우저는 위치를 지원하지 않습니다. 우리의 QR 코드를 스캔하세요.',
    youAreIn: '현재 위치', species: n => `${n}종`,
    nearest: '가장 가까운 구역', meters: d => `약 ${Math.round(d)} m`, showWay: '지도에서 보기',
    playAll: '구역 전체 듣기', stop: '정지', nowPlaying: (i, n) => `재생 중 ${i}/${n}`,
    noAudioZone: '이 구역에는 아직 해당 언어의 오디오 가이드가 없습니다.', listened: '들음',
    close: '닫기', openZone: '구역 목록 열기', demo: '데모 모드: 지도를 눌러 위치를 정하세요'
  },
  ja: {
    aroundTitle: '近くの動物',
    offText: '位置情報をオンにすると、エリアに入ったときにそこの動物一覧が表示されます。',
    turnOn: '位置情報をオン', turnOff: '位置情報をオフ',
    loading: 'エリアを読み込み中…', error: 'エリアを読み込めませんでした。接続を確認して再試行してください。',
    searching: '現在地を探しています…', searchingHint: '開けた場所に出るとGPSが早くつながります。',
    inaccurate: acc => `位置がまだ不正確です（±${Math.round(acc)} m）。GPSを待っています…`,
    denied: '位置情報がブロックされています。ブラウザの設定で許可するか、展示場のQRコードをスキャンしてください。',
    unsupported: 'このブラウザは位置情報に対応していません。展示場のQRコードをスキャンしてください。',
    youAreIn: '現在地', species: n => `${n}種`,
    nearest: '最寄りのエリア', meters: d => `約${Math.round(d)} m`, showWay: '地図で見る',
    playAll: 'エリアをまとめて聞く', stop: '停止', nowPlaying: (i, n) => `再生中 ${i}/${n}`,
    noAudioZone: 'このエリアにはまだあなたの言語の音声ガイドがありません。', listened: '聞いた',
    close: '閉じる', openZone: 'エリア一覧を開く', demo: 'デモモード：地図をタップして現在地を設定'
  },
  zh: {
    aroundTitle: '你附近的动物',
    offText: '开启定位后，走进某个区域时会自动显示那里的动物列表。',
    turnOn: '开启定位', turnOff: '关闭定位',
    loading: '正在加载园区区域…', error: '无法加载区域，请检查网络后重试。',
    searching: '正在查找你的位置…', searchingHint: '到开阔处GPS会更快定位。',
    inaccurate: acc => `位置还不够精确（±${Math.round(acc)} 米），正在等待GPS…`,
    denied: '位置权限被阻止。请在浏览器设置中允许，或扫描围栏处的二维码。',
    unsupported: '此浏览器不支持定位，请扫描围栏处的二维码。',
    youAreIn: '你在', species: n => `${n} 种`,
    nearest: '最近的区域', meters: d => `约 ${Math.round(d)} 米`, showWay: '在地图上查看',
    playAll: '收听整个区域', stop: '停止', nowPlaying: (i, n) => `正在播放 ${i}/${n}`,
    noAudioZone: '此区域暂无你的语言的语音导览。', listened: '已听',
    close: '关闭', openZone: '打开区域列表', demo: '演示模式：点击地图设置你的位置'
  }
};

export const getZoneText = lang => zoneText[lang] || zoneText.vi;
