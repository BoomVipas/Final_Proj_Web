export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-base px-6 py-10 text-text-primary">
      <section className="w-full max-w-xl rounded-xl border border-border bg-bg-surface p-8 shadow-card">
        <h1 className="m-0 text-[28px] font-bold">เข้าสู่ระบบ MedCare</h1>
        <p className="mt-3 text-lg text-text-secondary">
          สำหรับพยาบาลและผู้ดูแลระบบสถานดูแลผู้สูงอายุ
        </p>

        <form className="mt-8 space-y-5">
          <label className="block text-base font-semibold text-text-primary">
            อีเมล
            <input
              type="email"
              placeholder="name@facility.co.th"
              className="mt-2 block min-h-12 w-full rounded-lg border border-border bg-bg-base px-4 text-base text-text-primary placeholder:text-text-muted"
            />
          </label>

          <label className="block text-base font-semibold text-text-primary">
            รหัสผ่าน
            <input
              type="password"
              placeholder="••••••••"
              className="mt-2 block min-h-12 w-full rounded-lg border border-border bg-bg-base px-4 text-base text-text-primary placeholder:text-text-muted"
            />
          </label>

          <button
            type="button"
            className="min-h-12 w-full rounded-lg border border-primary bg-primary px-5 text-lg font-bold text-bg-base transition hover:bg-primary-dark"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </section>
    </main>
  );
}
