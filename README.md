# KAP Bildirim İzleme ve Filtreleme Modülü - Frontend

KAP bildirimlerinin görüntülenmesi, takip edilmesi ve kullanıcı tarafından belirlenen kriterlere göre filtrelenmesi amacıyla geliştirilen web arayüzüdür.

Frontend, **React + Vite** kullanılarak geliştirilmiş ve Spring Boot tabanlı backend servisiyle REST API üzerinden haberleşmektedir.

## Özellikler

- Kullanıcı giriş ekranı
- JWT tabanlı oturum yönetimi
- USER ve ADMIN rol desteği
- Güncel KAP bildirimlerinin listelenmesi
- Yeni bildirim kontrolü
- Bildirim detaylarına KAP üzerinden doğrudan erişim
- Şirket bilgilerine doğrudan erişim
- HİM bildirimlerinin tarih aralığına göre sorgulanması
- Şirket bazlı filtreleme
- Bildirim konusu bazlı filtreleme
- Konsolide / konsolide olmayan bildirim filtreleme
- Filtre oluşturma, kaydetme, yükleme ve silme
- Kullanıcı oturum bilgilerinin Zustand ile yönetilmesi
- Ant Design tabanlı modern ve responsive arayüz

## Kullanılan Teknolojiler

- React
- Vite
- JavaScript
- Ant Design
- Zustand
- React Router
- Fetch API
- CSS

## Uygulama Sayfaları

### Login

Kullanıcıların sisteme giriş yaptığı ekrandır.

Başarılı giriş sonucunda backend tarafından oluşturulan JWT token alınarak kullanıcı oturumu başlatılır.

### KAP Bildirimleri

Güncel KAP bildirimlerinin listelendiği ana ekrandır.

Kullanıcılar:

- Bildirimleri görüntüleyebilir
- İlgili KAP bildirim sayfasına erişebilir
- Şirket bilgilerini görüntüleyebilir
- Yeni gelen bildirimleri takip edebilir

### HİM Filtreleme

KAP bildirimlerinin daha detaylı kriterlere göre filtrelenmesini sağlar.

Filtreleme kriterleri arasında:

- Tarih aralığı
- Şirket
- Şirket tipi
- Bildirim konusu
- Konsolidasyon durumu

bulunmaktadır.

Oluşturulan filtreler kaydedilerek daha sonra tekrar kullanılabilir.

## Proje Yapısı

```text
src/
├── pages/
│   ├── Login.jsx
│   ├── Home.jsx
│   └── Him.jsx
│
├── store/
│   └── authStore.js
│
├── assets/
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

## Backend Bağlantısı

Frontend uygulaması Spring Boot ile geliştirilen backend servisiyle REST API üzerinden haberleşmektedir.

Geliştirme ortamında backend:

```text
http://localhost:8080
```

adresinde çalışmaktadır.

## Projeyi Çalıştırma

Projeyi klonladıktan sonra bağımlılıkları yükleyin:

```bash
npm install
```

Uygulamayı geliştirme modunda başlatın:

```bash
npm run dev
```

Vite tarafından oluşturulan geliştirme adresi üzerinden uygulamaya erişebilirsiniz.

## Güvenlik

- JWT token tabanlı authentication kullanılmaktadır.
- Kullanıcı rolü ve oturum bilgileri Zustand store içerisinde yönetilmektedir.
- Yetkisiz API istekleri backend tarafında Spring Security tarafından engellenmektedir.
- KAP Datafeed servislerine frontend üzerinden doğrudan erişim yapılmamaktadır.

## Backend Repository

Projenin Spring Boot backend uygulaması:

https://github.com/yusufplt4/kap-bildirim-izleme-backend
