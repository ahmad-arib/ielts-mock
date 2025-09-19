import CheckoutForm from '@/components/CheckoutForm';
import InterestForm from '@/components/InterestForm';
import Link from 'next/link';

const features = [
  {
    title: 'Real-time IELTS Try Out',
    description:
      'Follow the official exam timing while completing Listening and Reading modules from home or on the go.',
  },
  {
    title: 'Invest less than 5% of the real fee',
    description:
      'Official IELTS registrations in Indonesia exceed IDR 3,000,000. This try out costs just IDR 149,000 so you can test yourself without the pressure of the full fee.',
  },
  {
    title: 'Scoring will be delivered by email',
    description:
      'Submit your answers and receive structured feedback via email—no WhatsApp number or extra apps required.',
  },
];

const steps = [
  {
    title: 'Checkout securely',
    description:
      'Pay the small try out fee through Tripay using your favourite Indonesian payment method. Everything is encrypted and fast.',
  },
  {
    title: 'Receive your token',
    description:
      'As soon as Tripay marks the transaction PAID, we send a unique login token to your email inbox. Tokens expire after 14 days.',
  },
  {
    title: 'Take the IELTS try out',
    description:
      'Log in with your token, complete the Listening and Reading modules in real time, and submit to get your scoring by email.',
  },
];

const testimonials = [
  {
    quote:
      '“I felt so much calmer on the real IELTS because the try out showed me which sections to focus on. Totally worth the small fee.”',
    name: 'Rani, aiming for Band 7.5',
  },
  {
    quote:
      '“The practice token gave me two focused weeks to prepare without worrying about wasting the real exam cost.”',
    name: 'Andika, scholarship applicant',
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 pb-20 pt-24 text-white sm:pb-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute -right-12 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_rgba(15,23,42,0))]" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:flex-row lg:items-center lg:gap-20">
          <div className="max-w-xl lg:flex-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200 ring-1 ring-white/20">
              IELTS Try Out
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Experience the IELTS in real time for under 5% of the official fee
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-200">
              Official IELTS registrations in Indonesia start above IDR 3,000,000. This real-time try out costs just IDR 149,000—less than five percent of the real exam—so you can identify your gaps before paying the full price.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">✓</span>
                <span className="text-sm text-slate-200">Listening & Reading try out available now; Writing & Speaking launch coming soon.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">✓</span>
                <span className="text-sm text-slate-200">Scoring will be delivered by email.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">✓</span>
                <span className="text-sm text-slate-200">Token stays active for 14 days after payment confirmation.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">✓</span>
                <span className="text-sm text-slate-200">Secure Tripay payment with instant confirmation updates.</span>
              </li>
            </ul>
            <div className="mt-10 flex flex-col gap-6 rounded-3xl bg-white/5 p-6 shadow-2xl shadow-sky-900/30 ring-1 ring-white/10 backdrop-blur">
              <p className="text-sm text-slate-200">
                Enter your details below to receive a secure payment link via email. As soon as Tripay confirms the transaction, your token arrives in minutes and every update stays in your inbox.
              </p>
              <CheckoutForm
                className="w-full"
                buttonLabel="Start try out checkout"
                buttonClassName="bg-sky-500 hover:bg-sky-400 focus:ring-sky-300"
                inputClassName="border-white/30 bg-white/90 text-slate-900"
              />
              <p className="text-xs text-slate-300">
                We email from our secure server. Keep an eye on your inbox (and spam folder) for the token message.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Tripay payments verified automatically
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-sky-300" />
                Token expires 14 days after PAID status
              </div>
            </div>
          </div>
          <div className="relative lg:flex-1">
            <div className="absolute -left-6 -top-6 hidden h-32 w-32 rounded-3xl border border-white/10 sm:block" />
            <div className="absolute -right-8 top-1/2 hidden h-24 w-24 -translate-y-1/2 rounded-full border border-white/10 sm:block" />
            <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/10 via-white/5 to-white/10 p-10 shadow-2xl shadow-sky-900/40 ring-1 ring-white/15 backdrop-blur">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-slate-300">Try Out Value</p>
                  <p className="mt-3 text-5xl font-semibold text-white">
                    <span className="text-sky-300">IDR 149k</span>
                    <span className="ml-3 text-base font-normal text-slate-300">one-time</span>
                  </p>
                </div>
                <p className="text-sm leading-6 text-slate-200">
                  Compare that to the official IELTS registration fee that sits above <strong className="text-white">IDR 3,000,000</strong>. Investing less than 5% of that amount lets you rehearse with real timers before exam day.
                </p>
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Included</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-100">
                      <li>• IELTS-style Listening & Reading modules with timers</li>
                      <li>• Scoring will be delivered by email</li>
                      <li>• Token login valid for 14 days</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-300">You also get</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-100">
                      <li>• Real-time pacing that mirrors the official exam</li>
                      <li>• Email support throughout your preparation</li>
                      <li>• Early invite for the Writing & Speaking try out launch</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Why take this IELTS try out first?</h2>
            <p className="mt-4 text-lg text-slate-600">
              Our token system lets you practise intensely for two weeks without risking the costly real exam fee. Real-time timers, email-only updates, and a price tag under five percent of the official cost make it effective.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-transparent to-white opacity-0 transition group-hover:opacity-100" />
                <div className="relative">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-2xl text-sky-600">
                    •
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:flex-row lg:items-center">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Three simple steps to your IELTS Try Out</h2>
            <p className="mt-4 text-base text-slate-600">
              Every step is automated so you can focus on practising. From Tripay checkout to login token delivery, everything happens via email.
            </p>
            <div className="mt-10 space-y-8">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-lg font-semibold text-sky-600">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-slate-200 ring-1 ring-slate-100">
              <h3 className="text-xl font-semibold text-slate-900">What you receive</h3>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-600">
                <li>• Instant confirmation page with payment status</li>
                <li>• Email containing your unique token and quick start guide</li>
                <li>• 14 days of access to complete the IELTS try out</li>
                <li>• Scoring will be delivered by email</li>
              </ul>
              <div className="mt-8 rounded-2xl bg-slate-900 px-6 py-5 text-sm text-slate-200">
                <p className="font-semibold text-white">Pro tip</p>
                <p className="mt-2">
                  Start the try out as soon as you receive the token and repeat challenging Listening or Reading sections within the 14-day window to build unstoppable momentum.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr,0.8fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Learners who practised early speak up</h2>
              <p className="mt-4 text-base text-slate-600">
                Real IELTS candidates love how affordable preparation feels with a token-based try out. Their stories can be yours too.
              </p>
              <div className="mt-10 grid gap-6">
                {testimonials.map((testimonial) => (
                  <figure key={testimonial.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-md">
                    <blockquote className="text-base leading-7 text-slate-700">{testimonial.quote}</blockquote>
                    <figcaption className="mt-4 text-sm font-semibold text-slate-900">{testimonial.name}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
            <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-200/40">
              <h3 className="text-2xl font-semibold">Ready to feel confident?</h3>
              <p className="mt-3 text-sm text-slate-200">
                Start today for a fraction of the real exam fee. Pay securely, receive your token instantly after confirmation, and take the try out on your schedule.
              </p>
              <CheckoutForm
                className="mt-8"
                orientation="horizontal"
                buttonLabel="Get my try out token"
                buttonClassName="bg-emerald-500 hover:bg-emerald-400 focus:ring-emerald-300"
                inputClassName="border-transparent bg-white/95"
              />
              <p className="mt-4 text-xs text-slate-300">
                Already have a token?{' '}
                <Link href="/login" className="font-semibold text-white underline underline-offset-4">
                  Log in here
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-20 text-white sm:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:flex-row lg:items-center">
          <div className="lg:w-1/2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200 ring-1 ring-white/20">
              Coming soon
            </span>
            <h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">Writing & Speaking Try Out is in development</h2>
            <p className="mt-4 text-base text-slate-200">
              We are preparing interactive Writing and Speaking tasks so you can complete the full IELTS experience. Join the early interest list and we will contact you as soon as the new try out launches.
            </p>
            <p className="mt-4 text-sm text-slate-300">All follow-ups happen through email—no WhatsApp numbers required.</p>
          </div>
          <div className="lg:w-1/2">
            <div className="rounded-3xl bg-white p-8 text-slate-900 shadow-2xl shadow-slate-950/40 ring-1 ring-slate-200">
              <h3 className="text-xl font-semibold">Want to be first in line?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Leave your name and email so our team can contact you once the Writing & Speaking try out is live.
              </p>
              <InterestForm
                className="mt-6"
                inputClassName="bg-slate-50"
                buttonClassName="bg-emerald-500 hover:bg-emerald-400 focus:ring-emerald-300"
              />
              <p className="mt-4 text-xs text-slate-500">
                We will only use your email to share launch updates for the Writing & Speaking try out.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 py-10 text-sm text-slate-300">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p>© {new Date().getFullYear()} IELTS Try Out. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/buy" className="text-slate-100 transition hover:text-white">
              Buy access
            </Link>
            <Link href="/login" className="text-slate-100 transition hover:text-white">
              Login with token
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
