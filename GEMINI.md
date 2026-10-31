# Project Memory & Architecture Rules

Bu proje sunucusuz (tamamen statik istemci taraflı - Client-Side SPA) olarak çalıştığı için dosya uzunluklarının şişmesini önlemek amacıyla aşağıdaki 3 kural kesin olarak uygulanır:

## 1. Veriyi Koddan Ayır (Data Separation)
* Statik veriler, senaryo metinleri, hikaye anıları (`detailedMemoir`), terminal logları, quiz soruları ve HTML şablonları doğrudan `.tsx` bileşenlerinin veya ana `.ts` dosyalarının içine yazılmaz.
* Tüm veri yapıları `src/data/` altında saf JSON (`.json`) veya özel veri modelleri olarak ayrıştırılır.
* Bileşenler sadece arayüz çizimi ve kullanıcı etkileşimiyle ilgilenir; veriyi import eder.
RXDB KULLAN
## 2. Component'lara Böl (Component Slicing & Modularization)
* Monolitik, 500+ satırlık "God Component" yapılarından kesinlikle kaçınılır.
* Büyük sayfalar (`LandingPage`, `App`, `TargetBrowser`, `CurriculumSidebar`) mantıksal küçük alt parçalara ayrılır:
  - Örnek: `LandingPage` &rarr; `StoryWheel`, `MemoirTerminal`, `CurriculumPreview`, `LandingFooter`.
  - Örnek: `App` &rarr; `ArenaHudBar`, `SolvedBanner`, `useArenaState`.
  - Örnek: `TargetBrowser` &rarr; `BrowserAddressBar`, `RepeaterPanel`, `NetworkConsole`.

## 3. Lazy Loading & Code Splitting Yap (Dynamic Imports)
* Ağır bileşenler, laboratuvar simülasyonları, modallar ve ikincil paneller `React.lazy()` ve dinamik `import()` ile yüklenir.
* Kullanıcı bir sayfayı veya laboratuvarı açmadığı sürece ilgili kod tarayıcıya indirilmez.
* Ana JavaScript paketi (vendor/index chunk) minimum boyutta tutulur.
