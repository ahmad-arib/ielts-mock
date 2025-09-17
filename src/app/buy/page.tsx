import CheckoutForm from '@/components/CheckoutForm';

export default function BuyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 shadow-2xl shadow-blue-100/60 ring-1 ring-slate-100">
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
          Checkout
        </span>
        <h1 className="mt-6 text-3xl font-bold text-slate-900 sm:text-4xl">
          Secure your IELTS mock test seat
        </h1>
        <p className="mt-4 text-base text-slate-600">
          Complete your payment through Tripay. Once the transaction is confirmed as <strong>PAID</strong>,
          we email a unique login token that stays active for 14 days so you can take the full mock test when
          it fits your schedule.
        </p>
        <CheckoutForm className="mt-8" buttonLabel="Checkout securely" />
        <div className="mt-8 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">What happens after payment?</p>
          <ul className="mt-3 space-y-2">
            <li className="flex gap-2">
              <span className="mt-0.5 text-blue-500">•</span>
              <span>Look for an email from us containing your personal login token and quick start guide.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 text-blue-500">•</span>
              <span>Use the token within 14 days to access the IELTS mock test dashboard.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 text-blue-500">•</span>
              <span>Need help? Simply reply to the email—our team is ready to assist.</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
