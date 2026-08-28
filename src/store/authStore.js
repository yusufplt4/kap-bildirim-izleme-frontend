import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      // Backend'den login sonrası aldığımız JWT token.
      // API isteklerinde Authorization header'ında kullanıyoruz.
      token: null,

      // Giriş yapan kullanıcının rolü.
      // Örneğin: USER veya ADMIN.
      // UI'da hangi alanların gösterileceğini buna göre belirliyoruz.
      role: null,

      // Giriş yapan kullanıcıyla ilgili bilgileri tek bir obje içinde tutuyoruz.
      user: {
        userName: null,
        companyName: null,
      },

      // Login başarılı olduğunda çağırıyoruz.
      // Token, rol ve kullanıcı bilgilerini store içine kaydediyor.
      setAuth: (token, role, user) =>
        set({
          token: token,
          role: role,
          user: user,
        }),

      // Kullanıcı çıkış yaptığında store'daki giriş bilgilerini temizliyoruz.
      logout: () =>
        set({
          token: null,
          role: null,
          user: {
            userName: null,
            companyName: null,
          },
        }),
    }),

    {
      // persist sayesinde store'daki veriler tarayıcı storage'ına kaydedilir.
      // Sayfa yenilense bile Zustand bu verileri tekrar storage'dan okuyabilir.
      //
      // "auth-storage" localStorage içinde kullanılacak key'in ismidir.
      name: "auth-storage",
    },
  ),
);
