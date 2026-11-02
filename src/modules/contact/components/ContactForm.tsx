/**
 * CSR ISLAND — form báo giá. Hydrate bằng `client:visible`.
 * Vẫn là <form> HTML chuẩn có `action`, nên khi JS chưa tải xong vẫn gửi được (progressive enhancement).
 */
import { useState, type SubmitEvent } from 'react';
import { actions, isInputError } from 'astro:actions';
import type { ContactFormLabels } from '../i18n';

type Status = 'idle' | 'sending' | 'success' | 'error';

interface Props {
  labels: ContactFormLabels;
  locale: 'vi' | 'en';
}

export default function ContactForm({ labels, locale }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus('sending');
    setFieldErrors({});
    const { error } = await actions.contact(new FormData(form));
    if (error) {
      if (isInputError(error)) setFieldErrors(error.fields);
      setStatus('error');
      return;
    }
    form.reset();
    setStatus('success');
  }

  const err = (name: string) =>
    fieldErrors[name] ? (
      <span id={`${name}-error`} className="mt-1 text-xs text-error">
        {fieldErrors[name]?.[0]}
      </span>
    ) : null;

  const field = 'input w-full';
  const req = <span className="text-primary" aria-label={labels.required}>*</span>;

  return (
    <form method="POST" action={actions.contact} onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" noValidate={false}>
      <input type="hidden" name="locale" value={locale} />
      <div className="hidden" aria-hidden="true">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{labels.name} {req}</span>
        <input className={field} name="name" required minLength={2} maxLength={100} autoComplete="name" aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? 'name-error' : undefined} />
        {err('name')}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{labels.email} {req}</span>
        <input className={field} type="email" name="email" required autoComplete="email" aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? 'email-error' : undefined} />
        {err('email')}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{labels.phone}</span>
        <input className={field} type="tel" name="phone" autoComplete="tel" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{labels.company}</span>
        <input className={field} name="company" autoComplete="organization" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{labels.service}</span>
        <select className="select w-full" name="service" defaultValue={labels.serviceOptions[0]}>
          {labels.serviceOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{labels.budget}</span>
        <select className="select w-full" name="budget" defaultValue={labels.budgetOptions.at(-1)}>
          {labels.budgetOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-sm font-medium">{labels.message} {req}</span>
        <textarea className="textarea h-36 w-full" name="message" required minLength={10} maxLength={5000} aria-invalid={!!fieldErrors.message} aria-describedby={fieldErrors.message ? 'message-error' : undefined} />
        {err('message')}
      </label>
      <label className="flex items-start gap-3 text-sm sm:col-span-2">
        <input type="checkbox" name="consent" className="checkbox checkbox-primary checkbox-sm mt-0.5" required />
        <span>{labels.consent}</span>
      </label>

      <div className="flex flex-col gap-4 sm:col-span-2" aria-live="polite">
        <button type="submit" className="btn btn-primary w-full sm:w-auto sm:self-start" disabled={status === 'sending'}>
          {status === 'sending' && <span className="loading loading-spinner loading-sm" />}
          {status === 'sending' ? labels.sending : labels.submit}
        </button>
        {status === 'success' && <div role="status" className="alert alert-success">{labels.success}</div>}
        {status === 'error' && <div role="alert" className="alert alert-error">{labels.error}</div>}
      </div>
    </form>
  );
}
