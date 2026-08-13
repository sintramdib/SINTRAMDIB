import { maskCpf } from '../../lib/masks';

export interface DependentDraft {
  name: string;
  birthDate: string;
  kinship: string;
  cpf: string;
}

const KINSHIPS = ['Filho(a)', 'Cônjuge', 'Companheiro(a)', 'Enteado(a)', 'Outro'];

interface Props {
  dependents: DependentDraft[];
  onChange: (dependents: DependentDraft[]) => void;
}

function EmptyDependent(): DependentDraft {
  return { name: '', birthDate: '', kinship: '', cpf: '' };
}

export function DependentsSection({ dependents, onChange }: Props) {
  const add = () => onChange([...dependents, EmptyDependent()]);

  const remove = (i: number) => onChange(dependents.filter((_, idx) => idx !== i));

  const patch = (i: number, key: keyof DependentDraft, value: string) =>
    onChange(dependents.map((d, idx) => (idx === i ? { ...d, [key]: value } : d)));

  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">
        Cadastre os dependentes (filhos, cônjuge etc.) que farão parte da associação.
      </p>

      <div className="space-y-4">
        {dependents.map((d, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Dependente {i + 1}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded border border-red-200 px-2.5 py-1 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Remover
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nome completo">
                <input
                  className={inputCls}
                  value={d.name}
                  onChange={(e) => patch(i, 'name', e.target.value)}
                  placeholder="Nome do dependente"
                />
              </Field>
              <Field label="Data de nascimento">
                <input
                  type="date"
                  className={inputCls}
                  value={d.birthDate}
                  onChange={(e) => patch(i, 'birthDate', e.target.value)}
                />
              </Field>
              <Field label="Parentesco">
                <select className={inputCls} value={d.kinship} onChange={(e) => patch(i, 'kinship', e.target.value)}>
                  <option value="">Selecione</option>
                  {KINSHIPS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="CPF">
                <input
                  className={inputCls}
                  value={d.cpf}
                  onChange={(e) => patch(i, 'cpf', maskCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      {dependents.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-400">
          Nenhum dependente adicionado.
        </p>
      )}

      <button
        type="button"
        onClick={add}
        className="mt-4 rounded bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blueDark"
      >
        + Adicionar Dependente
      </button>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}