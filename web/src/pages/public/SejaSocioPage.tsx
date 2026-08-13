import { useState } from 'react';
import { api } from '../../lib/api';
import { fetchCep } from '../../lib/cep';
import { maskCep, maskCpf, maskPhone, maskRg } from '../../lib/masks';
import { PhotoUpload } from '../../components/public/PhotoUpload';
import { SignaturePad } from '../../components/public/SignaturePad';
import { DependentsSection, type DependentDraft } from '../../components/public/DependentsSection';

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const SEXOS = ['Masculino', 'Feminino', 'Outro'];
const ESTADOS_CIVIS = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável', 'Outro'];
const REGIMES = ['CLT — Carteira Assinada', 'Autônomo', 'Estágio', 'Servidor Público', 'Informal', 'Outro'];

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20';

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

function SectionTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 border-b border-slate-200 pb-2">
      <h2 className="text-lg font-bold text-brand-blue">{title}</h2>
      {children}
    </div>
  );
}

interface FormState {
  fullName: string; preferredName: string; birthDate: string; sex: string;
  cpf: string; rg: string; rgIssuer: string; rgIssueDate: string;
  fatherName: string; motherName: string; maritalStatus: string;
  originState: string; originCity: string;
  workRegime: string; company: string; workplace: string; role: string; council: string;
  cep: string; street: string; number: string; neighborhood: string; city: string; state: string; complement: string;
  phone: string; email: string; instagram: string;
}

const emptyForm: FormState = {
  fullName: '', preferredName: '', birthDate: '', sex: '', cpf: '', rg: '', rgIssuer: '',
  rgIssueDate: '', fatherName: '', motherName: '', maritalStatus: '', originState: '', originCity: '',
  workRegime: '', company: '', workplace: '', role: '', council: '',
  cep: '', street: '', number: '', neighborhood: '', city: '', state: '', complement: '',
  phone: '', email: '', instagram: '',
};

export function SejaSocioPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [photo, setPhoto] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [dependents, setDependents] = useState<DependentDraft[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ message: string; id: string } | null>(null);
  const [cepBusy, setCepBusy] = useState(false);

  const set = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const handleCep = async (cep: string) => {
    if (maskCep(cep)?.replace(/\D/g, '')?.length === 8) {
      setCepBusy(true);
      const res = await fetchCep(cep);
      if (res) {
        setForm((f) => ({
          ...f,
          street: res.street || f.street,
          neighborhood: res.neighborhood || f.neighborhood,
          city: res.city || f.city,
          state: res.state || f.state,
        }));
      }
      setCepBusy(false);
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Nome completo é obrigatório';
    if (!form.birthDate) e.birthDate = 'Data de nascimento é obrigatória';
    if (!form.workRegime) e.workRegime = 'Regime trabalhista é obrigatório';
    if (!form.role.trim()) e.role = 'Função/Cargo é obrigatório';
    if (form.cep && form.cep.replace(/\D/g, '').length !== 8) e.cep = 'CEP inválido';
    if (form.phone && form.phone.replace(/\D/g, '').length < 10) e.phone = 'Telefone inválido';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'E-mail inválido';
    if (!signature) e.signature = 'A assinatura é obrigatória. Assine no campo abaixo.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        birthDate: form.birthDate || null,
        rgIssueDate: form.rgIssueDate || null,
        cpf: form.cpf.replace(/\D/g, '') || null,
        rg: form.rg || null,
        phone: form.phone.replace(/\D/g, '') || null,
        cep: form.cep.replace(/\D/g, '') || null,
        photoBase64: photo,
        signatureBase64: signature,
        dependents: dependents.map((d) => ({
          name: d.name,
          birthDate: d.birthDate || null,
          kinship: d.kinship,
          cpf: d.cpf.replace(/\D/g, '') || null,
        })),
      };
      const res = await api.post('/api/associates', payload);
      setSuccess({ message: res.data.message, id: res.data.id });
    } catch (err: any) {
      setSubmitError(err.message || 'Não foi possível enviar o cadastro. Tente novamente.');
      // Não apaga os dados já preenchidos.
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-green-500 text-2xl text-white">✓</div>
          <h1 className="text-2xl font-extrabold text-green-800">Cadastro enviado com sucesso!</h1>
          <p className="mt-3 text-green-700">{success.message}</p>
          <p className="mt-2 text-sm text-green-600">
            Protocolo: <span className="font-mono">{success.id}</span>
          </p>
          <p className="mt-4 text-sm text-green-700">
            Nossa equipe analisará os dados e entrará em contato para finalizar sua filiação.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-brand-blue py-10 text-white">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-3xl font-extrabold">Seja Sócio</h1>
          <p className="mt-2 text-blue-100">Preencha a ficha de inscrição para associar-se ao sindicato.</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <form onSubmit={submit} noValidate>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-extrabold text-slate-800">Cadastro de Afiliado</h2>
              <p className="mt-2 text-sm text-slate-500">
                Os campos marcados com <span className="text-red-500">*</span> são obrigatórios.
              </p>
            </div>

            {/* Foto */}
            <div className="mb-8">
              <SectionTitle title="Foto do Associado">
                <p className="mt-1 text-sm text-slate-500">Tire uma foto ou selecione da galeria.</p>
              </SectionTitle>
              <PhotoUpload onChange={setPhoto} />
            </div>

            {/* Informações gerais */}
            <section className="mb-8">
              <SectionTitle title="Informações Gerais" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome Completo" required error={errors.fullName}>
                  <input className={inputCls} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Nome completo" />
                </Field>
                <Field label="Nome Preferencial">
                  <input className={inputCls} value={form.preferredName} onChange={(e) => set('preferredName', e.target.value)} placeholder="Como prefere ser chamado" />
                </Field>
                <Field label="Data de Nascimento" required error={errors.birthDate}>
                  <input type="date" className={inputCls} value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
                </Field>
                <Field label="Sexo">
                  <select className={inputCls} value={form.sex} onChange={(e) => set('sex', e.target.value)}>
                    <option value="">Selecione</option>
                    {SEXOS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="CPF">
                  <input className={inputCls} value={form.cpf} onChange={(e) => set('cpf', maskCpf(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" />
                </Field>
                <Field label="RG">
                  <input className={inputCls} value={form.rg} onChange={(e) => set('rg', maskRg(e.target.value))} placeholder="RG" />
                </Field>
                <Field label="RG — Órgão Emissor">
                  <input className={inputCls} value={form.rgIssuer} onChange={(e) => set('rgIssuer', e.target.value)} placeholder="Ex.: SSP/DF" />
                </Field>
                <Field label="RG — Data de Expedição">
                  <input type="date" className={inputCls} value={form.rgIssueDate} onChange={(e) => set('rgIssueDate', e.target.value)} />
                </Field>
                <Field label="Nome do Pai">
                  <input className={inputCls} value={form.fatherName} onChange={(e) => set('fatherName', e.target.value)} placeholder="Nome do pai" />
                </Field>
                <Field label="Nome da Mãe">
                  <input className={inputCls} value={form.motherName} onChange={(e) => set('motherName', e.target.value)} placeholder="Nome da mãe" />
                </Field>
                <Field label="Estado Civil">
                  <select className={inputCls} value={form.maritalStatus} onChange={(e) => set('maritalStatus', e.target.value)}>
                    <option value="">Selecione</option>
                    {ESTADOS_CIVIS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Estado de Origem">
                  <select className={inputCls} value={form.originState} onChange={(e) => set('originState', e.target.value)}>
                    <option value="">Selecione</option>
                    {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </Field>
                <Field label="Cidade de Origem">
                  <input className={inputCls} value={form.originCity} onChange={(e) => set('originCity', e.target.value)} placeholder="Cidade de origem" />
                </Field>
              </div>
            </section>

            {/* Profissionais */}
            <section className="mb-8">
              <SectionTitle title="Informações Profissionais" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Regime Trabalhista" required error={errors.workRegime}>
                  <select className={inputCls} value={form.workRegime} onChange={(e) => set('workRegime', e.target.value)}>
                    <option value="">Selecione</option>
                    {REGIMES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Secretaria / Empresa">
                  <input className={inputCls} value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Empresa ou secretaria" />
                </Field>
                <Field label="Local de Trabalho">
                  <input className={inputCls} value={form.workplace} onChange={(e) => set('workplace', e.target.value)} placeholder="Local de trabalho" />
                </Field>
                <Field label="Função / Cargo" required error={errors.role}>
                  <input className={inputCls} value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Função ou cargo" />
                </Field>
                <Field label="Conselho Regional">
                  <input className={inputCls} value={form.council} onChange={(e) => set('council', e.target.value)} placeholder="Ex.: CREA" />
                </Field>
              </div>
            </section>

            {/* Endereço */}
            <section className="mb-8">
              <SectionTitle title="Endereço">
                <p className="mt-1 text-sm text-slate-500">Ao informar um CEP válido, o endereço é preenchido automaticamente.</p>
              </SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="CEP" error={errors.cep}>
                  <div className="relative">
                    <input className={inputCls} value={form.cep} onChange={(e) => { set('cep', maskCep(e.target.value)); if (maskCep(e.target.value).replace(/\D/g, '').length === 8) void handleCep(e.target.value); }} placeholder="00000-000" inputMode="numeric" />
                    {cepBusy && <span className="absolute right-3 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-blue" />}
                  </div>
                </Field>
                <Field label="Logradouro">
                  <input className={inputCls} value={form.street} onChange={(e) => set('street', e.target.value)} placeholder="Rua, avenida..." />
                </Field>
                <Field label="Número">
                  <input className={inputCls} value={form.number} onChange={(e) => set('number', e.target.value)} placeholder="Número" />
                </Field>
                <Field label="Bairro">
                  <input className={inputCls} value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} placeholder="Bairro" />
                </Field>
                <Field label="Cidade">
                  <input className={inputCls} value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Cidade" />
                </Field>
                <Field label="Estado">
                  <select className={inputCls} value={form.state} onChange={(e) => set('state', e.target.value)}>
                    <option value="">Selecione</option>
                    {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </Field>
                <Field label="Complemento">
                  <input className={inputCls} value={form.complement} onChange={(e) => set('complement', e.target.value)} placeholder="Complemento" />
                </Field>
              </div>
            </section>

            {/* Contato */}
            <section className="mb-8">
              <SectionTitle title="Contato" />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Telefone" error={errors.phone}>
                  <input className={inputCls} value={form.phone} onChange={(e) => set('phone', maskPhone(e.target.value))} placeholder="(00) 00000-0000" inputMode="tel" />
                </Field>
                <Field label="E-mail" error={errors.email}>
                  <input type="email" className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="seu@email.com" inputMode="email" autoComplete="email" />
                </Field>
                <Field label="Instagram">
                  <input className={inputCls} value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@usuario" />
                </Field>
              </div>
            </section>

            {/* Dependentes */}
            <section className="mb-8">
              <SectionTitle title="Dependentes" />
              <DependentsSection dependents={dependents} onChange={setDependents} />
            </section>

            {/* Assinatura */}
            <section className="mb-8">
              <SectionTitle title="Assinar ficha de inscrição" />
              <p className="mb-3 text-sm text-slate-500">Assine no campo abaixo:</p>
              <SignaturePad onChange={setSignature} />
              {errors.signature && <p className="mt-2 text-sm font-medium text-red-600">{errors.signature}</p>}
            </section>

            {submitError && <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">{submitError}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-blue py-3 font-bold text-white hover:bg-brand-blueDark disabled:opacity-60"
            >
              {loading ? 'Enviando cadastro…' : 'Enviar Cadastro'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}